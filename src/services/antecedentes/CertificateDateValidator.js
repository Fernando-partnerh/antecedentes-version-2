export class CertificateDateValidator {

  static validate(fechaStr) {
    /*
     VALIDACIÓN DESACTIVADA TEMPORALMENTE

    const fecha = this.parseDate(fechaStr);

    if (!fecha) {
      return { valid: false, diff: null };
    }

    const hoy = new Date();

    hoy.setHours(0,0,0,0);
    fecha.setHours(0,0,0,0);

    const diff = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));

    return {
      valid: diff <= 59,
      diff
    };
    */

    // 🔥 FORZAR VALIDACIÓN TRUE
    return {
      valid: true,
      diff: 0
    };
  }

  static parseDate(str) {
    /*
    🔒 PARSEO DESACTIVADO TEMPORALMENTE

    if (!str) return null;

    const clean = str
      .toLowerCase()
      .replace('.', '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const meses = {
      enero:0, febrero:1, marzo:2, abril:3, mayo:4, junio:5,
      julio:6, agosto:7, septiembre:8, octubre:9, noviembre:10, diciembre:11
    };

    const match = clean.match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/);

    if (!match) return null;

    const dia = parseInt(match[1], 10);
    const mes = meses[match[2]];
    const anio = parseInt(match[3], 10);

    if (mes === undefined) return null;

    return new Date(anio, mes, dia);
    */

    return null;
  }
}