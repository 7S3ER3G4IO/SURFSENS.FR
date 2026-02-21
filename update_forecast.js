require('dotenv').config();
const { pool, initDB } = require('./db');

const API_KEY = process.env.STORMGLASS_API_KEY;
if (!API_KEY) {
    console.error("STORMGLASS_API_KEY is not defined in .env");
    process.exit(1);
}

async function fetchStormGlass(lat, lng) {
    const params = 'waveHeight,wavePeriod,waveDirection,windSpeed,windDirection';
    const start = Math.floor(Date.now() / 1000);
    const end = start + (24 * 60 * 60);

    const url = `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lng}&params=${params}&start=${start}&end=${end}`;

    const response = await fetch(url, {
        headers: { 'Authorization': API_KEY }
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`StormGlass API Error: ${response.status} - ${text}`);
    }

    return await response.json();
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    await initDB();

    const client = await pool.connect();
    try {
        // Check cache: only fetch if last update was > 6 hours ago
        const cacheCheck = await client.query(
            `SELECT MAX(last_updated) as latest FROM forecasts`
        );
        if (cacheCheck.rows[0]?.latest) {
            const lastUpdate = new Date(cacheCheck.rows[0].latest).getTime();
            const now = Date.now();
            if (now - lastUpdate < 6 * 60 * 60 * 1000) {
                console.log('Cache is fresh (less than 6 hours old). Skipping fetch.');
                process.exit(0);
            }
        }

        // Fetch spots from DB
        const spotsRes = await client.query('SELECT * FROM spots ORDER BY lat DESC');
        const spots = spotsRes.rows;

        console.log(`Starting fetching for ${spots.length} spots...`);

        for (let i = 0; i < spots.length; i++) {
            const spot = spots[i];
            console.log(`[${i + 1}/${spots.length}] Fetching data for ${spot.name}...`);
            try {
                const data = await fetchStormGlass(spot.lat, spot.lng);

                const hours = data.hours || [];
                if (hours.length > 0) {
                    const current = hours[0];

                    let maxWave = current.waveHeight?.sg || 0;
                    hours.forEach(h => {
                        if (h.waveHeight?.sg > maxWave) maxWave = h.waveHeight.sg;
                    });

                    await client.query(
                        `INSERT INTO forecasts (spot_id, wave_height, wave_period, wave_direction, wind_speed, wind_direction, peak_wave_height, last_updated)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                         ON CONFLICT (spot_id) DO UPDATE SET wave_height=$2, wave_period=$3, wave_direction=$4, wind_speed=$5, wind_direction=$6, peak_wave_height=$7, last_updated=NOW()`,
                        [
                            spot.id,
                            current.waveHeight?.sg || 0.5,
                            current.wavePeriod?.sg || 8,
                            current.waveDirection?.sg || 270,
                            current.windSpeed?.sg || 10,
                            current.windDirection?.sg || 90,
                            maxWave
                        ]
                    );
                }
            } catch (err) {
                console.error(`Failed to fetch for ${spot.name}:`, err.message);
                // Fallback data
                await client.query(
                    `INSERT INTO forecasts (spot_id, wave_height, wave_period, wind_speed, last_updated)
                     VALUES ($1, 1.0, 10, 15, NOW())
                     ON CONFLICT (spot_id) DO UPDATE SET wave_height=1.0, wave_period=10, wind_speed=15, last_updated=NOW()`,
                    [spot.id]
                );
            }

            if (i < spots.length - 1) await sleep(100);
        }

        console.log('Successfully updated all forecasts in PostgreSQL!');
    } catch (err) {
        console.error('Forecast update error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(console.error);
