require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { pool, initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve all static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname), {
    extensions: ['html'],
    index: 'index.html'
}));

// ============================
// API ROUTES
// ============================

// GET /api/spots — Returns all spots
app.get('/api/spots', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, region, lat, lng FROM spots ORDER BY lat DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching spots:', err.message);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /api/forecasts — Returns all forecast data keyed by spot_id
app.get('/api/forecasts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM forecasts');
        const obj = {};
        result.rows.forEach(row => {
            obj[row.spot_id] = {
                waveHeight: row.wave_height,
                wavePeriod: row.wave_period,
                waveDirection: row.wave_direction,
                windSpeed: row.wind_speed,
                windDirection: row.wind_direction,
                peakWaveHeight: row.peak_wave_height,
                lastUpdated: row.last_updated
            };
        });
        res.json(obj);
    } catch (err) {
        console.error('Error fetching forecasts:', err.message);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /api/live — Returns full live_stream.json equivalent
app.get('/api/live', async (req, res) => {
    try {
        const [metaRes, spotsRes] = await Promise.all([
            pool.query('SELECT * FROM live_meta WHERE id = 1'),
            pool.query('SELECT * FROM live_stream')
        ]);

        const meta = metaRes.rows[0] || {};
        const spots = {};
        spotsRes.rows.forEach(row => {
            spots[row.spot_id] = {
                waveHeight: row.wave_height?.toFixed(2),
                wavePeriod: row.wave_period,
                windSpeed: row.wind_speed?.toFixed(1),
                reliability: row.reliability
            };
        });

        res.json({
            _meta: {
                timestamp: meta.timestamp || new Date().toISOString(),
                activeRobots: meta.active_robots || 124,
                globalReliability: meta.global_reliability || '100.00',
                updateFrequencyMs: meta.update_frequency_ms || 1000,
                systemStatus: meta.system_status || 'OPTIMAL'
            },
            spots
        });
    } catch (err) {
        console.error('Error fetching live stream:', err.message);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST /api/users — Register or login user
app.post('/api/users', async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const result = await pool.query(
            `INSERT INTO users (name, email) VALUES ($1, $2)
             ON CONFLICT (email) DO UPDATE SET name = COALESCE(NULLIF($1, ''), users.name)
             RETURNING *`,
            [name || 'Utilisateur', email]
        );

        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.error('Error saving user:', err.message);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /api/users — List all users (for admin)
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, created_at, status FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err.message);
        res.status(500).json({ error: 'Database error' });
    }
});

// Catch-all: serve index.html for any unmatched route
app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================
// START SERVER + LIVE ENGINE
// ============================

async function startServer() {
    await initDB();

    // Start the live buoy computation loop (writes to DB every second)
    require('./live_buoy_db');

    app.listen(PORT, () => {
        console.log(`\n🌊 SWELLSYNC server running on port ${PORT}`);
        console.log(`   → http://localhost:${PORT}`);
    });
}

startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
