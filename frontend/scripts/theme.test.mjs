import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import {
  THEME_OVERRIDE_KEY, THEME_WINDOW_KEY, THEME_NOTICE_MS,
  scheduledTheme, nextThemeBoundary, themeWindow, initialTheme,
  createThemeController, themeBootstrapScript
} from '../src/utils/theme.js';

const date = (hour, minute = 0, day = 31) => new Date(2026, 9, day, hour, minute);
const store = (entries = {}) => {
  const values = new Map(Object.entries(entries));
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};
const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };

function harness(start, { storage = store(), session = store(), theme = initialTheme(start, storage, session) } = {}) {
  let time = start.getTime();
  let visible = true;
  let nextId = 0;
  const timers = new Map();
  const states = [];
  const controller = createThemeController({
    theme, storage, session, now: () => new Date(time), canNotify: () => visible,
    onChange: state => states.push(state),
    setTimer: (fn, delay) => { const id = ++nextId; timers.set(id, { fn, at: time + delay }); return id; },
    clearTimer: id => timers.delete(id)
  });
  controller.start();
  return {
    controller, states, storage, session, state: () => states.at(-1),
    setVisible(value) { visible = value; controller.reconcile(); },
    advance(ms) {
      const end = time + ms;
      for (;;) {
        const next = [...timers.entries()].sort((a, b) => a[1].at - b[1].at)[0];
        if (!next || next[1].at > end) break;
        timers.delete(next[0]); time = next[1].at; next[1].fn();
      }
      time = end;
    }
  };
}

test('Local day/night boundaries work at 6am, 6pm and month rollover', () => {
  for (const [hour, minute, expected] of [[5,59,'dark'], [6,0,'light'], [17,59,'light'], [18,0,'dark'], [23,59,'dark']]) {
    assert.equal(scheduledTheme(date(hour, minute)), expected);
    assert.ok(nextThemeBoundary(date(hour, minute)) > date(hour, minute));
  }
  assert.equal(nextThemeBoundary(date(23)).getDate(), 1);
  assert.equal(nextThemeBoundary(date(23)).getMonth(), 10);
});

test('Legacy dark settings and invalid/expired overrides cannot lock daytime into dark mode', () => {
  for (const value of ['dark', '{broken', JSON.stringify({theme:'dark', expiresAt:date(9).getTime()}), JSON.stringify({theme:'dark', expiresAt:date(10,0,33).getTime()})]) {
    const storage = store({ theme: 'dark', [THEME_OVERRIDE_KEY]: value });
    assert.equal(initialTheme(date(10), storage, store()), 'light');
  }
  assert.equal(initialTheme(date(10), blocked, blocked), 'light');
});

test('Night visitors see a notice before dark mode; accepted nights restore without repeating it', () => {
  const h = harness(date(20));
  assert.equal(h.state().isDark, false);
  assert.equal(h.state().notice.theme, 'dark');
  h.advance(THEME_NOTICE_MS - 1);
  assert.equal(h.state().isDark, false);
  h.advance(1);
  assert.equal(h.state().isDark, true);
  assert.equal(h.state().notice, null);
  assert.equal(initialTheme(date(21), h.storage, h.session), 'dark');
  assert.equal(initialTheme(date(7), h.storage, h.session), 'light');
  assert.notEqual(h.session.getItem(THEME_WINDOW_KEY), themeWindow(date(20,0,32)));
});

test('Open tabs announce both scheduled changes without needing a reload', () => {
  const h = harness(date(17,59));
  h.advance(60000);
  assert.equal(h.state().notice.theme, 'dark');
  assert.equal(h.state().isDark, false);
  h.advance(THEME_NOTICE_MS);
  assert.equal(h.state().isDark, true);
  h.advance(12 * 60 * 60000 - THEME_NOTICE_MS);
  assert.equal(h.state().notice.theme, 'light');
  h.advance(THEME_NOTICE_MS);
  assert.equal(h.state().isDark, false);
});

test('Keeping light mode cancels the countdown and expires at the next scheduled change', () => {
  const h = harness(date(20));
  h.controller.keepCurrent();
  h.advance(THEME_NOTICE_MS * 2);
  assert.equal(h.state().isDark, false);
  assert.equal(h.state().notice, null);
  const saved = JSON.parse(h.storage.getItem(THEME_OVERRIDE_KEY));
  assert.equal(saved.expiresAt, nextThemeBoundary(date(20)).getTime());
  h.advance(22 * 60 * 60000 - THEME_NOTICE_MS * 2);
  assert.equal(h.state().notice.theme, 'dark');
});

test('Manual toggle and Switch now cancel stale timers; storage failures remain usable', () => {
  const h = harness(date(20), {storage: blocked, session: blocked});
  h.controller.switchNow();
  assert.equal(h.state().isDark, true);
  h.controller.toggle();
  h.advance(THEME_NOTICE_MS * 2);
  assert.equal(h.state().isDark, false);
  assert.equal(h.state().notice, null);
});

test('Background tabs wait until visible and cleanup cancels pending changes', () => {
  const h = harness(date(20));
  h.setVisible(false);
  h.advance(THEME_NOTICE_MS);
  assert.equal(h.state().isDark, false);
  h.setVisible(true);
  assert.equal(h.state().notice.theme, 'dark');
  h.controller.stop();
  h.advance(THEME_NOTICE_MS * 2);
  assert.equal(h.state().isDark, false);
});

test('A pending night switch is cancelled when daylight begins', () => {
  const h = harness(new Date(date(5,59).getTime() + 55000));
  assert.equal(h.state().notice.theme, 'dark');
  h.advance(5000);
  assert.equal(h.state().notice, null);
  h.advance(THEME_NOTICE_MS);
  assert.equal(h.state().isDark, false);
});

test('A choice made in another tab replaces the previous manual override', () => {
  const h = harness(date(12));
  h.controller.toggle();
  assert.equal(h.state().isDark, true);
  h.storage.setItem(THEME_OVERRIDE_KEY, JSON.stringify({theme:'light', expiresAt:nextThemeBoundary(date(12)).getTime()}));
  h.controller.synchronize();
  assert.equal(h.state().isDark, false);
});

test('The pre-paint script matches the shared policy, including blocked browser storage', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.equal(html.match(/<script id="theme-bootstrap">([\s\S]*?)<\/script>/)[1].trim(), themeBootstrapScript());
  for (const hour of [0,5,6,12,17,18,23]) {
    for (const storage of [store({theme:'dark'}), blocked, store({[THEME_OVERRIDE_KEY]:JSON.stringify({theme:'dark', expiresAt:nextThemeBoundary(date(hour)).getTime()})})]) {
      let applied;
      const session = store({[THEME_WINDOW_KEY]:themeWindow(date(hour))});
      const root = {classList:{toggle: (_, value) => {applied = value ? 'dark' : 'light';}}, style:{}};
      const document = {documentElement:root, querySelector:()=>({setAttribute(){}})};
      const timestamp = date(hour).getTime();
      const FakeDate = class extends Date { constructor(...args) { super(...(args.length ? args : [timestamp])); } };
      vm.runInNewContext(themeBootstrapScript(), {Date:FakeDate, window:{localStorage:storage, sessionStorage:session}, document});
      assert.equal(applied, initialTheme(date(hour), storage, session));
    }
  }
});
