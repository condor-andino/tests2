// Analizador heurístico de respaldo para el modo Rápido cuando no hay WebGPU.
// Es deliberadamente tosco: detecta patrones léxicos asociados a debilidades
// argumentativas frecuentes. No tiene "criterio" — no entiende el texto — y la
// UI lo marca como tal. Sirve como anticipo mínimo del método en cualquier
// dispositivo, sin descarga pesada.

const PATTERNS = {
  es: [
    {
      label: 'absolutos sin matiz',
      layer: 'logic',
      severity: 'moderate',
      re: /\b(nunca|siempre|todos?|todas?|nadie|ninguno|jamás|cualquiera que|la única)\b/gi,
      explanation:
        'Cuantificadores absolutos ("nunca", "todos", "la única") vuelven la afirmación frágil: un solo contraejemplo la derrota.',
    },
    {
      label: 'posible falso dilema',
      layer: 'logic',
      severity: 'moderate',
      re: /\bo\s+(?:es|son|eres)\b[^.]{0,60}\bo\s+(?:es|son|eres)\b|\bo\s+\w+\s+o\s+\w+/gi,
      explanation:
        'Estructura "o A o B": presenta dos opciones como si fueran las únicas, cuando puede haber más.',
    },
    {
      label: 'descalificación del que disiente',
      layer: 'rhetoric',
      severity: 'serious',
      re: /\b(cómplice|ingenuo|vendido|traidor|borrego|idiota útil|no entiende)\b/gi,
      explanation:
        'Atribuye defectos a quien sostiene la posición contraria en lugar de responder a sus razones (ad hominem preventivo).',
    },
    {
      label: 'evidencia declarada, no mostrada',
      layer: 'bias',
      severity: 'moderate',
      re: /\b(los datos son claros|está demostrado|es evidente|todo el mundo sabe|es obvio|la ciencia dice)\b/gi,
      explanation:
        'Afirma que la evidencia existe sin presentarla: pide al lector aceptar la conclusión por declaración.',
    },
    {
      label: 'lenguaje cargado',
      layer: 'rhetoric',
      severity: 'mild',
      re: /\b(miseria|catástrofe|desastre|corrupto|saqueo|régimen|casta|élite)\b/gi,
      explanation:
        'Términos con carga emocional que hacen trabajo argumentativo sin justificarlo.',
    },
    {
      label: 'autoelogio sin métrica',
      layer: 'bias',
      severity: 'moderate',
      re: /\b(significativamente|líder(es)?|comprometid[oa]s?|reafirma(mos)?|consolidándo)\w*\b/gi,
      explanation:
        'Vocabulario de logro sin cifras, línea base ni verificación externa: afirmación no falsable tal como está formulada.',
    },
    {
      label: 'causalidad afirmada, no demostrada',
      layer: 'logic',
      severity: 'moderate',
      re: /\b(porque|gracias a|debido a)\b/gi,
      explanation:
        'Atribuye un efecto a una causa sin descartar otras explicaciones (post hoc / causa única).',
    },
  ],
  en: [
    {
      label: 'unqualified absolutes',
      layer: 'logic',
      severity: 'moderate',
      re: /\b(never|always|everyone|nobody|no one|the only|anyone who)\b/gi,
      explanation:
        'Absolute quantifiers ("never", "everyone", "the only") make the claim brittle: one counterexample defeats it.',
    },
    {
      label: 'possible false dilemma',
      layer: 'logic',
      severity: 'moderate',
      re: /\beither\b[^.]{0,60}\bor\b/gi,
      explanation:
        'An "either A or B" structure presents two options as the only ones when there may be more.',
    },
    {
      label: 'dismissal of dissenters',
      layer: 'rhetoric',
      severity: 'serious',
      re: /\b(complicit|naive|sellout|traitor|sheep|shill|doesn't get it)\b/gi,
      explanation:
        'Attributes defects to whoever holds the opposite view instead of answering their reasons (pre-emptive ad hominem).',
    },
    {
      label: 'evidence declared, not shown',
      layer: 'bias',
      severity: 'moderate',
      re: /\b(the data is clear|it is proven|it's obvious|everyone knows|science says)\b/gi,
      explanation:
        'Asserts that the evidence exists without presenting it: asks the reader to accept the conclusion by declaration.',
    },
    {
      label: 'loaded language',
      layer: 'rhetoric',
      severity: 'mild',
      re: /\b(misery|catastrophe|disaster|corrupt|looting|regime|elite)\b/gi,
      explanation: 'Emotionally charged terms doing argumentative work without justification.',
    },
    {
      label: 'self-praise without metrics',
      layer: 'bias',
      severity: 'moderate',
      re: /\b(significantly|leader(s)?|committed|reaffirm(s)?|consolidating)\b/gi,
      explanation:
        'Achievement vocabulary with no figures, baseline, or external verification: unfalsifiable as stated.',
    },
    {
      label: 'causality asserted, not shown',
      layer: 'logic',
      severity: 'moderate',
      re: /\b(because|thanks to|due to)\b/gi,
      explanation:
        'Attributes an effect to a cause without ruling out other explanations (post hoc / single cause).',
    },
  ],
}

const NOTES = {
  es: 'Análisis heurístico por patrones léxicos, sin modelo de lenguaje: indica dónde mirar, no qué concluir. Sin reconstrucción real del argumento.',
  en: 'Heuristic analysis via lexical patterns, no language model: it points where to look, not what to conclude. No real reconstruction of the argument.',
}

function contextQuote(text, index, matchLength) {
  const start = Math.max(0, index - 30)
  const end = Math.min(text.length, index + matchLength + 30)
  return (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '')
}

export function analyzeHeuristic({ text }, lang) {
  const patterns = PATTERNS[lang] || PATTERNS.es
  const findings = []
  for (const p of patterns) {
    p.re.lastIndex = 0
    const m = p.re.exec(text)
    if (m) {
      findings.push({
        layer: p.layer,
        label: p.label,
        quote: contextQuote(text, m.index, m[0].length),
        explanation: p.explanation,
        why_it_matters: '',
        severity: p.severity,
        improvement: '',
      })
    }
  }
  return {
    mode: 'fast',
    engine: 'heuristic',
    model: 'lexicon',
    reconstruction: {
      thesis: '',
      claim_type: 'mixed',
      premises: [],
      implicit_premises: [],
      warrant: '',
    },
    findings,
    confidence: { level: 'low', note: NOTES[lang] || NOTES.es },
  }
}
