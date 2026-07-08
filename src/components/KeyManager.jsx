import { useState } from 'react'
import { config } from '../config.js'

// La clave del usuario: por defecto solo en memoria; persistir en localStorage
// es opt-in, y el botón de borrar limpia ambos sitios.
export default function KeyManager({ t, apiKey, setApiKey }) {
  const [persist, setPersist] = useState(
    () => localStorage.getItem(config.storageKeys.persistKey) === '1',
  )

  const update = (value) => {
    setApiKey(value)
    if (persist) localStorage.setItem(config.storageKeys.apiKey, value)
  }

  const togglePersist = (on) => {
    setPersist(on)
    if (on) {
      localStorage.setItem(config.storageKeys.persistKey, '1')
      if (apiKey) localStorage.setItem(config.storageKeys.apiKey, apiKey)
    } else {
      localStorage.removeItem(config.storageKeys.persistKey)
      localStorage.removeItem(config.storageKeys.apiKey)
    }
  }

  const clear = () => {
    setApiKey('')
    localStorage.removeItem(config.storageKeys.apiKey)
  }

  return (
    <div className="rounded border border-line bg-paper-2 p-3">
      <label htmlFor="zamuro-key" className="text-xs text-ink-2">
        {t.keyLabel}
      </label>
      <div className="mt-1 flex gap-2">
        <input
          id="zamuro-key"
          type="password"
          value={apiKey}
          onChange={(e) => update(e.target.value)}
          placeholder={t.keyPlaceholder}
          autoComplete="off"
          className="flex-1 rounded border border-line bg-paper px-2 py-1.5 text-xs text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <button
          onClick={clear}
          className="rounded border border-line px-3 py-1.5 text-[11px] text-ink-2 hover:border-accent hover:text-accent"
        >
          {t.keyClear}
        </button>
      </div>
      <label className="mt-2 flex items-center gap-2 text-[11px] text-muted">
        <input
          type="checkbox"
          checked={persist}
          onChange={(e) => togglePersist(e.target.checked)}
          className="accent-(--color-accent)"
        />
        {t.keyPersist}
      </label>
      <p className="mt-2 text-[11px] leading-relaxed text-muted">{t.keyNote}</p>
    </div>
  )
}
