// Parseo seguro de la salida del modelo: extrae el primer objeto JSON
// balanceado del texto (tolera ```json, texto alrededor, etc.) y normaliza
// el informe a una forma estable para la UI.

export class ParseError extends Error {
  constructor(raw) {
    super('unparseable model output')
    this.name = 'ParseError'
    this.raw = raw
  }
}

function extractJson(text) {
  const start = text.indexOf('{')
  if (start === -1) return null
  let depth = 0
  let inString = false
  let escaped = false
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (inString) {
      if (escaped) escaped = false
      else if (ch === '\\') escaped = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') inString = true
    else if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(start, i + 1))
        } catch {
          return null
        }
      }
    }
  }
  return null
}

const asArray = (v) => (Array.isArray(v) ? v : v == null ? [] : [v])
const asString = (v) => (typeof v === 'string' ? v : v == null ? '' : String(v))

const SEVERITIES = ['mild', 'moderate', 'serious']
const LAYERS = ['logic', 'bias', 'rhetoric']
const VERDICTS = ['supported', 'contradicted', 'mixed', 'unverifiable']
const LEVELS = ['low', 'medium', 'high']

// Modelos pequeños a veces devuelven las etiquetas en el idioma del análisis;
// se normalizan a los valores canónicos.
const aliases = {
  severity: { leve: 'mild', moderada: 'moderate', seria: 'serious' },
  layer: { lógica: 'logic', logica: 'logic', sesgo: 'bias', retórica: 'rhetoric', retorica: 'rhetoric' },
  verdict: { apoyada: 'supported', contradicha: 'contradicted', mixta: 'mixed', 'no verificable': 'unverifiable' },
  level: { baja: 'low', media: 'medium', alta: 'high' },
}

function canon(value, allowed, aliasMap, fallback) {
  const v = asString(value).toLowerCase().trim()
  if (allowed.includes(v)) return v
  if (aliasMap[v]) return aliasMap[v]
  return fallback
}

function normalizeConfidence(c) {
  if (typeof c === 'string') return { level: canon(c, LEVELS, aliases.level, 'low'), note: '' }
  if (!c || typeof c !== 'object') return { level: 'low', note: '' }
  return {
    level: canon(c.level, LEVELS, aliases.level, 'low'),
    note: asString(c.note),
  }
}

export function parseReport(rawText, { mode, engine, model }) {
  const data = extractJson(asString(rawText))
  if (!data || typeof data !== 'object') throw new ParseError(rawText)

  const rec = data.reconstruction || {}
  const report = {
    mode,
    engine, // 'webllm' | 'anthropic' | 'heuristic'
    model,
    reconstruction: {
      thesis: asString(rec.thesis || data.thesis),
      claim_type: canon(rec.claim_type || data.claim_type, ['empirical', 'normative', 'definitional', 'predictive', 'mixed'], {
        empírica: 'empirical', empirica: 'empirical', normativa: 'normative',
        definicional: 'definitional', predictiva: 'predictive', mixta: 'mixed',
      }, 'mixed'),
      premises: asArray(rec.premises).map(asString).filter(Boolean),
      implicit_premises: asArray(rec.implicit_premises).map(asString).filter(Boolean),
      warrant: asString(rec.warrant),
    },
    findings: asArray(data.findings)
      .filter((f) => f && typeof f === 'object')
      .map((f) => ({
        layer: canon(f.layer, LAYERS, aliases.layer, 'logic'),
        label: asString(f.label) || asString(f.name),
        quote: asString(f.quote),
        explanation: asString(f.explanation),
        why_it_matters: asString(f.why_it_matters || f.whyItMatters),
        severity: canon(f.severity, SEVERITIES, aliases.severity, 'mild'),
        improvement: asString(f.improvement),
      })),
    confidence: normalizeConfidence(data.confidence || data.meta?.confidence),
  }

  if (mode === 'deep') {
    report.factual_checks = asArray(data.factual_checks)
      .filter((c) => c && typeof c === 'object')
      .map((c) => ({
        claim: asString(c.claim),
        verdict: canon(c.verdict, VERDICTS, aliases.verdict, 'unverifiable'),
        explanation: asString(c.explanation),
        sources: asArray(c.sources)
          .filter((s) => s && typeof s === 'object')
          .map((s) => ({ title: asString(s.title), url: asString(s.url) })),
      }))
    const bs = data.blind_spot || {}
    report.blind_spot = {
      excluded_perspectives: asArray(bs.excluded_perspectives).map(asString).filter(Boolean),
      author_position: asString(bs.author_position),
      strongest_counter: asString(bs.strongest_counter),
      structural_blind_spot: asString(bs.structural_blind_spot),
    }
    const meta = data.meta || {}
    report.meta = {
      confidence: normalizeConfidence(meta.confidence || data.confidence),
      equanimity_note: asString(meta.equanimity_note),
      clear_error_vs_disagreement: asString(meta.clear_error_vs_disagreement),
    }
  }

  return report
}

