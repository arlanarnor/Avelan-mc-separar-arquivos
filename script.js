var message = "";
function clickIE() { if (document.all) { (message); return false; } }
function clickNS(e) { if (document.layers || (document.getElementById && !document.all)) { if (e.which == 2 || e.which == 3) { (message); return false; } } }
if (document.layers) { document.captureEvents(Event.MOUSEDOWN); document.onmousedown = clickNS; }
else { document.onmouseup = clickNS; document.oncontextmenu = clickIE; }

document.oncontextmenu = new Function("return false")

document.onkeypress = function (event) {
    if (e.ctrlKey && (e.keyCode === 123)) {
        return false;
    }
};

document.onkeydown = function (e) {
    if (e.ctrlKey && (e.keyCode === 85)) {
        return false;
    }
};

let xmlFiles = [];

document.getElementById('importBtn').addEventListener('click', function () {
    document.getElementById('xmlInput').click();
});

document.getElementById('xmlInput').addEventListener('change', function (e) {
    xmlFiles = Array.from(e.target.files);
    alert(`${xmlFiles.length} arquivos XML importados.`);
});

document.getElementById('notas').addEventListener('input', function () {
    const notas = this.value.split('\n').map(nota => nota.replace(/^0+/, '')).filter(nota => nota !== '');
    document.getElementById('quantidadeNotas').value = notas.length;
});

document.getElementById('loadBtn').addEventListener('click', function () {
    const xmlNotas = [];

    if (xmlFiles.length === 0) {
        alert("Nenhum arquivo XML foi importado.");
        return;
    }

    xmlFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(e.target.result, "text/xml");
            const nNF = xmlDoc.getElementsByTagName("nNF")[0]?.textContent;
            if (nNF) {
                xmlNotas.push(nNF.replace(/^0+/, ''));
                updateXmlNotas(xmlNotas);
            }
        };
        reader.readAsText(file);
    });
});

function updateXmlNotas(notas) {
    const uniqueNotas = Array.from(new Set(notas));
    document.getElementById('xmlNotas').value = uniqueNotas.join('\n');
    document.getElementById('quantidadeXmlNotas').value = uniqueNotas.length;
}

document.getElementById('verificarBtn').addEventListener('click', function () {
    verificarNotasFaltantes();
});

function verificarNotasFaltantes() {
    const notas = document.getElementById('notas').value.split('\n').map(nota => nota.replace(/^0+/, '')).filter(nota => nota !== '');
    const xmlNotas = document.getElementById('xmlNotas').value.split('\n').map(nota => nota.replace(/^0+/, '')).filter(nota => nota !== '');

    const faltantes = notas.filter(nota => !xmlNotas.includes(nota));

    const mensagemFaltantesDiv = document.getElementById('mensagemFaltantes');
    if (faltantes.length > 0) {
        mensagemFaltantesDiv.innerHTML = "Os seguintes números de notas não possuem XML correspondente: <br>" + faltantes.join(', ');
        mensagemFaltantesDiv.style.display = 'block';
    } else {
        mensagemFaltantesDiv.innerHTML = "Todas as notas possuem .xml.";
        mensagemFaltantesDiv.style.display = 'block';
    }
}

document.getElementById('downloadNotasBtn').addEventListener('click', function () {
    downloadXMLs(true, "notas");
});

document.getElementById('downloadAusentesBtn').addEventListener('click', function () {
    downloadXMLs(false, "ausentes");
});

function downloadXMLs(match, type) {
    const notas = document.getElementById('notas').value.split('\n').map(nota => nota.replace(/^0+/, ''));
    const xmlNotas = document.getElementById('xmlNotas').value.split('\n').map(nota => nota.replace(/^0+/, ''));

    const zip = new JSZip();
    const folder = zip.folder(type === "notas" ? "xml_das_notas" : "xml_ausentes");

    let processFiles = xmlFiles.length;
    xmlFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(e.target.result, "text/xml");
            const nNF = xmlDoc.getElementsByTagName("nNF")[0]?.textContent.replace(/^0+/, '');

            const shouldDownload = match ? notas.includes(nNF) : !notas.includes(nNF);
            if (shouldDownload) {
                folder.file(file.name, e.target.result);
            }

            processFiles--;
            if (processFiles === 0) {
                zip.generateAsync({ type: "blob" })
                    .then(function (blob) {
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(blob);
                        a.download = `${type}.zip`;
                        a.click();
                    });
            }
        };
        reader.readAsText(file);
    });
}
