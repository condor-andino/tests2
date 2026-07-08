import { useEffect, useRef, useState } from 'react'
import { config } from '../config.js'
import { examples } from '../examples.js'
import { analyzeDeep, analyzeFastViaApi, ApiError } from '../engine/anthropic.js'
import { analyzeFastLocal, hasWebGPU } from '../engine/webllm.js'
import { analyzeHeuristic } from '../engine/heuristic.js'
import { ParseError } from '../engine/parse.js'
import KeyManager from './KeyManager.jsx'
import Report from './Report.jsx'

const webgpuAvailable = hasWebGPU()

export default function Analyzer({ t, lang }) {
  const [mode, setMode] = useState('fast')
  const [text, setText] = useState('')
  const [author, setAuthor] = useState('')
  const [source, setSource] = useState('')
  const [url, setUrl] = useState('')
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem(config.storageKeys.apiKey) || '',
  )
  const [fastViaApi, setFastViaApi] = useState(false)
  const [busy, setBusy] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState(null)
  const [rawFallback, setRawFallback] = useState('')
  const [report, setReport] = useState(null)
  const loadingTimer = useRef(null)

  // Rota los estados de carga alusivos a la actividad del zamuro.
  useEffect(() => {
    if (!busy) {
      clearInterval(loadingTimer.current)
      return
    }
    let i = 0
    setLoadingMsg(t.loadingStates[0])
    loadingTimer.current = setInterval(() => {
      i = (i + 1) % t.loadingStates.length
      setLoadingMsg(t.loadingStates[i])
    }, 2600)
    return () => clearInterval(loadingTimer.current)
  }, [busy, t])

  const mapError = (e) => {
    if (e instanceof ApiError) {
      return {
        badKey: t.errBadKey,
        rateLimit: t.errRateLimit,
        overloaded: t.errOverloaded,
        network: t.errNetwork,
        badRequest: t.errBadRequest + (e.detail ? ` — ${e.detail}` : ''),
        refusal: t.errRefusal,
      }[e.kind]
    }
    if (e instanceof ParseError) {
      setRawFallback(e.raw)
      return t.errParse
    }
    return `${t.errWebllm} — ${e.message}`
  }

  const run = async (engine) => {
    setError(null)
    setRawFallback('')
    setReport(null)
    const trimmed = text.trim()
    if (!trimmed) {
      setError(t.errEmpty)
      return
    }
    const input = {
      text: trimmed.slice(0, config.maxInputChars),
      author: author.slice(0, config.maxContextChars),
      source: source.slice(0, config.maxContextChars),
      url: url.slice(0, config.maxContextChars),
    }

    if (engine === 'heuristic') {
      setReport(analyzeHeuristic(input, lang))
      return
    }

    if (mode === 'deep' || (mode === 'fast' && fastViaApi)) {
      if (!apiKey.trim()) {
        setError(t.errNoKey)
        return
      }
    }

    setBusy(true)
    try {
      let result
      if (mode === 'deep') {
        result = await analyzeDeep(input, lang, apiKey.trim())
      } else if (fastViaApi && apiKey.trim()) {
        result = await analyzeFastViaApi(input, lang, apiKey.trim())
      } else {
        result = await analyzeFastLocal(input, lang, (p) => {
          if (p?.progress != null && p.progress < 1) {
            setLoadingMsg(
              `${t.webllmDownloading} ${Math.round(p.progress * 100)}%`,
            )
          }
        })
      }
      setReport(result)
    } catch (e) {
      setError(mapError(e))
    } finally {
      setBusy(false)
    }
  }

  const loadExample = (ex) => {
    setText(ex.text)
    setAuthor(ex.author)
    setSource(ex.source)
    setUrl(ex.url)
    setReport(null)
    setError(null)
  }

  const localFastUnavailable = mode === 'fast' && !fastViaApi && !webgpuAvailable

  return (
    <div className="space-y-6">
      {/* Selector de modo */}
      <div className="grid grid-cols-2 overflow-hidden rounded border border-line">
        {[
          ['fast', t.modeFast, t.modeFastHint],
          ['deep', t.modeDeep, t.modeDeepHint],
        ].map(([id, label, hint]) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            aria-pressed={mode === id}
            className={
              'p-4 text-left transition-colors ' +
              (mode === id
                ? 'bg-ink text-paper'
                : 'bg-paper-2 text-ink-2 hover:text-ink')
            }
          >
            <span className="font-display text-xl font-semibold">{label}</span>
            <span
              className={
                'mt-1 block text-[11px] leading-relaxed ' +
                (mode === id ? 'opacity-80' : 'text-muted')
              }
            >
              {hint}
            </span>
          </button>
        ))}
      </div>

      {/* Clave BYOK (Profundo, o Rápido enrutado) */}
      {(mode === 'deep' || fastViaApi) && (
        <KeyManager t={t} apiKey={apiKey} setApiKey={setApiKey} />
      )}
      {mode === 'fast' && (
        <label className="flex items-start gap-2 text-[11px] text-muted">
          <input
            type="checkbox"
            checked={fastViaApi}
            onChange={(e) => setFastViaApi(e.target.checked)}
            className="mt-0.5 accent-(--color-accent)"
          />
          {t.fastViaApi}
        </label>
      )}

      {/* Entrada */}
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="zamuro-text" className="text-xs text-ink-2">
            {t.inputLabel}
          </label>
          <span
            className={
              'text-[11px] ' +
              (text.length >= config.maxInputChars ? 'text-accent' : 'text-muted')
            }
          >
            {t.charCount(text.length, config.maxInputChars)}
          </span>
        </div>
        <textarea
          id="zamuro-text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, config.maxInputChars))}
          placeholder={t.inputPlaceholder}
          rows={4}
          className="mt-1 w-full resize-y rounded border border-line bg-paper-2 p-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <fieldset className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <legend className="mb-1 text-[11px] text-muted">{t.contextLegend}</legend>
          {[
            [t.authorLabel, author, setAuthor],
            [t.sourceLabel, source, setSource],
            [t.urlLabel, url, setUrl],
          ].map(([label, value, setter]) => (
            <input
              key={label}
              type="text"
              value={value}
              onChange={(e) => setter(e.target.value.slice(0, config.maxContextChars))}
              placeholder={label}
              aria-label={label}
              className="rounded border border-line bg-paper-2 px-2 py-1.5 text-xs text-ink placeholder:text-muted focus:border-accent focus:outline-none"
            />
          ))}
        </fieldset>
      </div>

      {/* Ejemplos */}
      <div className="flex flex-wrap items-baseline gap-2 text-[11px]">
        <span className="text-muted">{t.examplesLabel}:</span>
        {examples.map((ex) => (
          <button
            key={ex.id}
            onClick={() => loadExample(ex)}
            className="rounded border border-line px-2 py-0.5 text-ink-2 hover:border-accent hover:text-accent"
          >
            {t.examples[ex.id]}
          </button>
        ))}
      </div>

      {/* Sin WebGPU: aviso + heurístico */}
      {localFastUnavailable && (
        <div className="rounded border border-line bg-paper-2 p-3 text-xs text-ink-2">
          <p>{t.noWebGPU}</p>
          <button
            onClick={() => run('heuristic')}
            className="mt-2 rounded border border-line px-3 py-1 text-ink-2 hover:border-accent hover:text-accent"
          >
            {t.useHeuristic}
          </button>
        </div>
      )}

      {/* Acción */}
      <div>
        <button
          onClick={() => run()}
          disabled={busy || localFastUnavailable}
          className="w-full rounded bg-accent px-4 py-3 font-display text-xl font-semibold text-paper transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-10"
        >
          {busy ? t.analyzing : t.analyze}
        </button>
        {busy && (
          <p className="mt-3 animate-pulse text-xs italic text-muted" role="status">
            {loadingMsg}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded border border-accent/40 bg-paper-2 p-3 text-xs text-accent">
          <p>{error}</p>
          {rawFallback && (
            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-[11px] text-ink-2">
              {rawFallback}
            </pre>
          )}
        </div>
      )}

      {report && <Report report={report} t={t} />}
    </div>
  )
}
