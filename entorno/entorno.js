// Pruebas básicas de notas en Markdown
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

function probarNotaMarkdown(nota) {
	const pruebas = [
		['contiene un título', nota.includes('# Nota de prueba')],
		['contiene una lista de tareas', nota.includes('- [x]')],
		['contiene formato en negrita', nota.includes('**Texto en negrita**')],
		['contiene una tabla', nota.includes('| Campo | Valor |')],
	];

	pruebas.forEach(([nombre, resultado]) => {
		console.log(`${resultado ? '✅' : '❌'} ${nombre}`);
	});

	return pruebas.every(([, resultado]) => resultado);
}

const resultado = probarNotaMarkdown(notaMarkdown);
console.log(`\nPruebas ${resultado ? 'completadas correctamente' : 'fallidas'}.`);
