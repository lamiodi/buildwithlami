import pg from 'pg';
const { Pool } = pg;

async function test(connStr) {
    try {
        const pool = new Pool({ connectionString: connStr });
        const res = await pool.query('SELECT NOW()');
        console.log(`✅ SUCCESS with connection string: ${connStr}`);
        await pool.end();
        return true;
    } catch (err) {
        console.log(`❌ FAILED with connection string: ${connStr} - Error: ${err.message}`);
        return false;
    }
}

async function run() {
    const urls = [
        'postgresql://postgres:postgres@localhost:5432/postgres',
        'postgresql://postgres@localhost:5432/postgres',
        'postgresql://postgres:admin@localhost:5432/postgres',
        'postgresql://postgres:123456@localhost:5432/postgres'
    ];
    for (const url of urls) {
        const ok = await test(url);
        if (ok) {
            console.log(`Use this URL: ${url}`);
            process.exit(0);
        }
    }
    console.log("Could not connect with common credentials.");
    process.exit(1);
}

run();
