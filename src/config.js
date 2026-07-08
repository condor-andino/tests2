// ─── Configuración del zamuro ───────────────────────────────────────────────
// Todo lo editable vive aquí: modelos, límites y parámetros de las llamadas.

export const config = {
  // Límite de longitud de entrada (UX). El spec fija 280 caracteres — formato
  // post de X. Súbelo si quieres analizar textos largos; el modo Profundo
  // maneja miles de caracteres sin problema (el Rápido, en un modelo 3B en el
  // navegador, agradece entradas cortas).
  maxInputChars: 280,
  maxContextChars: 120, // autor / medio / URL (campos opcionales)

  // ── Modo Rápido: modelo local en el navegador (WebLLM sobre WebGPU) ──────
  // Cualquier ID del catálogo MLC sirve: https://mlc.ai/models
  // Alternativas: "Qwen2.5-3B-Instruct-q4f16_1-MLC", "Llama-3.2-1B-Instruct-q4f16_1-MLC"
  webllmModel: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
  webllmMaxTokens: 1400,

  // ── Modo Profundo: BYOK contra la API de Anthropic ───────────────────────
  deepModel: 'claude-opus-4-8', // alternativas: 'claude-sonnet-5' (más barato)
  deepMaxTokens: 8192,
  // Versión de la herramienta de búsqueda web. 'web_search_20260209' requiere
  // Opus 4.8/4.7/4.6, Sonnet 5 o Sonnet 4.6; para modelos anteriores usa
  // 'web_search_20250305'.
  webSearchTool: 'web_search_20260209',
  webSearchMaxUses: 5,

  // ── Opcional: si hay clave, el modo Rápido puede enrutarse por Anthropic ─
  fastViaApiModel: 'claude-haiku-4-5',
  fastViaApiMaxTokens: 2048,

  anthropicVersion: '2023-06-01',
  anthropicUrl: 'https://api.anthropic.com/v1/messages',

  // Continuaciones máximas cuando la API pausa un turno largo de búsqueda web
  // (stop_reason: "pause_turn").
  maxPauseTurnContinuations: 3,

  storageKeys: {
    apiKey: 'zamuro_api_key',
    persistKey: 'zamuro_persist_key',
    lang: 'zamuro_lang',
  },
}
