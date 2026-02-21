require('dotenv').config();
const fs = require('fs');

const API_KEY = process.env.STORMGLASS_API_KEY;
if (!API_KEY) {
    console.error("STORMGLASS_API_KEY is not defined in .env");
    process.exit(1);
}

const SPOTS_FILE = 'spots.json';
const FORECAST_FILE = 'forecast_data.json';

// Caching configuration: Only fetch if forecast_data.json is older than 6 hours
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000;

async function checkCache() {
    if (fs.existsSync(FORECAST_FILE)) {
        const stats = fs.statSync(FORECAST_FILE);
        const now = new Date().getTime();
        if (now - stats.mtime.getTime() < CACHE_DURATION_MS) {
            console.log(`Cache is fresh (less than 6 hours old). Skipping fetch to protect API limits.`);
            // Still need to exit cleanly
            process.exit(0);
        }
    }
}

async function fetchStormGlass(lat, lng) {
    // We request waveHeight, wavePeriod, waveDirection, windSpeed, windDirection
    const params = 'waveHeight,wavePeriod,waveDirection,windSpeed,windDirection';

    // Fetch current UTC time instead of default large range, and only next 24h
    const start = Math.floor(Date.now() / 1000);
    const end = start + (24 * 60 * 60);

    const url = `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lng}&params=${params}&start=${start}&end=${end}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': API_KEY
        }
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`StormGlass API Error: ${response.status} - ${text}`);
    }

    return await response.json();
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    await checkCache();

    let spots = [];
    try {
        spots = JSON.parse(fs.readFileSync(SPOTS_FILE, 'utf-8'));
    } catch (err) {
        console.error("Could not read spots.json");
        process.exit(1);
    }

    const results = {};

    console.log(`Starting fetching for ${spots.length} spots...`);

    for (let i = 0; i < spots.length; i++) {
        const spot = spots[i];
        console.log(`[${i + 1}/${spots.length}] Fetching data for ${spot.name}...`);
        try {
            const data = await fetchStormGlass(spot.lat, spot.lng);

            // Simplify data payload to keep forecast_data.json small
            // We take current hour conditions (index 0) and the peak (max waveHeight)
            const hours = data.hours || [];
            if (hours.length > 0) {
                const current = hours[0];

                // Find best period
                let maxWave = current.waveHeight?.sg || 0;
                hours.forEach(h => {
                    if (h.waveHeight?.sg > maxWave) maxWave = h.waveHeight.sg;
                });

                results[spot.id] = {
                    waveHeight: current.waveHeight?.sg || 0.5,
                    wavePeriod: current.wavePeriod?.sg || 8,
                    waveDirection: current.waveDirection?.sg || 270,
                    windSpeed: current.windSpeed?.sg || 10,
                    windDirection: current.windDirection?.sg || 90,
                    peakWaveHeight: maxWave,
                    lastUpdated: new Date().toISOString()
                };
            }
        } catch (err) {
            console.error(`Failed to fetch for ${spot.name}:`, err.message);
            // Fallback dummy data if API fails to avoid breaking
            results[spot.id] = { waveHeight: 1.0, wavePeriod: 10, windSpeed: 15, error: "API Failed" };
        }

        // Crucial: sleep slightly to respect rate limits
        if (i < spots.length - 1) {
            await sleep(100);
        }
    }

    fs.writeFileSync(FORECAST_FILE, JSON.stringify(results, null, 2));
    console.log('Successfully updated forecast_data.json with all spots!');
}

main().catch(console.error);
