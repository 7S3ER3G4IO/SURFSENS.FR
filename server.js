require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { pool, initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Couleurs ANSI ──
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const WHITE = '\x1b[37m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const MAGENTA = '\x1b[35m';
const BLUE = '\x1b[34m';

function ts() {
    return `${DIM}${new Date().toLocaleTimeString('fr-FR', { hour12: false })}${RESET}`;
}

// ── Compteur de requêtes ──
let reqCount = 0;

app.use(cors());
app.use(express.json());

// ── Middleware de logging des requêtes API ──
app.use('/api', (req, res, next) => {
    reqCount++;
    const start = Date.now();
    const method = req.method;
    const url = req.originalUrl;

    const methodColors = { GET: GREEN, POST: YELLOW, PUT: BLUE, DELETE: RED };
    const mColor = methodColors[method] || WHITE;

    // Log entrée
    console.log(`${ts()} 🌐 ${mColor}${BOLD}${method}${RESET} ${WHITE}${url}${RESET} ${DIM}(req #${reqCount})${RESET}`);

    // Intercepter la fin de réponse pour le temps de réponse
    const originalEnd = res.end;
    res.end = function (...args) {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const statusColor = status < 300 ? GREEN : status < 400 ? YELLOW : RED;
        console.log(`${ts()} 📤 ${statusColor}${status}${RESET} ${WHITE}${url}${RESET} ${DIM}(${duration}ms)${RESET}`);
        originalEnd.apply(res, args);
    };

    next();
});

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
        console.log(`${ts()} 🗺️  ${CYAN}SPOTS${RESET} → ${result.rowCount} spots chargés depuis PostgreSQL`);
        res.json(result.rows);
    } catch (err) {
        console.log(`${ts()} ❌ ${RED}ERREUR SPOTS: ${err.message}${RESET}`);
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
        console.log(`${ts()} 🌤️  ${BLUE}FORECASTS${RESET} → ${result.rowCount} prévisions StormGlass servies`);
        res.json(obj);
    } catch (err) {
        console.log(`${ts()} ❌ ${RED}ERREUR FORECASTS: ${err.message}${RESET}`);
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
        console.log(`${ts()} ❌ ${RED}ERREUR LIVE STREAM: ${err.message}${RESET}`);
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

        console.log(`${ts()} 👤 ${MAGENTA}NOUVEL UTILISATEUR${RESET} → ${BOLD}${name || 'Utilisateur'}${RESET} (${email})`);
        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.log(`${ts()} ❌ ${RED}ERREUR USER: ${err.message}${RESET}`);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /api/users — List all users (for admin)
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, created_at, status FROM users ORDER BY created_at DESC');
        console.log(`${ts()} 👥 ${MAGENTA}USERS${RESET} → ${result.rowCount} utilisateurs récupérés (admin)`);
        res.json(result.rows);
    } catch (err) {
        console.log(`${ts()} ❌ ${RED}ERREUR USERS: ${err.message}${RESET}`);
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
    console.log('');
    console.log(`${CYAN}${BOLD}╔══════════════════════════════════════════════════════════════════╗${RESET}`);
    console.log(`${CYAN}${BOLD}║                                                                  ║${RESET}`);
    console.log(`${CYAN}${BOLD}║   🖥️   SWELLSYNC — SERVEUR EXPRESS                              ║${RESET}`);
    console.log(`${CYAN}${BOLD}║   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                       ║${RESET}`);
    console.log(`${CYAN}${BOLD}║   Mode : Production                                             ║${RESET}`);
    console.log(`${CYAN}${BOLD}║   API : /api/spots, /api/forecasts, /api/live, /api/users       ║${RESET}`);
    console.log(`${CYAN}${BOLD}║                                                                  ║${RESET}`);
    console.log(`${CYAN}${BOLD}╚══════════════════════════════════════════════════════════════════╝${RESET}`);
    console.log('');

    // Init database tables
    console.log(`${ts()} 🔌 ${YELLOW}Connexion à PostgreSQL...${RESET}`);
    await initDB();
    console.log(`${ts()} ✅ ${GREEN}Base de données initialisée avec succès${RESET}`);
    console.log('');

    // Start the live buoy computation loop (writes to DB every 2s)
    console.log(`${ts()} 🤖 ${YELLOW}Chargement du moteur de calcul live...${RESET}`);
    require('./live_buoy_db');

    app.listen(PORT, () => {
        console.log('');
        console.log(`${ts()} ${BOLD}${GREEN}════════════════════════════════════════════${RESET}`);
        console.log(`${ts()} ${BOLD}${GREEN}  🌊 SWELLSYNC OPÉRATIONNEL — PORT ${PORT}${RESET}`);
        console.log(`${ts()} ${BOLD}${GREEN}  → http://localhost:${PORT}${RESET}`);
        console.log(`${ts()} ${BOLD}${GREEN}════════════════════════════════════════════${RESET}`);
        console.log('');
        console.log(`${ts()} 📡 En attente de requêtes...`);
        console.log(`${DIM}${'─'.repeat(72)}${RESET}`);
    });
}

startServer().catch(err => {
    console.error(`${ts()} ${RED}${BOLD}FATAL: ${err.message}${RESET}`);
    process.exit(1);
});
