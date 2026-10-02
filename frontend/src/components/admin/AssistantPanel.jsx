import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

// ─── AssistantPanel (Admin OS Phase 6 — Intelligence) ─────
// Two things in one card:
//   • Workload strip (§31) — weekly available vs committed
//     hours and concurrent-build headroom, from
//     GET /api/intelligence/workload.
//   • "Ask your data" NL assistant (§101) — POST
//     /api/intelligence/assistant. Deterministic intents answer
//     from live queries; the AI path (when configured) narrates
//     the same data. Every answer states its source.
// ──────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'What needs my attention?',
  'Who owes me money?',
  "What's on tonight's queue?",
  'Which leads need follow-up?',
  'What renewals are coming up?',
];

const fmtHours = (h) => (h === null || h === undefined ? '—' : `${Number(h)}h`);

const SourceBadge = ({ source }) => source === 'ai'
  ? <span className="text-[9px] font-extrabold uppercase tracking-widest bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-1.5 py-0.5 rounded">AI</span>
  : <span className="text-[9px] font-extrabold uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">Live data</span>;

const AssistantPanel = () => {
  const [workload, setWorkload] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [busy, setBusy] = useState(false);
  const answerRef = useRef(null);

  useEffect(() => {
    let alive = true;
    api.get('/intelligence/workload').then((res) => {
      if (alive && res.ok && res.data) setWorkload(res.data);
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const ask = useCallback(async (q) => {
    const text = (q ?? question).trim();
    if (!text || busy) return;
    setBusy(true);
    setAnswer({ pending: true, question: text });
    const res = await api.post('/intelligence/assistant', { question: text });
    if (res.ok && res.data) {
      setAnswer(res.data);
    } else {
      setAnswer({ source: 'help', answer: res.error || 'The assistant is unavailable right now.' });
    }
    setBusy(false);
    // Let React paint the answer before scrolling to it.
    setTimeout(() => answerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }, [question, busy]);

  const chips = workload ? [
    { label: 'Available this week', value: fmtHours(workload.weeklyAvailableHours) },
    { label: 'Committed', value: fmtHours(workload.committedHours) },
    { label: 'Remaining', value: fmtHours(workload.remainingHours), hot: workload.overCommitted },
    { label: 'Active builds', value: `${workload.activeBuilds}/${workload.maxConcurrentBuilds}`, hot: workload.atBuildCapacity },
  ] : [];

  return (
    <div className="mb-6 bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm p-5">
      {/* Workload strip */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mr-1">Workload</h3>
        {chips.length === 0 && (
          <span className="text-xs text-gray-400 font-body">Loading plan…</span>
        )}
        {chips.map((c) => (
          <span key={c.label}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl font-body border ${
              c.hot
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-300'
                : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200'
            }`}>
            {c.label}: <span className="font-extrabold">{c.value}</span>
          </span>
        ))}
      </div>

      {/* Ask box */}
      <form
        onSubmit={(e) => { e.preventDefault(); ask(); }}
        className="flex items-center gap-2"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your data — e.g. “who owes me money?”"
          aria-label="Ask the admin assistant"
          className="flex-1 min-w-0 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body"
        />
        <button
          type="submit"
          disabled={busy || !question.trim()}
          className="shrink-0 bg-accent hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          {busy ? 'Thinking…' : 'Ask'}
        </button>
      </form>

      {/* Answer */}
      {answer && (
        <div ref={answerRef} className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-3" aria-live="polite">
          {answer.pending ? (
            <p className="text-sm text-gray-400 font-body animate-pulse">Looking that up…</p>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1.5">
                <SourceBadge source={answer.source} />
                {answer.link && (
                  <Link to={answer.link} className="text-[10px] font-extrabold uppercase tracking-widest text-accent hover:text-orange-600">
                    Open →
                  </Link>
                )}
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-100 font-body whitespace-pre-wrap leading-relaxed">
                {answer.answer}
              </p>
              {answer.source === 'help' && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setQuestion(s); ask(s); }}
                      className="text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-accent/40 rounded-full px-3 py-1 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AssistantPanel;
