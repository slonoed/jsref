#!/usr/bin/env node

const path = require('path')
const {readFileSync, readdirSync} = require('fs')

const fixersDir = path.join(__dirname, '../src/fixers/__tests__/specs/')

const formatName = name => name.slice(0, name.length - 4).replace(/-/gim, ' ')

const escapeHtml = unsafe =>
  unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const files = readdirSync(fixersDir, {encoding: 'utf8'})

const rowsHtml = files
  .filter(fname => fname.endsWith('.txt'))
  .map(fname => {
    const fpath = path.join(fixersDir, fname)
    const content = readFileSync(fpath, {encoding: 'utf8'})

    const spec = content
      .split(/^={3,}/m)
      .map(t => t.trim())
      .filter(t => t)[0]

    let [, source, target] = spec.split(/\n\-\-\-\n/m)

    return `<tr>
  <td>${formatName(fname)}</td>
  <td>
    <pre><code>${escapeHtml(source)}</code></pre>
  </td>
  <td>
    <pre><code>${escapeHtml(target)}</code></pre>
  </td>
</tr>`
  })
  .join('\n')

const html = `<table>
  <tr>
    <th>Refactoring</th>
    <th>Code before</th>
    <th>Code after</th>
  <tr>
  ${rowsHtml}
</table>`

console.log(html)
