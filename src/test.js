import {
  PoderJudicialSearchService
} from "./services/poder_judicial/PoderJudicialSearchService.js";

const data =
  await PoderJudicialSearchService.buscar({

    nombre: "HUGO",
    paterno: "VICENCIO",
    materno: "OVIEDO"
  });

console.log(
  JSON.stringify(data, null, 2)
);