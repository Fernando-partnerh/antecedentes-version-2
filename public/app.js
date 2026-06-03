const documentos = [
  {
    id:0,
    modulo:6,
    nombre:"Verificación de antecedentes en Poder Judicial",
    estado:"Pendiente",
    observacion:"Pendiente de validación",
    valida:false
  },
  {
    id:1,
    modulo:6,
    nombre:"Últimas 24 Cotizaciones Previsionales, con Nombre y Rut del empleador",
    estado:"Pendiente",
    observacion:"Documento pendiente de carga",
    valida:false
  },
  {
    id:2,
    modulo:6,
    nombre:"Cédula de identidad vigente (ambos lados)",
    estado:"Pendiente",
    observacion:"Documento pendiente de carga",
    valida:false
  },
  {
    id:3,
    modulo:6,
    nombre:"Licencia de conducir (si aplica al cargo)",
    estado:"No aplica",
    observacion:"No aplica al cargo",
    valida:false
  },
  {
    id:4,
    modulo:6,
    nombre:"Certificado de nacimiento del trabajador",
    estado:"Pendiente",
    observacion:"Pendiente de carga",
    valida:true
  },
  {
    id:5,
    modulo:6,
    nombre:"Certificado de antecedentes",
    estado:"Pendiente",
    observacion:"Pendiente de carga",
    valida:true
  },
  {
    id:6,
    modulo:6,
    nombre:"Hoja de vida del conductor",
    estado:"Pendiente",
    observacion:"Pendiente de carga",
    valida:true
  },
  {
    id:7,
    modulo:6,
    nombre:"Certificado de estudios y/o títulos profesionales/técnicos",
    estado:"Pendiente",
    observacion:"Pendiente de carga",
    valida:false
  },
  {
    id:8,
    modulo:6,
    nombre:"Certificado de capacitación y/o certificación de competencias",
    estado:"Pendiente",
    observacion:"Pendiente de carga",
    valida:false
  },
  {
    id:9,
    modulo:6,
    nombre:"Credenciales y licencias vigentes",
    estado:"Pendiente",
    observacion:"Pendiente de carga",
    valida:false
  },
  {
    id:10,
    modulo:7,
    nombre:"Certificado de Matrimonio o Acuerdo de Unión Civil",
    estado:"Pendiente",
    observacion:"Pendiente de carga",
    valida:true
  },
  {
    id:11,
    modulo:7,
    nombre:"Certificado de afiliación AFP",
    estado:"Pendiente",
    observacion:"Pendiente de carga",
    valida:true
  },
  {
    id:12,
    modulo:7,
    nombre:"Certificado de Afiliación Sistema de Salud",
    estado:"Pendiente",
    observacion:"Pendiente de carga",
    valida:true
  },
  {
    id:13,
    modulo:7,
    nombre:"Certificado de cuenta bancaria",
    estado:"Pendiente",
    observacion:"Pendiente de carga",
    valida:true
  },
  {
    id:14,
    modulo:7,
    nombre:"Certificado de Residencia",
    estado:"No aplica",
    observacion:"Documento opcional",
    valida:false
  }
];

const rutUsuario = "18.064.272-2";

/* ESTADOS */

function claseEstado(estado){

  const texto = estado.toLowerCase();

  if(texto === "pendiente") return "pendiente";
  if(texto === "subido") return "subido";
  if(texto === "validando") return "subido";
  if(texto === "validado") return "validado";
  if(texto === "no válido") return "no-valido";
  if(texto === "no valido") return "no-valido";
  if(texto === "no aplica") return "no-aplica";

  return "pendiente";
}

/* TABLA */

function crearTabla(modulo, contenedorId){

  const contenedor =
    document.getElementById(contenedorId);

  const docsModulo =
    documentos.filter(doc => doc.modulo === modulo);

  contenedor.innerHTML = `

    <div class="table-header">

      <div>#</div>

      <div>Documento</div>

      <div>Subir</div>

      <div>Estado</div>

      <div>Observación</div>

      <div>Documento Subido</div>

      <div>Documento Validación</div>

    </div>

    ${docsModulo.map(doc => `

      <div
        class="table-row"
        data-id="${doc.id}"
      >

        <div class="col-num">
          ${doc.id}
        </div>

        <div class="col-documento">
          ${doc.nombre}
        </div>

        <!-- SUBIR -->

        <div>

          <input
            type="file"
            class="hidden-input file-input"
            accept="application/pdf"
          >

          <button class="btn-upload">
            Subir
          </button>

        </div>

        <!-- ESTADO -->

        <div>

          <span class="estado ${claseEstado(doc.estado)}">
            ${doc.estado}
          </span>

        </div>

        <!-- OBSERVACION -->

        <div>

          <div class="observacion">
            ${doc.observacion}
          </div>

        </div>

        <!-- DOC USUARIO -->

        <div class="documento-box">

          <button
  class="btn-ver-user btn-doc-inactivo"
>
  Ver
</button>

        </div>

        <!-- DOC VALIDACION -->

        <div class="documento-box">

          <button
            class="btn-ver-validacion btn-doc-inactivo" >
            Ver
          </button>

        </div>

      </div>

    `).join("")}
  `;
}

crearTabla(6, "tablaModulo6");
crearTabla(7, "tablaModulo7");

/* TABS */

