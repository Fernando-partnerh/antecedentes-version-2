import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

let browserInstance = null;

export async function getBrowser() {

  if (!browserInstance) {

    browserInstance = await puppeteer.launch({
      headless: "new", // 🔥 no abre ventana
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ],
      defaultViewport: null
    });

  }

  return browserInstance;
}