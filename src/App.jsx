import { useEffect, useState } from 'react'
import { strings } from './i18n.js'
import { config } from './config.js'
import Analyzer from './components/Analyzer.jsx'
import About from './components/About.jsx'

export default function App() {
  const [lang, setLang] = useState(
    () => localStorage.getItem(config.storageKeys.lang) || 'es',
  )
  const [page, setPage] = useState('analyzer')
  const t = strings[lang]

  useEffect(() => {
    localStorage.setItem(config.storageKeys.lang, lang)
    document.documentElement.lang = lang
  }, [lang])

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 sm:px-6">
      <header className="border-b border-line py-6">
        <div className="flex items-baseline justify-between gap-4">
          <button
            onClick={() => setPage('analyzer')}
            className="font-display text-4xl font-semibold tracking-wide text-ink"
          >
            zamuro<span className="text-accent">.</span>
          </button>
          <div className="flex items-center gap-3 text-xs">
            {['es', 'en'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={
                  l === lang
                    ? 'text-accent underline underline-offset-4'
                    : 'text-muted hover:text-ink'
                }
              >
                {strings[l].langName}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-1 text-xs text-muted">{t.tagline}</p>
        <nav className="mt-4 flex gap-5 text-xs">
          {[
            ['analyzer', t.navAnalyzer],
            ['about', t.navAbout],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={
                page === id
                  ? 'text-accent underline underline-offset-4'
                  : 'text-muted hover:text-ink'
              }
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 py-8">
        {page === 'analyzer' ? <Analyzer t={t} lang={lang} /> : <About t={t} lang={lang} />}
      </main>

      <footer className="border-t border-line py-6 text-xs text-muted">
        <p className="italic">{t.disclaimer}</p>
      </footer>
    </div>
  )
}