// ── Exportación ─────────────────────────────────────────────────────────────

export function reportToMarkdown(report, t) {
  const L = []
  L.push(`# zamuro — ${t.title}`)
  L.push('')
  L.push(`## ${t.reconstructionTitle}`)
  L.push(`- **${t.thesis}**: ${report.reconstruction.thesis}`)
  L.push(`- **${t.claimType}**: ${t.claimTypes[report.reconstruction.claim_type] || report.reconstruction.claim_type}`)
  if (report.reconstruction.premises.length)
    L.push(`- **${t.premises}**: ${report.reconstruction.premises.join(' · ')}`)
  if (report.reconstruction.implicit_premises.length)
    L.push(`- **${t.implicitPremises}**: ${report.reconstruction.implicit_premises.join(' · ')}`)
  if (report.reconstruction.warrant) L.push(`- **${t.warrant}**: ${report.reconstruction.warrant}`)
  L.push('')
  L.push(`## ${t.findingsTitle}`)
  if (!report.findings.length) L.push(t.noFindings)
  for (const f of report.findings) {
    L.push(`### ${f.label} — ${t.layer[f.layer]} · ${t.severity[f.severity]}`)
    if (f.quote) L.push(`> ${f.quote}`)
    if (f.explanation) L.push(f.explanation)
    if (f.why_it_matters) L.push(`**${t.whyItMatters}:** ${f.why_it_matters}`)
    if (f.improvement) L.push(`**${t.improvement}:** ${f.improvement}`)
    L.push('')
  }
  if (report.factual_checks?.length) {
    L.push(`## ${t.factualTitle}`)
    for (const c of report.factual_checks) {
      L.push(`- **${c.claim}** — ${t.verdicts[c.verdict]}. ${c.explanation}`)
      for (const s of c.sources) L.push(`  - [${s.title || s.url}](${s.url})`)
    }
    L.push('')
  }
  if (report.blind_spot) {
    L.push(`## ${t.blindSpotTitle}`)
    if (report.blind_spot.excluded_perspectives.length)
      L.push(`- **${t.excludedPerspectives}**: ${report.blind_spot.excluded_perspectives.join(' · ')}`)
    if (report.blind_spot.author_position)
      L.push(`- **${t.authorPosition}**: ${report.blind_spot.author_position}`)
    if (report.blind_spot.strongest_counter)
      L.push(`- **${t.strongestCounter}**: ${report.blind_spot.strongest_counter}`)
    if (report.blind_spot.structural_blind_spot)
      L.push(`- **${t.structuralBlindSpot}**: ${report.blind_spot.structural_blind_spot}`)
    L.push('')
  }
  const conf = report.meta?.confidence || report.confidence
  L.push(`## ${t.metaTitle}`)
  L.push(`- **${t.confidence}**: ${t.levels[conf.level]}${conf.note ? ` — ${conf.note}` : ''}`)
  if (report.meta?.equanimity_note) L.push(`- **${t.equanimity}**: ${report.meta.equanimity_note}`)
  if (report.meta?.clear_error_vs_disagreement)
    L.push(`- **${t.errorVsDisagreement}**: ${report.meta.clear_error_vs_disagreement}`)
  L.push('')
  L.push(`---`)
  L.push(`*${t.disclaimer}*`)
  return L.join('\n')
}
