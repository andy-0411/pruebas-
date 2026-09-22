const test = require('node:test');
const assert = require('node:assert/strict');

const { notaMarkdown, probarNotaMarkdown, buildMarkdownPreview } = require('./entorno.js');

test('debe detectar los elementos clave del markdown', () => {
  assert.equal(probarNotaMarkdown(notaMarkdown), true);
});

test('debe generar una vista HTML con título, lista y tabla', () => {
  const html = buildMarkdownPreview(notaMarkdown);

  assert.match(html, /<h1>[^<]+<\/h1>/);
  assert.match(html, /<ul>/);
  assert.match(html, /<table/);
});
