// src/services/poder_judicial/PoderJudicialNormalize.js

export class PoderJudicialNormalize {

  static limpiarTexto(texto = "") {

    return texto
      .replace(/\s+/g, " ")
      .trim();
  }

  static normalizarNombre(texto = "") {

    return this.limpiarTexto(texto)
      .toUpperCase();
  }
}