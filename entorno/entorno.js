// Vista previa y pruebas básicas de notas en Markdown.
// Funciona en el navegador (renderiza en #app) y en Node (exporta funciones).

const notaMarkdown = `# Nota de prueba

## Lista de tareas
- [x] Crear una nota
- [ ] Revisar el contenido

**Texto en negrita** y *texto en cursiva*.

| Campo | Valor |
| --- | --- |
| Estado | Pendiente |
| Prioridad | Alta |
`;

const REGLAS = [
	['contiene un título', /^# .+/m],
	['contiene una lista de tareas', /^- \[[ x]\] /m],
	['contiene formato en negrita', /\*\*[^*]+\*\*/],
	['contiene una tabla', /^\|.+\|\s*\n\|[\s|:-]+\|/m],
];

function evaluarNota(nota) {
	return REGLAS.map(([nombre, patron]) => ({ nombre, ok: patron.test(nota) }));
}

function probarNotaMarkdown(nota) {
	return evaluarNota(nota).every(({ ok }) => ok);
}

// --- Conversión Markdown -> HTML ---

const escapar = (texto) =>
	texto.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const enLinea = (texto) =>
	escapar(texto)
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.+?)\*/g, '<em>$1</em>')
		.replace(/`(.+?)`/g, '<code>$1</code>');

const celdas = (fila) => fila.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

function renderLista(lineas) {
	const items = lineas.map((linea) => {
		const texto = linea.replace(/^[-*] /, '');
		const tarea = texto.match(/^\[([ x])\] (.*)$/);
		if (!tarea) return `<li>${enLinea(texto)}</li>`;
		const marcado = tarea[1] === 'x' ? ' checked' : '';
		return `<li class="tarea"><input type="checkbox" disabled${marcado}> ${enLinea(tarea[2])}</li>`;
	});
	return `<ul>${items.join('')}</ul>`;
}

function renderTabla(lineas) {
	const [cabecera, , ...filas] = lineas.map(celdas);
	const th = cabecera.map((c) => `<th>${enLinea(c)}</th>`).join('');
	const tr = filas.map((f) => `<tr>${f.map((c) => `<td>${enLinea(c)}</td>`).join('')}</tr>`).join('');
	return `<table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
}

function buildMarkdownPreview(markdown) {
	const lineas = markdown.replace(/\r\n/g, '\n').split('\n');
	const html = [];

	// Agrupa líneas consecutivas que cumplen `condicion` a partir de `i`.
	const tomar = (i, condicion) => {
		const grupo = [];
		while (i < lineas.length && condicion(lineas[i])) grupo.push(lineas[i++]);
		return grupo;
	};

	for (let i = 0; i < lineas.length; ) {
		const linea = lineas[i];
		const titulo = linea.match(/^(#{1,6}) (.+)$/);
		let grupo;

		if (!linea.trim()) {
			i++;
		} else if (titulo) {
			const n = titulo[1].length;
			html.push(`<h${n}>${enLinea(titulo[2])}</h${n}>`);
			i++;
		} else if (/^[-*] /.test(linea)) {
			grupo = tomar(i, (l) => /^[-*] /.test(l));
			html.push(renderLista(grupo));
		} else if (linea.trim().startsWith('|')) {
			grupo = tomar(i, (l) => l.trim().startsWith('|'));
			html.push(renderTabla(grupo));
		} else {
			grupo = tomar(i, (l) => l.trim() && !/^(#{1,6} |[-*] |\s*\|)/.test(l));
			html.push(`<p>${grupo.map(enLinea).join('<br>')}</p>`);
		}

		if (grupo) i += grupo.length;
	}

	return html.join('\n');
}

// --- Entornos de ejecución ---

function renderResultados(resultados) {
	const items = resultados
		.map(({ nombre, ok }) => `<li class="${ok ? 'ok' : 'fallo'}">${ok ? '✅' : '❌'} ${escapar(nombre)}</li>`)
		.join('');
	return `<ul class="resultados">${items}</ul>`;
}

function iniciarApp(app) {
	app.innerHTML = `
		<h1 class="app-titulo">Entorno Markdown</h1>
		<div class="panel">
			<textarea class="js" id="editor" spellcheck="false"></textarea>
			<article class="preview" id="preview"></article>
		</div>
		<section id="resultados"></section>`;

	const editor = app.querySelector('#editor');
	const preview = app.querySelector('#preview');
	const resultados = app.querySelector('#resultados');

	const actualizar = () => {
		preview.innerHTML = buildMarkdownPreview(editor.value);
		resultados.innerHTML = renderResultados(evaluarNota(editor.value));
	};

	editor.value = notaMarkdown;
	editor.addEventListener('input', actualizar);
	actualizar();
}

if (typeof module !== 'undefined' && module.exports) {
	module.exports = { notaMarkdown, evaluarNota, probarNotaMarkdown, buildMarkdownPreview };

	if (require.main === module) {
		const resultados = evaluarNota(notaMarkdown);
		resultados.forEach(({ nombre, ok }) => console.log(`${ok ? '✅' : '❌'} ${nombre}`));
		const todas = resultados.every(({ ok }) => ok);
		console.log(`\nPruebas ${todas ? 'completadas correctamente' : 'fallidas'}.`);
		process.exitCode = todas ? 0 : 1;
	}
}

if (typeof document !== 'undefined') {
	const app = document.getElementById('app');
	if (app) iniciarApp(app);
}
