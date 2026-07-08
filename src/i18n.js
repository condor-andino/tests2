// Cadenas de interfaz en español e inglés. El idioma también gobierna el
// idioma del análisis (se pasa como directiva al modelo).

export const strings = {
  es: {
    langName: 'ES',
    title: 'zamuro',
    tagline: 'analizador de sesgos y límites argumentativos',
    navAnalyzer: 'analizador',
    navAbout: 'sobre el zamuro',

    modeFast: 'Rápido',
    modeDeep: 'Profundo',
    modeFastHint:
      'gratis y público — un modelo pequeño corre en tu navegador. Anticipo del método, con calidad limitada asumida.',
    modeDeepHint:
      'las 7 capas con verificación web, usando tu propia clave de la API de Anthropic. El costo corre por tu cuenta.',

    inputLabel: 'texto a analizar',
    inputPlaceholder:
      'Pega aquí el texto argumentativo (un post, un extracto, un comunicado)…',
    charCount: (n, max) => `${n}/${max}`,
    contextLegend: 'contexto opcional (no se hace fetch)',
    authorLabel: 'autor',
    sourceLabel: 'medio',
    urlLabel: 'URL',

    analyze: 'Analizar',
    analyzing: 'analizando…',

    // Estados de carga: la actividad del zamuro.
    loadingStates: [
      'oliendo el aire…',
      'planeando en círculos…',
      'escudillando…',
      'separando carne de hueso…',
      'digiriendo carne muerta…',
      'limpiando la osamenta…',
    ],
    webllmDownloading: 'descargando el modelo local (solo la primera vez)…',

    keyLabel: 'clave de la API de Anthropic',
    keyPlaceholder: 'sk-ant-…',
    keyPersist: 'recordar en este navegador',
    keyClear: 'borrar clave',
    keyNote:
      'Tu clave vive solo en tu navegador y únicamente viaja en la llamada directa a api.anthropic.com. Sin servidor intermedio. La búsqueda web tiene un costo adicional por búsqueda que también corre por tu cuenta.',
    fastViaApi: 'enrutar el modo Rápido por Anthropic (mejor calidad, usa tu clave)',

    noWebGPU:
      'Tu navegador no soporta WebGPU, así que el modelo local no puede correr. Puedes usar el análisis heurístico (mucho más tosco, por patrones léxicos, sin criterio real) o pasar al modo Profundo con tu clave.',
    useHeuristic: 'usar análisis heurístico',
    heuristicBadge: 'heurístico — por patrones, sin modelo',

    reconstructionTitle: 'argumento reconstruido',
    thesis: 'tesis (versión más fuerte)',
    claimType: 'tipo de afirmación',
    premises: 'premisas explícitas',
    implicitPremises: 'premisas implícitas',
    warrant: 'warrant',
    findingsTitle: 'hallazgos',
    factualTitle: 'verificación fáctica',
    blindSpotTitle: 'lo que el argumento no ve',
    excludedPerspectives: 'perspectivas excluidas',
    authorPosition: 'posición del autor',
    strongestCounter: 'contraposición más fuerte',
    structuralBlindSpot: 'punto ciego estructural',
    metaTitle: 'meta-chequeo',
    confidence: 'confianza',
    equanimity: 'ecuanimidad',
    errorVsDisagreement: 'error claro vs. desacuerdo razonable',
    whyItMatters: 'por qué importa',
    improvement: 'cómo se fortalecería',
    sources: 'fuentes',
    noFindings: 'sin hallazgos salientes — o el texto no sostiene una posición.',

    severity: { mild: 'leve', moderate: 'moderada', serious: 'seria' },
    layer: { logic: 'lógica', bias: 'sesgo', rhetoric: 'retórica' },
    claimTypes: {
      empirical: 'empírica',
      normative: 'normativa',
      definitional: 'definicional',
      predictive: 'predictiva',
      mixed: 'mixta',
    },
    verdicts: {
      supported: 'apoyada',
      contradicted: 'contradicha',
      mixed: 'mixta',
      unverifiable: 'no verificable',
    },
    levels: { low: 'baja', medium: 'media', high: 'alta' },

    copyReport: 'copiar informe',
    copied: 'copiado ✓',
    exportJson: 'exportar JSON',

    examplesLabel: 'ejemplos de prueba',
    examples: {
      tweet: 'tuit ideológico',
      press: 'extracto periodístico',
      corporate: 'comunicado institucional',
    },

    errEmpty: 'Pega primero un texto para analizar.',
    errNoKey: 'El modo Profundo necesita tu clave de la API de Anthropic.',
    errBadKey: 'Clave inválida o sin permisos (la API respondió 401/403).',
    errRateLimit: 'Límite de tasa alcanzado (429). Espera un momento y reintenta.',
    errOverloaded: 'La API está sobrecargada (5xx). Reintenta en un momento.',
    errNetwork:
      'Sin conexión con la API. Revisa tu red (o un bloqueador que interfiera con la llamada).',
    errBadRequest: 'La API rechazó la solicitud (400). Revisa el modelo configurado.',
    errRefusal: 'El modelo declinó analizar este texto.',
    errParse:
      'La respuesta del modelo no se pudo interpretar como informe estructurado. Respuesta cruda:',
    errWebllm: 'El modelo local falló al cargar o generar.',

    disclaimer:
      'El zamuro es un instrumento de lectura crítica, no un oráculo ni un veredicto. Identificar un sesgo no vuelve falsa una conclusión.',
    modelNote: (m) => `modelo: ${m}`,
  },

  en: {
    langName: 'EN',
    title: 'zamuro',
    tagline: 'analyzer of argumentative biases and limits',
    navAnalyzer: 'analyzer',
    navAbout: 'about the zamuro',

    modeFast: 'Fast',
    modeDeep: 'Deep',
    modeFastHint:
      'free and public — a small model runs in your browser. A preview of the method, with openly limited quality.',
    modeDeepHint:
      'the full 7 layers with web verification, using your own Anthropic API key. The cost is yours.',

    inputLabel: 'text to analyze',
    inputPlaceholder:
      'Paste the argumentative text here (a post, an excerpt, a statement)…',
    charCount: (n, max) => `${n}/${max}`,
    contextLegend: 'optional context (nothing is fetched)',
    authorLabel: 'author',
    sourceLabel: 'outlet',
    urlLabel: 'URL',

    analyze: 'Analyze',
    analyzing: 'analyzing…',

    loadingStates: [
      'sniffing the air…',
      'circling overhead…',
      'picking at the carcass…',
      'separating meat from bone…',
      'digesting dead flesh…',
      'cleaning the bones…',
    ],
    webllmDownloading: 'downloading the local model (first time only)…',

    keyLabel: 'Anthropic API key',
    keyPlaceholder: 'sk-ant-…',
    keyPersist: 'remember in this browser',
    keyClear: 'clear key',
    keyNote:
      'Your key lives only in your browser and travels only in the direct call to api.anthropic.com. No intermediary server. Web search carries an additional per-search cost, also on your account.',
    fastViaApi: 'route Fast mode through Anthropic (better quality, uses your key)',

    noWebGPU:
      'Your browser does not support WebGPU, so the local model cannot run. You can use the heuristic analysis (much cruder — lexical patterns, no real judgment) or switch to Deep mode with your key.',
    useHeuristic: 'use heuristic analysis',
    heuristicBadge: 'heuristic — pattern-based, no model',

    reconstructionTitle: 'reconstructed argument',
    thesis: 'thesis (strongest version)',
    claimType: 'claim type',
    premises: 'explicit premises',
    implicitPremises: 'implicit premises',
    warrant: 'warrant',
    findingsTitle: 'findings',
    factualTitle: 'factual verification',
    blindSpotTitle: 'what the argument cannot see',
    excludedPerspectives: 'excluded perspectives',
    authorPosition: 'author’s position',
    strongestCounter: 'strongest counter-position',
    structuralBlindSpot: 'structural blind spot',
    metaTitle: 'integrity check',
    confidence: 'confidence',
    equanimity: 'equanimity',
    errorVsDisagreement: 'clear error vs. reasonable disagreement',
    whyItMatters: 'why it matters',
    improvement: 'how it would be strengthened',
    sources: 'sources',
    noFindings: 'no salient findings — or the text does not argue a position.',

    severity: { mild: 'mild', moderate: 'moderate', serious: 'serious' },
    layer: { logic: 'logic', bias: 'bias', rhetoric: 'rhetoric' },
    claimTypes: {
      empirical: 'empirical',
      normative: 'normative',
      definitional: 'definitional',
      predictive: 'predictive',
      mixed: 'mixed',
    },
    verdicts: {
      supported: 'supported',
      contradicted: 'contradicted',
      mixed: 'mixed',
      unverifiable: 'unverifiable',
    },
    levels: { low: 'low', medium: 'medium', high: 'high' },

    copyReport: 'copy report',
    copied: 'copied ✓',
    exportJson: 'export JSON',

    examplesLabel: 'test examples',
    examples: {
      tweet: 'ideological tweet',
      press: 'press excerpt',
      corporate: 'corporate statement',
    },

    errEmpty: 'Paste a text to analyze first.',
    errNoKey: 'Deep mode needs your Anthropic API key.',
    errBadKey: 'Invalid key or missing permissions (the API returned 401/403).',
    errRateLimit: 'Rate limit reached (429). Wait a moment and retry.',
    errOverloaded: 'The API is overloaded (5xx). Retry in a moment.',
    errNetwork:
      'No connection to the API. Check your network (or a blocker interfering with the call).',
    errBadRequest: 'The API rejected the request (400). Check the configured model.',
    errRefusal: 'The model declined to analyze this text.',
    errParse:
      'The model’s response could not be parsed as a structured report. Raw response:',
    errWebllm: 'The local model failed to load or generate.',

    disclaimer:
      'The zamuro is an instrument of critical reading, not an oracle or a verdict. Finding a bias does not make a conclusion false.',
    modelNote: (m) => `model: ${m}`,
  },
}
