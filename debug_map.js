const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://127.0.0.1:8080/index.html');
    
    // waiting for map to load
    await page.waitForTimeout(3000);
    
    // Evaluate if marker cluster is working
    const clusterCount = await page.evaluate(() => {
        return document.querySelectorAll('.marker-cluster-custom').length;
    });
    console.log('Number of clusters found:', clusterCount);
    
    await page.screenshot({path: 'debug_map.png'});
    await browser.close();
})();
