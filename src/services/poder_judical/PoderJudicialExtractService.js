// src/services/poder_judicial/PoderJudicialExtractService.js

export class PoderJudicialExtractService {

  static resumir(resultados = []) {

    const resumen = {

      civil: [],
      laboral: [],
      penal: []
    };

    for (const bloque of resultados) {

      const nombre =
        bloque.competencia.toLowerCase();

      if (nombre.includes("civil")) {
        resumen.civil = bloque.resultados;
      }

      if (nombre.includes("laboral")) {
        resumen.laboral = bloque.resultados;
      }

      if (nombre.includes("penal")) {
        resumen.penal = bloque.resultados;
      }
    }

    return resumen;
  }
}