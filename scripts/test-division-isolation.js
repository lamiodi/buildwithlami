// ─── scripts/test-division-isolation.js ────────────────────
// Phase 4 — End-to-end test for division filtering.
// Run with: node scripts/test-division-isolation.js
// ──────────────────────────────────────────────────────────

import http from 'node:http';

const TOKEN = process.argv[2];
if (!TOKEN) {
    console.error('Usage: node scripts/test-division-isolation.js <JWT_TOKEN>');
    process.exit(1);
}

let pass = 0;
let fail = 0;

function get(path) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:4000${path}`, { headers: { Authorization: `Bearer ${TOKEN}` } }, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try { resolve(JSON.parse(body)); }
                catch (e) { reject(new Error('Bad JSON: ' + body.substring(0, 200))); }
            });
        }).on('error', reject);
    });
}

function check(name, ok) {
    if (ok) { console.log(`  PASS: ${name}`); pass++; }
    else { console.log(`  FAIL: ${name}`); fail++; }
}

async function main() {
    console.log('========== DIVISION ISOLATION TESTS ==========\n');

    console.log('--- CMS Pages ---');
    for (const div of ['SOFTWARE', 'SURVEY', 'DRONE']) {
        const data = await get(`/api/cms/pages?status=all&division=${div}`);
        const match = data.filter(p => p.division === div);
        const wrong = data.filter(p => p.division !== div);
        check(
            `Pages ${div} filter returns only ${div} (match=${match.length}, wrong=${wrong.length})`,
            match.length >= 1 && wrong.length === 0
        );
    }

    console.log('\n--- Testimonials ---');
    for (const div of ['SOFTWARE', 'SURVEY', 'DRONE']) {
        const data = await get(`/api/cms/testimonials?division=${div}`);
        const match = data.filter(t => t.division === div);
        const wrong = data.filter(t => t.division !== div);
        check(
            `Testimonials ${div} filter returns only ${div} (match=${match.length}, wrong=${wrong.length})`,
            match.length >= 1 && wrong.length === 0
        );
    }

    console.log('\n--- All Divisions (no filter) ---');
    const allPages = await get('/api/cms/pages?status=all');
    const allTests = await get('/api/cms/testimonials');
    check(`All pages = 3 (got ${allPages.length})`, allPages.length === 3);
    check(`All testimonials = 3 (got ${allTests.length})`, allTests.length === 3);

    console.log('\n========== RESULTS ==========');
    console.log(`  Passed: ${pass}`);
    console.log(`  Failed: ${fail}`);
    console.log('============================');
    if (fail === 0) console.log('ALL DIVISION ISOLATION TESTS PASSED!');
    process.exit(fail === 0 ? 0 : 1);
}

main().catch(e => { console.error('Test error:', e); process.exit(1); });
