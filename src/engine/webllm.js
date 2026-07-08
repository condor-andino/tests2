// Modo Rápido: un modelo cuantizado corre en el navegador del visitante vía
// WebLLM (MLC) sobre WebGPU. Sin login, sin clave, sin costo para nadie.
//
// - La librería se importa de forma diferida para no engordar el bundle
//   inicial; el modelo (~2 GB) se descarga una sola vez y queda cacheado por
//   WebLLM en el Cache API del navegador.
// - Si no hay WebGPU, la UI ofrece el analizador heurístico o el modo Profundo.

import { config } from '../config.js'
import { buildSystemPrompt, buildUserMessage } from './prompt.js'
import { parseReport } from './parse.js'

export function hasWebGPU() {
  return typeof navigator !== 'undefined' && !!navigator.gpu
}

let enginePromise = null

async function getEngine(onProgress) {
  if (!enginePromise) {
    enginePromise = (async () => {
      const webllm = await import('@mlc-ai/web-llm')
      return webllm.CreateMLCEngine(config.webllmModel, {
        initProgressCallback: (p) => onProgress?.(p),
      })
    })().catch((e) => {
      enginePromise = null // permite reintentar tras un fallo de descarga
      throw e
    })
  }
  return enginePromise
}

export async function analyzeFastLocal(input, lang, onProgress) {
  const engine = await getEngine(onProgress)
  const reply = await engine.chat.completions.create({
    messages: [
      { role: 'system', content: buildSystemPrompt('fast', lang) },
      { role: 'user', content: buildUserMessage(input, lang) },
    ],
    temperature: 0.2,
    max_tokens: config.webllmMaxTokens,
  })
  const text = reply.choices?.[0]?.message?.content || ''
  return parseReport(text, { mode: 'fast', engine: 'webllm', model: config.webllmModel })
}
