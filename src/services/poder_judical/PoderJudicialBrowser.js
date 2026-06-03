// src/services/poder_judicial/PoderJudicialBrowser.js

import puppeteer from "puppeteer";

let browserInstance = null;

export class PoderJudicialBrowser {

  static async getBrowser() {

    if (browserInstance) {
      return browserInstance;
    }

    browserInstance = await puppeteer.launch({

      headless: false,

      defaultViewport: null,

      args: [
        "--start-maximized",
        "--no-sandbox",
        "--disable-setuid-sandbox"
      ]
    });

    return browserInstance;
  }
}