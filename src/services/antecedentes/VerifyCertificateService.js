import pdf from "pdf-parse";
import fs from "fs";
import path from "path";

import { getBrowser } from "../../utils/browser.js";

function esPdfReal(buffer) {

  if (!buffer || buffer.length < 5)
    return false;

  return buffer
    .slice(0, 5)
    .toString() === "%PDF-";
}

async function extraerTextoPdfBuffer(buffer) {

  if (!esPdfReal(buffer)) {

    throw new Error(
      "La respuesta capturada no es un PDF real, parece HTML."
    );

  }

  const data = await pdf(buffer);

  return {
    raw: data.text || "",
    paginas: data.numpages || 1
  };
}

async function buscarPdfEnPagina(page) {

  const urls = await page.evaluate(() => {

    const elementos = [

      ...document.querySelectorAll("a[href]"),

      ...document.querySelectorAll("iframe[src]"),

      ...document.querySelectorAll("embed[src]"),

      ...document.querySelectorAll("object[data]")

    ];

    return elementos
      .map(el => el.href || el.src || el.data)
      .filter(Boolean);

  });

  for (const url of urls) {

    try {

      const bufferArray =
        await page.evaluate(async pdfUrl => {

          const res = await fetch(pdfUrl, {
            credentials: "include"
          });

          const arrayBuffer =
            await res.arrayBuffer();

          return Array.from(
            new Uint8Array(arrayBuffer)
          );

        }, url);

      const buffer =
        Buffer.from(bufferArray);

      if (esPdfReal(buffer)) {

        return buffer;

      }

    } catch(error) {

      console.log(
        "ERROR PDF:",
        error.message
      );

    }

  }

  return null;
}

export class VerifyCertificateService {

  static async execute(
    folio,
    codigo
  ) {

    const browser =
      await getBrowser();

    const page =
      await browser.newPage();

    let pdfOficialBuffer = null;

    try {

      page.on("response", async response => {

        try {

          const buffer =
            await response.buffer();

          if (esPdfReal(buffer)) {

            pdfOficialBuffer =
              buffer;

          }

        } catch {}

      });

      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
      );

      await page.setViewport({
        width: 1366,
        height: 900
      });

     await page.goto(
  "https://www.registrocivil.cl/OficinaInternet/verificacion/verificacioncertificado.srcei",
  {
    waitUntil: "domcontentloaded",
    timeout: 120000
  }
);

/* ESPERA EXTRA */

await new Promise(resolve =>
  setTimeout(resolve, 8000)
);

      await page.waitForSelector(
        "#ver_inputFolio",
        { timeout: 30000 }
      );

      await page.waitForSelector(
        "#ver_inputCodVerificador",
        { timeout: 30000 }
      );

      await page.click(
        "#ver_inputFolio",
        { clickCount: 3 }
      );

      await page.type(
        "#ver_inputFolio",
        String(folio),
        { delay: 30 }
      );

      await page.click(
        "#ver_inputCodVerificador",
        { clickCount: 3 }
      );

      await page.type(
        "#ver_inputCodVerificador",
        String(codigo),
        { delay: 30 }
      );

      const botones = await page.$$(
        "button, input[type='button'], input[type='submit']"
      );

      let clickRealizado =
        false;

      for (const boton of botones) {

        const textoBoton =
          await page.evaluate(
            el =>
              (
                el.innerText ||
                el.value ||
                ""
              ).toLowerCase(),
            boton
          );

        if (

          textoBoton.includes(
            "consultar"
          )

          ||

          textoBoton.includes(
            "verificar"
          )

          ||

          textoBoton.includes(
            "buscar"
          )

        ) {

          await boton.click();

          clickRealizado =
            true;

          break;

        }

      }

      if (!clickRealizado) {

        throw new Error(
          "No se encontró el botón para consultar el certificado."
        );

      }

      await new Promise(resolve =>
        setTimeout(resolve, 8000)
      );

      const pageText =
        await page.evaluate(
          () => document.body.innerText || ""
        );

      const folioValido =

        pageText.includes(
          "El certificado es válido"
        )

        ||

        pageText
          .toLowerCase()
          .includes("certificado es valido");

      if (!folioValido) {

        return {

          valid: false,

          message:
            "El certificado no fue validado por Registro Civil.",

          officialText: "",

          officialPages: 0

        };

      }

      /* BUSCAR PDF */

      if (!pdfOficialBuffer) {

        pdfOficialBuffer =
          await buscarPdfEnPagina(page);

      }

      if (!pdfOficialBuffer) {

        return {

          valid: false,

          message:
            "No se pudo obtener PDF oficial.",

          officialText: "",

          officialPages: 0

        };

      }

      /* EXTRAER TEXTO */

      const pdfOficial =
        await extraerTextoPdfBuffer(
          pdfOficialBuffer
        );

      /* CREAR TEMP */

      const carpetaTemp =
        path.join("temp");

      fs.mkdirSync(
        carpetaTemp,
        { recursive:true }
      );

      const tempPdfPath =
        path.join(
          carpetaTemp,
          `temp_${Date.now()}.pdf`
        );

      fs.writeFileSync(
        tempPdfPath,
        pdfOficialBuffer
      );

      console.log(
        "PDF TEMP:",
        tempPdfPath
      );

      return {

        valid: true,

        message:
          "Folio y código válidos en Registro Civil.",

        officialText:
          pdfOficial.raw,

        officialPages:
          pdfOficial.paginas,

        tempPdfPath

      };

    } catch (error) {

      return {

        valid: false,

        message:
          error.message,

        officialText: "",

        officialPages: 0

      };

    } finally {

      await page.close();

    }

  }

}