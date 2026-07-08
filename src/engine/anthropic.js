// Modo Profundo (y Rápido enrutado): llamada directa desde el navegador a la
// API de Anthropic con la clave del propio usuario (BYOK).
//
// - La clave viaja únicamente en el header `x-api-key` de esta llamada; no
//   existe ningún servidor intermedio.
// - `anthropic-dangerous-direct-browser-access: true` habilita CORS en la API.
// - La búsqueda web es una herramienta de servidor: se declara en `tools` y
//   corre en la infraestructura de Anthropic dentro de la misma llamada.
// - Turnos largos de búsqueda pueden devolver `stop_reason: "pause_turn"`;
//   se reenvía la conversación con el turno del asistente anexado y la API
//   retoma donde quedó.

import { config } from '../config.js'
import { buildSystemPrompt, buildUserMessage } from './prompt.js'
import { parseReport } from './parse.js'

export class ApiError extends Error {
  constructor(kind, detail) {
    super(kind)
    this.name = 'ApiError'
    this.kind = kind // 'badKey' | 'rateLimit' | 'overloaded' | 'badRequest' | 'network' | 'refusal'
    this.detail = detail
  }
}

async function callMessages(apiKey, body) {
  let res
  try {
    res = await fetch(config.anthropicUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': config.anthropicVersion,
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body),
    })
  } catch (e) {
    throw new ApiError('network', e.message)
  }

  if (!res.ok) {
    let detail = ''
    try {
      detail = (await res.json())?.error?.message || ''
    } catch { /* cuerpo no-JSON */ }
    if (res.status === 401 || res.status === 403) throw new ApiError('badKey', detail)
    if (res.status === 429) throw new ApiError('rateLimit', detail)
    if (res.status >= 500) throw new ApiError('overloaded', detail)
    throw new ApiError('badRequest', detail)
  }
  return res.json()
}

function lastText(content) {
  const texts = (content || []).filter((b) => b.type === 'text')
  return texts.length ? texts[texts.length - 1].text : ''
}

async function runConversation(apiKey, { model, maxTokens, system, tools, userMessage }) {
  let messages = [{ role: 'user', content: userMessage }]
  const base = {
    model,
    max_tokens: maxTokens,
    system,
    thinking: { type: 'adaptive' },
    messages,
  }
  if (tools) base.tools = tools

  let resp = await callMessages(apiKey, base)

  // La API pausa turnos largos con herramientas de servidor; se reanuda
  // reenviando la conversación tal cual, con el turno del asistente anexado.
  let continuations = 0
  while (resp.stop_reason === 'pause_turn' && continuations < config.maxPauseTurnContinuations) {
    continuations++
    messages = [...messages, { role: 'assistant', content: resp.content }]
    resp = await callMessages(apiKey, { ...base, messages })
  }

  if (resp.stop_reason === 'refusal') {
    throw new ApiError('refusal', resp.stop_details?.explanation || '')
  }
  return lastText(resp.content)
}

export async function analyzeDeep(input, lang, apiKey) {
  const text = await runConversation(apiKey, {
    model: config.deepModel,
    maxTokens: config.deepMaxTokens,
    system: buildSystemPrompt('deep', lang),
    tools: [
      {
        type: config.webSearchTool,
        name: 'web_search',
        max_uses: config.webSearchMaxUses,
      },
    ],
    userMessage: buildUserMessage(input, lang),
  })
  return parseReport(text, { mode: 'deep', engine: 'anthropic', model: config.deepModel })
}

// Opcional: modo Rápido enrutado por Anthropic cuando hay clave presente.
// Capas 1–4 condensadas, sin búsqueda web, en un modelo pequeño y barato.
export async function analyzeFastViaApi(input, lang, apiKey) {
  const text = await runConversation(apiKey, {
    model: config.fastViaApiModel,
    maxTokens: config.fastViaApiMaxTokens,
    system: buildSystemPrompt('fast', lang),
    userMessage: buildUserMessage(input, lang),
  })
  return parseReport(text, { mode: 'fast', engine: 'anthropic', model: config.fastViaApiModel })
}
