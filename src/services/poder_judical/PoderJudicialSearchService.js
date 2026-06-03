// src/services/poder_judicial/PoderJudicialSearchService.js

import { PoderJudicialBrowser }
from "./PoderJudicialBrowser.js";

import { COMPETENCIAS, URL_PJUD }
from "./PoderJudicialConstants.js";

export class PoderJudicialSearchService {

  static async buscar({
    nombre,
    paterno,
    materno
  }) {

    const browser =
      await PoderJudicialBrowser.getBrowser();

    const page =
      await browser.newPage();

    await page.goto(URL_PJUD, {
      waitUntil: "networkidle2"
    });

    const resultadosFinales = [];

    for (const competencia of COMPETENCIAS) {

      console.log(
        `Buscando en ${competencia.nombre}`
      );

      await page.waitForTimeout(1500);

      // INPUTS
      await page.evaluate(() => {

        const limpiar = selector => {

          const el =
            document.querySelector(selector);

          if (el) el.value = "";
        };

        limpiar("input[name='NOM_Consulta']");
        limpiar("input[name='APE_Paterno']");
        limpiar("input[name='APE_Materno']");
      });

      await page.type(
        "input[name='NOM_Consulta']",
        nombre
      );

      await page.type(
        "input[name='APE_Paterno']",
        paterno
      );

      await page.type(
        "input[name='APE_Materno']",
        materno
      );

      // COMPETENCIA
      await page.select(
        "select[name='TIP_Causa']",
        competencia.valor
      );

      // TODAS LAS CORTES
      await page.select(
        "select[name='COD_Corte']",
        ""
      );

      // TODOS LOS TRIBUNALES
      await page.select(
        "select[name='COD_Tribunal']",
        ""
      );

      // BUSCAR
      await Promise.all([

        page.click("#btnConConsulta"),

        page.waitForNavigation({
          waitUntil: "networkidle2"
        })
      ]);

      await page.waitForTimeout(3000);

      const resultados =
        await page.evaluate(() => {

          const filas =
            document.querySelectorAll(
              "table tbody tr"
            );

          return [...filas].map(fila => {

            const td =
              fila.querySelectorAll("td");

            return {

              rol: td[0]?.innerText || "",
              tribunal: td[1]?.innerText || "",
              caratula: td[2]?.innerText || "",
              fecha: td[3]?.innerText || ""
            };
          });
        });

      resultadosFinales.push({

        competencia:
          competencia.nombre,

        resultados
      });

      // volver
      await page.goto(URL_PJUD, {
        waitUntil: "networkidle2"
      });
    }

    await page.close();

    return resultadosFinales;
  }
}