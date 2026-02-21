require('dotenv').config();
const fs = require('fs');
const { pool, initDB } = require('./db');

const SPOTS_FILE = 'spots.json';

async function seedSpots() {
    let spots = [];
    try {
        spots = JSON.parse(fs.readFileSync(SPOTS_FILE, 'utf-8'));
    } catch (e) {
        console.error('Cannot read spots.json. Run create_spots.js first.');
        process.exit(1);
    }

    await initDB();

    const client = await pool.connect();
    try {
        console.log(`\nSeeding ${spots.length} spots into PostgreSQL...`);

        for (const spot of spots) {
            await client.query(
                `INSERT INTO spots (id, name, region, lat, lng)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (id) DO UPDATE SET name=$2, region=$3, lat=$4, lng=$5`,
                [spot.id, spot.name, spot.region, spot.lat, spot.lng]
            );
        }
        console.log(`✔️  ${spots.length} spots seeded successfully.`);

        // Also seed forecast_data.json if it exists
        const FORECAST_FILE = 'forecast_data.json';
        if (fs.existsSync(FORECAST_FILE)) {
            const forecasts = JSON.parse(fs.readFileSync(FORECAST_FILE, 'utf-8'));
            let count = 0;
            for (const [spotId, data] of Object.entries(forecasts)) {
                await client.query(
                    `INSERT INTO forecasts (spot_id, wave_height, wave_period, wave_direction, wind_speed, wind_direction, peak_wave_height, last_updated)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                     ON CONFLICT (spot_id) DO UPDATE SET wave_height=$2, wave_period=$3, wave_direction=$4, wind_speed=$5, wind_direction=$6, peak_wave_height=$7, last_updated=NOW()`,
                    [
                        spotId,
                        data.waveHeight || 0,
                        data.wavePeriod || 0,
                        data.waveDirection || 0,
                        data.windSpeed || 0,
                        data.windDirection || 0,
                        data.peakWaveHeight || 0
                    ]
                );
                count++;
            }
            console.log(`✔️  ${count} forecast entries seeded.`);
        }

        console.log('\n🎉 Seeding complete! You can now start the server.');
    } catch (err) {
        console.error('Seeding error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

seedSpots();
