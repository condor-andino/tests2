import { useState } from 'react'

const severityStyle = {
  mild: 'text-muted border-line',
  moderate: 'text-accent-2 border-accent-2/50',
  serious: 'text-accent border-accent/60',
}

// Hallazgo expandible: qué es, dónde (cita), por qué importa, severidad.
export default function Finding({ finding, t }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded border border-line bg-paper-2">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-baseline gap-2 p-3 text-left"
      >
        <span className="text-[11px] text-muted">{open ? '−' : '+'}</span>
        <span className="flex-1 text-sm font-medium text-ink">{finding.label}</span>
        <span className="rounded border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted">
          {t.layer[finding.layer]}
        </span>
        <span
          className={
            'rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ' +
            severityStyle[finding.severity]
          }
        >
          {t.severity[finding.severity]}
        </span>
      </button>
      {open && (
        <div className="space-y-2 border-t border-line p-3 text-xs text-ink-2">
          {finding.quote && (
            <blockquote className="border-l-2 border-accent pl-3 italic text-ink">
              «{finding.quote}»
            </blockquote>
          )}
          {finding.explanation && <p>{finding.explanation}</p>}
          {finding.why_it_matters && (
            <p>
              <span className="text-[11px] uppercase tracking-wider text-muted">
                {t.whyItMatters}:
              </span>{' '}
              {finding.why_it_matters}
            </p>
          )}
          {finding.improvement && (
            <p>
              <span className="text-[11px] uppercase tracking-wider text-muted">
                {t.improvement}:
              </span>{' '}
              {finding.improvement}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
