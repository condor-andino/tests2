// Composición de prompts a partir de prompts/system-zamuro.md.
// El .md es la fuente de verdad editable; aquí solo se extraen sus bloques.

import systemMd from '../../prompts/system-zamuro.md?raw'

function extractBlock(name) {
  const begin = `<!-- ${name}:BEGIN -->`
  const end = `<!-- ${name}:END -->`
  // lastIndexOf: si la prosa introductoria del .md menciona los delimitadores,
  // los bloques reales siempre van después.
  const i = systemMd.lastIndexOf(begin)
  const j = systemMd.lastIndexOf(end)
  if (i === -1 || j === -1 || j <= i) {
    throw new Error(`prompts/system-zamuro.md: falta el bloque ${name}`)
  }
  return systemMd.slice(i + begin.length, j).trim()
}

const langDirective = {
  es: 'Directiva de idioma: escribe todos los campos de texto del JSON en español.',
  en: 'Language directive: write every text field of the JSON in English.',
}

export function buildSystemPrompt(mode, lang) {
  const core = extractBlock('CORE')
  const modeBlock = extractBlock(mode === 'deep' ? 'DEEP' : 'FAST')
  return `${core}\n\n${modeBlock}\n\n${langDirective[lang] || langDirective.es}`
}

export function buildUserMessage({ text, author, source, url }, lang) {
  const label =
    lang === 'en'
      ? { text: 'Text to analyze', author: 'Author', source: 'Outlet', url: 'URL', ctx: 'Declared context (do not fetch)' }
      : { text: 'Texto a analizar', author: 'Autor', source: 'Medio', url: 'URL', ctx: 'Contexto declarado (no hacer fetch)' }

  let msg = `${label.text}:\n"""\n${text}\n"""`
  const ctx = []
  if (author) ctx.push(`${label.author}: ${author}`)
  if (source) ctx.push(`${label.source}: ${source}`)
  if (url) ctx.push(`${label.url}: ${url}`)
  if (ctx.length) msg += `\n\n${label.ctx}:\n${ctx.join('\n')}`
  return msg
}
