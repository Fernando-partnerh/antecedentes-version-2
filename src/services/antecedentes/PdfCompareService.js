function normalizar(texto = "") {
  return texto
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function limpiarRun(run = "") {
  return run.replace(/\./g, "").replace(/\s+/g, "").toUpperCase();
}

function extraerCampo(texto = "", regex) {
  return normalizar(texto.match(regex)?.[1] || "");
}

function extraerIdentidad(texto = "") {
  const t = normalizar(texto);

  return {
    folio: extraerCampo(t, /FOLIO\s*:\s*(\d+)/i),
    codigo: extraerCampo(t, /CODIGO\s*VERIFICACION\s*:?\s*([A-Z0-9]+)/i),
    nombre: extraerCampo(t, /NOMBRE\s*:\s*(.*?)\s+R\.?\s*U\.?\s*N/i),
    run: limpiarRun(extraerCampo(t, /R\.?\s*U\.?\s*N\.?\s*:\s*([\d.-]+)/i))
  };
}

function contarPaginas(texto = "", paginasDetectadas = 1) {
  const t = normalizar(texto);
  const nums = [...t.matchAll(/PAGINA\s+(\d+)/g)]
    .map(m => Number(m[1]))
    .filter(n => !Number.isNaN(n));

  return Math.max(paginasDetectadas || 1, nums.length ? Math.max(...nums) : 1);
}

function contieneAntecedentes(texto = "") {
  const t = normalizar(texto);

  const patronesFuertes = [
    "SENTENCIAS EJECUTORIADAS",
    "SUSPENSION",
    "CAUSA NRO",
    "DELITO",
    "PROCESO NUMERO",
    "INFRACCION",
    "RESOLUCION : MULTA",
    "RESOLUCION: MULTA",
    "MULTA Y SUSPENSION",
    "CONDENADO",
    "PRISION",
    "EBRIEDAD",
    "LICENCIA DE DURACION RESTRINGIDA"
  ];

  return patronesFuertes.some(p => t.includes(p));
}

function declaraSinAntecedentesReal(texto = "") {
  const t = normalizar(texto);

  if (contieneAntecedentes(t)) {
    return false;
  }

  return t.includes("SIN ANTECEDENTES");
}

function extraerTokensAntecedentes(texto = "") {
  const t = normalizar(texto);

  const palabrasClave = [
    "SENTENCIAS",
    "EJECUTORIADAS",
    "SUSPENSION",
    "CAUSA",
    "DELITO",
    "PROCESO",
    "TRIBUNAL",
    "RESOLUCION",
    "MULTA",
    "INFRACCION",
    "CONDENADO",
    "PRISION",
    "EBRIEDAD",
    "LICENCIA",
    "RESTRINGIDA",
    "POLICIA",
    "JUZGADO",
    "GARANTIA"
  ];

  return palabrasClave.filter(p => t.includes(p));
}

function compararAntecedentes(textoSubido = "", textoOficial = "") {
  const tokensSubido = extraerTokensAntecedentes(textoSubido);
  const tokensOficial = extraerTokensAntecedentes(textoOficial);

  const faltantes = tokensOficial.filter(t => !tokensSubido.includes(t));

  return {
    coinciden: faltantes.length === 0,
    faltantes,
    tokensSubido,
    tokensOficial
  };
}

export function compararCertificados(pdfSubido, pdfOficial) {
  const textoSubido = pdfSubido.raw || "";
  const textoOficial = pdfOficial.raw || "";

  const identidadSubido = extraerIdentidad(textoSubido);
  const identidadOficial = extraerIdentidad(textoOficial);

  const paginasSubido = contarPaginas(textoSubido, pdfSubido.paginas);
  const paginasOficial = contarPaginas(textoOficial, pdfOficial.paginas);

  const subidoTieneAntecedentes = contieneAntecedentes(textoSubido);
  const oficialTieneAntecedentes = contieneAntecedentes(textoOficial);

  const subidoSinAntecedentes = declaraSinAntecedentesReal(textoSubido);
  const oficialSinAntecedentes = declaraSinAntecedentesReal(textoOficial);

  const errores = [];
  const advertencias = [];

  if (
    identidadSubido.folio &&
    identidadOficial.folio &&
    identidadSubido.folio !== identidadOficial.folio
  ) {
    errores.push("El folio del PDF subido no coincide con Registro Civil.");
  }

  if (
    identidadSubido.codigo &&
    identidadOficial.codigo &&
    identidadSubido.codigo !== identidadOficial.codigo
  ) {
    errores.push("El código de verificación no coincide con Registro Civil.");
  }

  if (
    identidadSubido.run &&
    identidadOficial.run &&
    identidadSubido.run !== identidadOficial.run
  ) {
    errores.push("El RUN no coincide con Registro Civil.");
  }

  if (
    identidadSubido.nombre &&
    identidadOficial.nombre &&
    identidadSubido.nombre !== identidadOficial.nombre
  ) {
    errores.push("El nombre no coincide con Registro Civil.");
  }

  if (paginasOficial > paginasSubido) {
    errores.push(
      `El PDF subido tiene ${paginasSubido} página(s), pero Registro Civil entrega ${paginasOficial}.`
    );
  }

  if (oficialTieneAntecedentes && subidoSinAntecedentes) {
    errores.push(
      "El PDF subido declara SIN ANTECEDENTES, pero Registro Civil informa antecedentes."
    );
  }

  if (!oficialTieneAntecedentes && subidoTieneAntecedentes) {
    errores.push(
      "El PDF subido contiene antecedentes, pero Registro Civil no informa antecedentes."
    );
  }

  if (oficialTieneAntecedentes && !subidoTieneAntecedentes) {
    errores.push(
      "Registro Civil informa antecedentes, pero el PDF subido no contiene antecedentes."
    );
  }

  let comparacionAntecedentes = null;

  if (oficialTieneAntecedentes && subidoTieneAntecedentes) {
    comparacionAntecedentes = compararAntecedentes(textoSubido, textoOficial);

    if (!comparacionAntecedentes.coinciden) {
      errores.push(
        `Faltan antecedentes o datos críticos en el PDF subido: ${comparacionAntecedentes.faltantes.join(", ")}.`
      );
    }
  }

  if (!oficialTieneAntecedentes && !subidoTieneAntecedentes) {
    if (!oficialSinAntecedentes || !subidoSinAntecedentes) {
      advertencias.push(
        "No se detectaron antecedentes, pero tampoco se detectó claramente la frase SIN ANTECEDENTES en ambos documentos."
      );
    }
  }

  return {
    valido: errores.length === 0,
    adulterado: errores.length > 0,
    errores,
    advertencias,
    revision: {
      identidadSubido,
      identidadOficial,
      paginasSubido,
      paginasOficial,
      subidoTieneAntecedentes,
      oficialTieneAntecedentes,
      subidoSinAntecedentes,
      oficialSinAntecedentes,
      comparacionAntecedentes
    }
  };
}