require('dotenv').config();
const { Pool } = require('pg');

const isExternal = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('.render.com');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isExternal ? { rejectUnauthorized: false } : false
});

async function initDB() {
    const client = await pool.connect();
    try {
        console.log('🔌 Connected to PostgreSQL on Render.');

        // 1. SPOTS table
        await client.query(`
            CREATE TABLE IF NOT EXISTS spots (
                id VARCHAR(100) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                region VARCHAR(255) NOT NULL,
                lat DOUBLE PRECISION NOT NULL,
                lng DOUBLE PRECISION NOT NULL
            );
        `);
        console.log('✔️  Table "spots" ready.');

        // 2. FORECASTS table
        await client.query(`
            CREATE TABLE IF NOT EXISTS forecasts (
                spot_id VARCHAR(100) PRIMARY KEY REFERENCES spots(id) ON DELETE CASCADE,
                wave_height DOUBLE PRECISION,
                wave_period DOUBLE PRECISION,
                wave_direction DOUBLE PRECISION,
                wind_speed DOUBLE PRECISION,
                wind_direction DOUBLE PRECISION,
                peak_wave_height DOUBLE PRECISION,
                last_updated TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✔️  Table "forecasts" ready.');

        // 3. LIVE_STREAM table (latest snapshot per spot)
        await client.query(`
            CREATE TABLE IF NOT EXISTS live_stream (
                spot_id VARCHAR(100) PRIMARY KEY REFERENCES spots(id) ON DELETE CASCADE,
                wave_height DOUBLE PRECISION,
                wave_period DOUBLE PRECISION,
                wind_speed DOUBLE PRECISION,
                reliability VARCHAR(10) DEFAULT '100.00',
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✔️  Table "live_stream" ready.');

        // 4. LIVE_META table (single row for global system status)
        await client.query(`
            CREATE TABLE IF NOT EXISTS live_meta (
                id INTEGER PRIMARY KEY DEFAULT 1,
                timestamp TIMESTAMPTZ DEFAULT NOW(),
                active_robots INTEGER DEFAULT 124,
                global_reliability VARCHAR(10) DEFAULT '100.00',
                update_frequency_ms INTEGER DEFAULT 1000,
                system_status VARCHAR(50) DEFAULT 'OPTIMAL'
            );
        `);
        // Insert default row if none exists
        await client.query(`
            INSERT INTO live_meta (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
        `);
        console.log('✔️  Table "live_meta" ready.');

        // 5. USERS table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                status VARCHAR(50) DEFAULT 'Active'
            );
        `);
        console.log('✔️  Table "users" ready.');

        console.log('\n🎉 Database initialization complete!');
    } catch (err) {
        console.error('❌ Database init failed:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

module.exports = { pool, initDB };