document
.querySelectorAll(".tab-btn")
.forEach(btn => {

  btn.addEventListener("click", () => {

    document
    .querySelectorAll(".tab-btn")
    .forEach(b => b.classList.remove("active"));

    document
    .querySelectorAll(".modulo")
    .forEach(m => m.classList.remove("active"));

    btn.classList.add("active");

    document
    .getElementById(btn.dataset.tab)
    .classList.add("active");

  });

});

/* BOTON SUBIR */

document.addEventListener("click", e => {

  if(e.target.classList.contains("btn-upload")){

    const row =
      e.target.closest(".table-row");

    const input =
      row.querySelector(".file-input");

    input.click();
  }

});

/* LOADER */

function startLoader(container){

  const text = "PARTNERH";

  let index = 0;
  let direction = 1;

  return setInterval(() => {

    let display = "";

    for(let i = 0; i < text.length; i++){

      display += i === index
        ? text[i]
        : "_";
    }

    container.innerHTML = `

      <div>

        <div class="loader-text">
          ${display}
        </div>

        <div class="loader-sub">
          Verificando documento...
        </div>

      </div>

    `;

    index += direction;

    if(index === text.length - 1 || index === 0){
      direction *= -1;
    }

  },120);

}

/* SUBIR Y VALIDAR */

document.addEventListener("change", async e => {

  if(!e.target.classList.contains("file-input"))
    return;

  const row =
    e.target.closest(".table-row");

  const estado =
    row.querySelector(".estado");

  const observacion =
    row.querySelector(".observacion");

  const btnVerUser =
    row.querySelector(".btn-ver-user");

  const btnVerValidacion =
    row.querySelector(".btn-ver-validacion");

  const idDocumento =
    Number(row.dataset.id);

  const file =
    e.target.files[0];

  if(!file) return;

  if(file.type !== "application/pdf"){

    estado.className = "estado no-valido";
    estado.innerText = "No válido";

    observacion.innerText =
      "El archivo no es PDF.";

    return;
  }

  /* DOCUMENTO USUARIO */

  const fileURL =
    URL.createObjectURL(file);

  btnVerUser.dataset.url = fileURL;
  btnVerUser.classList.remove("btn-doc-inactivo");
  btnVerUser.classList.add("btn-doc-activo");

  /* VALIDANDO */

  estado.className = "estado subido";
  estado.innerText = "Validando";

  const loader =
    startLoader(observacion);

  const formData = new FormData();

  formData.append("file", file);

formData.append(
  "documentoId",
  idDocumento
);

const nombreDocumento =
  documentos.find(
    d => d.id === idDocumento
  )?.nombre || "documento";

formData.append(
  "nombreDocumento",
  nombreDocumento
);

  try{

    const response = await fetch("/verify", {
      method:"POST",
      body:formData
    });

    const json = await response.json();
    console.log("RESPUESTA BACKEND:");
    console.log(json);
    clearInterval(loader);

    if(!json.valid){

      estado.className = "estado no-valido";
      estado.innerText = "No válido";

      observacion.innerText =
        json.message || "Documento inválido.";

      return;
    }




/* VALIDAR RUN */




const textoDocumento = JSON.stringify(
  json.oficial || ""
)
.toLowerCase();

const runUsuario = rutUsuario
  .replace(/\./g, "")
  .replace(/-/g, "")
  .toLowerCase();

const textoLimpio = textoDocumento
  .replace(/\./g, "")
  .replace(/-/g, "")
  .replace(/\s+/g, "")
  .toLowerCase();

/* DEBUG */

console.log("RUN:", runUsuario);
console.log("PDF:", textoLimpio);

/* VALIDAR */

if(textoLimpio.includes(runUsuario)){

  estado.className = "estado validado";

  estado.innerText = "Validado";

  observacion.innerText =
    "Documento válido y pertenece al RUN del usuario.";

}else{

  /* SI REGISTRO CIVIL LO VALIDÓ, NO FORZAR INVALIDO */

  estado.className = "estado validado";

  estado.innerText = "Validado";

  observacion.innerText =
    "Documento válido según Registro Civil.";

}

    /* DOCUMENTO VALIDACION */

    if(json.compareFile){

  console.log("PDF OFICIAL:");
  console.log(json.compareFile);

  btnVerValidacion.dataset.url =
    json.compareFile;

 btnVerValidacion.classList.remove(
  "btn-doc-inactivo"
);

btnVerValidacion.classList.add(
  "btn-doc-activo"
);

}

  }catch(error){

  clearInterval(loader);

  console.log("ERROR FRONT:");
  console.log(error);

  estado.className = "estado no-valido";

  estado.innerText = "No válido";

  observacion.innerText =
    error.message;

}

});

/* MODAL PDF */

document.addEventListener("click", e => {

  if(
    e.target.classList.contains("btn-ver-user")
    ||
    e.target.classList.contains("btn-ver-validacion")
  ){

    const url =
      e.target.dataset.url;

    const modal =
      document.createElement("div");

    modal.className = "pdf-modal";

    modal.innerHTML = `

      <div class="pdf-content">

        <div class="pdf-top">

          <button class="btn-close-modal">
            X
          </button>

          <a
            href="${url}"
            download
            class="btn-download-modal"
          >
            Descargar
          </a>

        </div>

        <iframe
          src="${url}"
          class="pdf-frame"
        ></iframe>

      </div>

    `;

    document.body.appendChild(modal);

  }

  if(e.target.classList.contains("btn-close-modal")){

    document
    .querySelector(".pdf-modal")
    ?.remove();

  }

});