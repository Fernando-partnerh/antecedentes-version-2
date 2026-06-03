import fs from "fs";
import pdf from "pdf-parse";

export class PdfExtractorService {
  static async extract(filePath) {
    const buffer = fs.readFileSync(filePath);
    const data = await pdf(buffer);

    const text = data.text || "";

    const folio =
      text.match(/FOLIO\s*:\s*(\d+)/i)?.[1] ??
      text.match(/FOLIO\s*(\d+)/i)?.[1] ??
      null;

    const codigo =
      text.match(/C[óo]digo\s*Verificaci[oó]n\s*:?\s*([a-zA-Z0-9]+)/i)?.[1] ??
      text.match(/Codigo\s*Verificacion\s*:?\s*([a-zA-Z0-9]+)/i)?.[1] ??
      null;

    const fecha =
      text.match(/FECHA\s*EMISI[ÓO]N\s*:?\s*([^\n]+)/i)?.[1]?.trim() ??
      null;

    return {
      folio,
      codigo,
      fecha,
      paginas: data.numpages || 1,
      raw: text
    };
  }
}