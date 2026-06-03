import express from "express";
import multer from "multer";
import fs from "fs";

import { PdfExtractorService } from "../services/antecedentes/PdfExtractorService.js";
import { VerifyCertificateService } from "../services/antecedentes/VerifyCertificateService.js";
import { CertificateDateValidator } from "../services/antecedentes/CertificateDateValidator.js";
import { compararCertificados } from "../services/antecedentes/PdfCompareService.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/"
});

/* NORMALIZAR DOCUMENTO */

function normalizarTipoDocumento(nombre){

  const texto =
    nombre.toLowerCase();

  if(texto.includes("antecedentes")){
    return "antecedentes";
  }

  if(texto.includes("hoja de vida")){
    return "hoja_vida";
  }

  if(texto.includes("matrimonio")){
    return "matrimonio";
  }

  if(texto.includes("nacimiento")){
    return "nacimiento";
  }

  return "documento";
}

router.post(
  "/",
  upload.single("file"),
  async (req, res) => {

    try {

      if (!req.file) {

        return res.json({
          valid: false,
          adulterado: null,
          message: "No se subió ningún PDF."
        });

      }

      /* PDF SUBIDO */

      const pdfSubido =
        await PdfExtractorService.extract(
          req.file.path
        );

      if (
        !pdfSubido.folio ||
        !pdfSubido.codigo
      ) {

        return res.json({
          valid: false,
          adulterado: null,
          message:
            "No se pudo extraer folio o código del PDF."
        });

      }

      /* VALIDAR FECHA */

      const dateValidation =
        CertificateDateValidator.validate(
          pdfSubido.fecha
        );

      if (!dateValidation.valid) {

        return res.json({
          valid: false,
          adulterado: null,
          message:
            `Documento vencido (${dateValidation.diff} días).`
        });

      }

      /* REGISTRO CIVIL */

      const registroCivil =
        await VerifyCertificateService.execute(
          pdfSubido.folio,
          pdfSubido.codigo
        );

      if (!registroCivil.valid) {

        return res.json({
          valid: false,
          adulterado: null,
          message:
            registroCivil.message,
          folio:
            pdfSubido.folio,
          codigo:
            pdfSubido.codigo
        });

      }

      if (
        !registroCivil.officialText ||
        registroCivil.officialText.length < 500
      ) {

        return res.json({
          valid: false,
          adulterado: null,
          message:
            "No se pudo leer el PDF oficial de Registro Civil.",
          folio:
            pdfSubido.folio,
          codigo:
            pdfSubido.codigo
        });

      }

      /* PDF OFICIAL */

      const pdfOficial = {

        raw:
          registroCivil.officialText,

        paginas:
          registroCivil.officialPages || 1

      };

      /* COMPARAR */

      const comparacion =
        compararCertificados(
          pdfSubido,
          pdfOficial
        );

      /* EXTRAER RUN */

      const matchRun =
        registroCivil.officialText.match(
          /\d{1,2}\.\d{3}\.\d{3}-[\dkK]/i
        );

      const run =
        matchRun
          ? matchRun[0]
              .replace(/\./g, "")
              .toLowerCase()
          : "sin_run";

      /* NOMBRE DOCUMENTO */

      const nombreDocumento =
        req.body.nombreDocumento || "documento";

      const tipoDocumento =
        normalizarTipoDocumento(
          nombreDocumento
        );

      /* CARPETA FINAL */

      const carpeta =
        "documentos/oficiales";

      fs.mkdirSync(
        carpeta,
        { recursive:true }
      );

      /* NOMBRE FINAL */

      const nombreArchivo =
        `${tipoDocumento}_${run}.pdf`;

      const rutaFinal =
        `${carpeta}/${nombreArchivo}`;

      /* GUARDAR PDF FINAL */

      fs.copyFileSync(
        registroCivil.tempPdfPath,
        rutaFinal
      );

      console.log(
        "PDF FINAL:",
        rutaFinal
      );

      /* VALIDAR COMPARACION */

      if (!comparacion.valido) {

        return res.json({

          valid: false,

          adulterado: true,

          message:
            "El folio y código son válidos, pero el contenido NO coincide con Registro Civil.",

          errores:
            comparacion.errores,

          advertencias:
            comparacion.advertencias,

          subido:
            comparacion.subido,

          oficial:
            comparacion.oficial,

          compareFile:
            `/documentos/oficiales/${nombreArchivo}`

        });

      }

      return res.json({

        valid: true,

        adulterado: false,

        message:
          "Documento válido. El contenido coincide con Registro Civil.",

        advertencias:
          comparacion.advertencias,

        subido:
          comparacion.subido,

        oficial:
          comparacion.oficial,

        compareFile:
          `/documentos/oficiales/${nombreArchivo}`,

        data:
          registroCivil.officialText || ""

      });

    } catch (error) {

      console.log(
        "=========== ERROR VERIFY ==========="
      );

      console.log(error);

      console.log(
        "==================================="
      );

      return res.json({

        valid: false,

        adulterado: null,

        message:
          error.message

      });

    } finally {

      if (
        req.file?.path &&
        fs.existsSync(req.file.path)
      ) {

        fs.unlinkSync(
          req.file.path
        );

      }

    }

  }
);

export default router;