const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/get-weight', async (req, res) => {
  const { awb } = req.body;

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    await page.goto(`https://www.fedex.com/fedextrack/?trknbr=${awb}`, { waitUntil: 'networkidle2' });

    // Click "View more details"
    await page.waitForSelector('a[data-automation="viewMoreDetails"]', { timeout: 10000 });
    await page.click('a[data-automation="viewMoreDetails"]');

    await page.waitForSelector('div[data-automation="packageWeight"]', { timeout: 10000 });

    const weight = await page.$eval('div[data-automation="packageWeight"]', el => el.innerText);

    res.json({ weight });
  } catch (error) {
    console.error(error);
    res.json({ weight: null });
  } finally {
    await browser.close();
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
