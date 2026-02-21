const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Catch console logs
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    await page.goto('http://127.0.0.1:8080/index.html');
    await page.waitForTimeout(1000);
    
    // Log initial allSpots size
    const allSpotsLen = await page.evaluate(() => {
        return window.allSpots ? window.allSpots.length : 'not global';
    });
    console.log('allSpots state:', allSpotsLen);
    
    // Type in the search box
    await page.type('#hero-search-input', 'Lacanau', { delay: 100 });
    await page.waitForTimeout(1000);
    
    // Check if dropdown has children
    const resultsCount = await page.evaluate(() => {
        const res = document.getElementById('hero-search-results');
        return res ? res.children.length : -1;
    });
    console.log('Results rendered in dropdown:', resultsCount);
    
    await browser.close();
})();
