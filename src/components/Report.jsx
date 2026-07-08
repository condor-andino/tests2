import { useState } from 'react'
import { reportToMarkdown } from '../engine/parse.js'
import Finding from './Finding.jsx'

function Section({ title, children }) {
  return (
    <section className="border-t border-line pt-5">
      <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  )
}

function Row({ label, children }) {
  if (!children || (Array.isArray(children) && !children.length)) return null
  return (
    <div>
      <span className="text-[11px] uppercase tracking-wider text-muted">{label}</span>
      <div className="text-sm text-ink">{children}</div>
    </div>
  )
}

export default function Report({ report, t }) {
  const [copied, setCopied] = useState(false)
  const conf = report.meta?.confidence || report.confidence
  const rec = report.reconstruction

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reportToMarkdown(report, t))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* portapapeles no disponible */ }
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'zamuro-report.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <article className="space-y-6" data-testid="report">
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
        <span className="rounded border border-line px-2 py-0.5">
          {report.mode === 'deep' ? t.modeDeep : t.modeFast}
        </span>
        {report.engine === 'heuristic' ? (
          <span className="rounded border border-accent/40 px-2 py-0.5 text-accent">
            {t.heuristicBadge}
          </span>
        ) : (
          <span className="rounded border border-line px-2 py-0.5">
            {t.modelNote(report.model)}
          </span>
        )}
        <span className="flex-1" />
        <button
          onClick={copy}
          className="rounded border border-line px-2 py-0.5 hover:border-accent hover:text-accent"
        >
          {copied ? t.copied : t.copyReport}
        </button>
        <button
          onClick={exportJson}
          className="rounded border border-line px-2 py-0.5 hover:border-accent hover:text-accent"
        >
          {t.exportJson}
        </button>
      </div>

      {(rec.thesis || rec.premises.length > 0) && (
        <Section title={t.reconstructionTitle}>
          <Row label={t.thesis}>{rec.thesis}</Row>
          <Row label={t.claimType}>
            {rec.thesis ? t.claimTypes[rec.claim_type] : null}
          </Row>
          <Row label={t.premises}>
            {rec.premises.length > 0 && (
              <ul className="list-inside list-disc">
                {rec.premises.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            )}
          </Row>
          <Row label={t.implicitPremises}>
            {rec.implicit_premises.length > 0 && (
              <ul className="list-inside list-disc">
                {rec.implicit_premises.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            )}
          </Row>
          <Row label={t.warrant}>{rec.warrant}</Row>
        </Section>
      )}

      <Section title={t.findingsTitle}>
        {report.findings.length === 0 && (
          <p className="text-sm text-muted">{t.noFindings}</p>
        )}
        {report.findings.map((f, i) => (
          <Finding key={i} finding={f} t={t} />
        ))}
      </Section>

      {report.factual_checks && report.factual_checks.length > 0 && (
        <Section title={t.factualTitle}>
          {report.factual_checks.map((c, i) => (
            <div key={i} className="rounded border border-line bg-paper-2 p-3">
              <p className="text-sm text-ink">
                <span className="mr-2 rounded border border-line px-1.5 py-0.5 text-[11px] uppercase tracking-wider text-accent">
                  {t.verdicts[c.verdict]}
                </span>
                {c.claim}
              </p>
              {c.explanation && (
                <p className="mt-2 text-xs text-ink-2">{c.explanation}</p>
              )}
              {c.sources.length > 0 && (
                <p className="mt-2 text-[11px] text-muted">
                  {t.sources}:{' '}
                  {c.sources.map((s, j) => (
                    <a
                      key={j}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mr-2 underline underline-offset-2 hover:text-accent"
                    >
                      {s.title || s.url}
                    </a>
                  ))}
                </p>
              )}
            </div>
          ))}
        </Section>
      )}

      {report.blind_spot &&
        (report.blind_spot.structural_blind_spot ||
          report.blind_spot.excluded_perspectives.length > 0) && (
          <Section title={t.blindSpotTitle}>
            <Row label={t.excludedPerspectives}>
              {report.blind_spot.excluded_perspectives.length > 0 && (
                <ul className="list-inside list-disc">
                  {report.blind_spot.excluded_perspectives.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              )}
            </Row>
            <Row label={t.authorPosition}>{report.blind_spot.author_position}</Row>
            <Row label={t.strongestCounter}>{report.blind_spot.strongest_counter}</Row>
            <Row label={t.structuralBlindSpot}>
              {report.blind_spot.structural_blind_spot}
            </Row>
          </Section>
        )}

      <Section title={t.metaTitle}>
        <Row label={t.confidence}>
          {t.levels[conf.level]}
          {conf.note ? ` — ${conf.note}` : ''}
        </Row>
        {report.meta?.equanimity_note && (
          <Row label={t.equanimity}>{report.meta.equanimity_note}</Row>
        )}
        {report.meta?.clear_error_vs_disagreement && (
          <Row label={t.errorVsDisagreement}>
            {report.meta.clear_error_vs_disagreement}
          </Row>
        )}
      </Section>
    </article>
  )
}
