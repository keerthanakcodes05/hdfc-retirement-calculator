'use client';

import { useState } from 'react';
import { formatINR } from '@/lib/calculator';
import CorpusGauge from './CorpusGauge';
import ProjectionChart from './ProjectionChart';

export default function ResultsPanel({ results, onReset }) {
  const [chartTab, setChartTab] = useState('accumulation');

  const {
    retirementAnnualExpense, requiredCorpus, flatSIP, stepUpSIP, displaySIP,
    totalInvested, projectedCorpus, bucketResult, buckets,
    accTimeline, depletion, health,
    yearsToRet, retDuration, inputs, adjustedExpense, profile,
  } = results;

  const { currentAge, retirementAge, lifeExpectancy, useStepUp, stepUpRate } = inputs;
  const shortfall = Math.max(0, requiredCorpus - projectedCorpus);
  const surplus = Math.max(0, projectedCorpus - requiredCorpus);
  const wealthGains = Math.max(0, projectedCorpus - totalInvested);

  // Bucket names for display
  const bucketNames = {
    daily: 'Daily Living',
    medical: 'Medical / Healthcare',
    travel: 'Travel & Leisure',
    dependents: 'Dependents / Family',
  };

  // Life timeline props
  const totalSpan = Math.max(1, lifeExpectancy - currentAge);
  const accPct = (yearsToRet / totalSpan) * 100;
  const retPct = (retDuration / totalSpan) * 100;

  return (
    <div className="anim-in" role="region" aria-label="Retirement plan results" aria-live="polite">

      {/* ── TOP: RESULTS HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>
            Your Retirement Plan
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
            {profile?.icon} {profile?.label} lifestyle · Age {currentAge}→{retirementAge}→{lifeExpectancy}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="print-btn"
            onClick={() => window.print()}
            aria-label="Print this retirement plan"
          >
            🖨️ Print Plan
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={onReset}
            aria-label="Start over and recalculate"
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            ↩ Recalculate
          </button>
        </div>
      </div>

      {/* ── CORPUS HEALTH METER ── */}
      <div style={{ marginBottom: 20 }}>
        <CorpusGauge
          health={health}
          projectedCorpus={projectedCorpus}
          requiredCorpus={requiredCorpus}
          shortfall={shortfall}
          surplus={surplus}
        />
      </div>

      {/* ── PRIMARY METRICS ── */}
      <div className="results-grid" style={{ marginBottom: 20 }}>
        {/* Required Monthly SIP */}
        <div className="card">
          <div className="card-head">
            <div className="card-head-icon" aria-hidden="true">📅</div>
            <div>
              <h2>Required Monthly SIP</h2>
              <p>To build your retirement corpus</p>
            </div>
          </div>
          <div className="card-body">
            <div
              className="metric blue"
              style={{ marginBottom: 12 }}
              aria-label={`Required monthly SIP: ${formatINR(displaySIP)}`}
            >
              <div className="metric-label">
                {useStepUp ? `Step-Up SIP (grows ${stepUpRate}%/yr)` : 'Flat Monthly SIP'}
              </div>
              <div className="metric-val" style={{ fontSize: 28 }}>{formatINR(displaySIP)}</div>
              <div className="metric-sub">per month for {yearsToRet} years</div>
            </div>
            {useStepUp && flatSIP && (
              <div className="metric" style={{ background: 'var(--grey-faint)', border: '1px solid var(--border)' }}>
                <div className="metric-label" style={{ color: 'var(--text4)' }}>Without Step-Up (flat SIP)</div>
                <div className="metric-val" style={{ color: 'var(--text)', fontSize: 18 }}>{formatINR(flatSIP)}</div>
                <div className="metric-sub">You save {formatINR(flatSIP - displaySIP)}/mo initially with step-up</div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
              <div className="metric gold">
                <div className="metric-label">Total Invested</div>
                <div className="metric-val" style={{ fontSize: 17 }}>{formatINR(totalInvested, true)}</div>
              </div>
              <div className="metric green-card">
                <div className="metric-label">Market Returns</div>
                <div className="metric-val" style={{ fontSize: 17 }}>{formatINR(wealthGains, true)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Corpus Summary */}
        <div className="card">
          <div className="card-head" style={{ background: 'linear-gradient(135deg, #12213a 0%, var(--blue-dark) 100%)' }}>
            <div className="card-head-icon" aria-hidden="true">🏦</div>
            <div>
              <h2>Corpus Summary</h2>
              <p>Step 1 → 2 → 3 breakdown</p>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { step: '①', label: 'Inflation-Adjusted Annual Expense at Retirement', val: retirementAnnualExpense, cls: 'blue', note: `After ${yearsToRet} yrs inflation` },
                { step: '②', label: 'Required Retirement Corpus', val: requiredCorpus, cls: 'gold', note: `For ${retDuration} yrs post-retirement` },
                { step: '③', label: 'Projected Corpus (from SIP)', val: projectedCorpus, cls: health.score >= 100 ? 'green-card' : 'red-card', note: health.score >= 100 ? `Surplus: ${formatINR(surplus, true)}` : `Shortfall: ${formatINR(shortfall, true)}` },
              ].map(m => (
                <div key={m.step} className={`metric ${m.cls}`} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, minWidth: 28, color: 'inherit', opacity: 0.7 }}>{m.step}</div>
                  <div style={{ flex: 1 }}>
                    <div className="metric-label">{m.label}</div>
                    <div className="metric-val" style={{ fontSize: 19 }}>{formatINR(m.val, true)}</div>
                    <div className="metric-sub">{m.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── LIFE TIMELINE ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-head">
          <div className="card-head-icon" aria-hidden="true">📅</div>
          <div><h2>Your Life Timeline</h2><p>Accumulation & retirement phases at a glance</p></div>
        </div>
        <div className="card-body timeline-card" style={{ padding: '20px 24px' }}>
          <div
            className="timeline-bar"
            role="img"
            aria-label={`Life timeline: ${yearsToRet} years of accumulation (age ${currentAge} to ${retirementAge}), then ${retDuration} years of retirement (age ${retirementAge} to ${lifeExpectancy})`}
          >
            <div className="tbar-acc" style={{ width: `${accPct}%` }}>
              <span className="tbar-label">Accumulation · Age {currentAge}–{retirementAge} · {yearsToRet} yrs</span>
            </div>
            <div className="tbar-ret" style={{ width: `${retPct}%` }}>
              <span className="tbar-label">Retirement · Age {retirementAge}–{lifeExpectancy} · {retDuration} yrs</span>
            </div>
          </div>
          <div className="timeline-legend" aria-hidden="true">
            <div className="tleg-item"><div className="tleg-dot" style={{ background: 'var(--blue)' }} />Accumulation: SIP of {formatINR(displaySIP)}/mo for {yearsToRet} yrs</div>
            <div className="tleg-item"><div className="tleg-dot" style={{ background: '#f59e0b' }} />Retirement: Draw {formatINR(retirementAnnualExpense / 12, true)}/mo for {retDuration} yrs</div>
          </div>
          {depletion.sustainable ? (
            <div style={{ marginTop: 14, padding: '10px 16px', background: 'var(--green-faint)', borderRadius: 'var(--r-sm)', border: '1px solid #a8d9bc', fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>
              ✅ Your corpus is projected to sustain through your full retirement of {retDuration} years. (Illustrative)
            </div>
          ) : (
            <div style={{ marginTop: 14, padding: '10px 16px', background: '#fff5f5', borderRadius: 'var(--r-sm)', border: '1px solid #f5c0be', fontSize: 13, color: 'var(--red)', fontWeight: 600 }}>
              ⚠️ Corpus may deplete in Year {depletion.depletionYear} of retirement. Consider increasing your SIP. (Illustrative)
            </div>
          )}
        </div>
      </div>

      {/* ── EXPENSE BUCKET BREAKDOWN ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-head">
          <div className="card-head-icon" aria-hidden="true">🧮</div>
          <div><h2>Expense Bucket Breakdown</h2><p>Inflation-adjusted expense split at retirement</p></div>
        </div>
        <div className="card-body">
          <div className="bucket-grid" role="list" aria-label="Expense buckets at retirement">
            {Object.entries(bucketNames).map(([key, name]) => {
              const val = bucketResult[key] || 0;
              const pct = bucketResult.total > 0 ? Math.round((val / bucketResult.total) * 100) : 0;
              const icons = { daily: '🛒', medical: '🏥', travel: '✈️', dependents: '👨‍👩‍👧' };
              return (
                <div key={key} className="bucket-item" role="listitem" aria-label={`${name}: ${formatINR(val, true)} per year (${pct}%)`}>
                  <div className="bucket-name">{icons[key]} {name}</div>
                  <div className="bucket-val">{formatINR(val, true)}<span className="bucket-pct"> / yr</span></div>
                  <div className="bucket-pct">{pct}% of total expenses</div>
                  <div style={{ marginTop: 6, height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--blue)', borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--blue-faint)', borderRadius: 'var(--r-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)' }}>Total Annual Expense at Retirement</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--blue)' }}>{formatINR(bucketResult.total, true)}</span>
          </div>
        </div>
      </div>

      {/* ── CHARTS ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-head">
          <div className="card-head-icon" aria-hidden="true">📊</div>
          <div><h2>Projections</h2><p>Visual breakdown of your accumulation and retirement phases</p></div>
        </div>
        <div className="card-body">
          <div
            className="chart-tabs"
            role="tablist"
            aria-label="Chart view options"
          >
            {[
              { id: 'accumulation', label: 'Corpus Build-Up' },
              { id: 'depletion', label: 'Retirement Withdrawal' },
              { id: 'table', label: 'Year-wise Table' },
            ].map(t => (
              <button
                key={t.id}
                className={`ctab${chartTab === t.id ? ' active' : ''}`}
                role="tab"
                aria-selected={chartTab === t.id}
                aria-controls={`tabpanel-${t.id}`}
                id={`tab-${t.id}`}
                type="button"
                onClick={() => setChartTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div
            id={`tabpanel-${chartTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${chartTab}`}
            tabIndex={0}
          >
            {chartTab === 'accumulation' && (
              <ProjectionChart
                data={accTimeline}
                type="accumulation"
                labels={accTimeline.map(d => `Age ${currentAge + d.year}`)}
              />
            )}
            {chartTab === 'depletion' && (
              <ProjectionChart
                data={depletion.timeline}
                type="depletion"
                labels={depletion.timeline.map(d => `Yr ${d.year} (Age ${retirementAge + d.year})`)}
              />
            )}
            {chartTab === 'table' && (
              <YearwiseTable data={accTimeline} currentAge={currentAge} />
            )}
          </div>
        </div>
      </div>

      {/* ── INSIGHTS ── */}
      <div className="insights-row" role="region" aria-label="Financial insights">
        <div className="insight-card">
          <span className="insight-icon" aria-hidden="true">💡</span>
          <div className="insight-text">
            Investing <strong>{formatINR(displaySIP)}/month</strong> for {yearsToRet} years,
            the market contributes <strong>{formatINR(wealthGains, true)}</strong> in returns —
            that's {Math.round((wealthGains / (totalInvested || 1)) * 100)}% extra wealth through compounding.
          </div>
        </div>
        <div className="insight-card">
          <span className="insight-icon" aria-hidden="true">🏥</span>
          <div className="insight-text">
            Healthcare costs inflate at <strong>{inputs.medicalInflation}% p.a.</strong> — 
            your medical budget grows to <strong>{formatINR(bucketResult.medical, true)}/yr</strong> by retirement.
            Plan a health buffer.
          </div>
        </div>
        <div className="insight-card">
          <span className="insight-icon" aria-hidden="true">📅</span>
          <div className="insight-text">
            You have <strong>{yearsToRet} working years</strong> to build your corpus and 
            <strong> {retDuration} retirement years</strong> to fund. The longer you invest,
            the less you need to put in each month.
          </div>
        </div>
        <div className="insight-card">
          <span className="insight-icon" aria-hidden="true">⚠️</span>
          <div className="insight-text">
            Post-retirement return is assumed at <strong>{inputs.postRetirementReturn}%</strong>.
            A conservative, debt-oriented portfolio helps preserve capital
            during retirement. Consult a financial advisor for personalised guidance.
          </div>
        </div>
      </div>

      {/* ── MANDATORY DISCLAIMER ── */}
      <div className="disclaimer" role="note" aria-label="Important disclaimer">
        <div className="disclaimer-title">
          <span aria-hidden="true">⚠</span> Important Disclaimer
        </div>
        <p className="disclaimer-text">
          This tool has been designed for information purposes only. Actual results may vary
          depending on various factors involved in capital market. Investor should not consider
          above as a recommendation for any schemes of HDFC Mutual Fund. Past performance may
          or may not be sustained in future and is not a guarantee of any future returns.
          Mutual Fund investments are subject to market risks, read all scheme related documents
          carefully. All projections shown are purely illustrative and based on assumed rates of
          return. They do not represent guaranteed or likely outcomes.
        </p>
      </div>
    </div>
  );
}

// ── YEAR-WISE TABLE ────────────────────────────────────────────────────────
function YearwiseTable({ data, currentAge }) {
  return (
    <div className="chart-box">
      <div className="tbl-wrap" role="region" aria-label="Year-wise corpus accumulation table">
        <table className="tbl" aria-label="Year-wise SIP corpus build-up">
          <caption className="sr-only">
            Year-by-year breakdown of SIP amount invested, returns earned, and total corpus value
          </caption>
          <thead>
            <tr>
              <th scope="col">Year / Age</th>
              <th scope="col">Monthly SIP</th>
              <th scope="col">Cumul. Invested</th>
              <th scope="col">Returns</th>
              <th scope="col">Corpus Value</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.year}>
                <td>Yr {row.year} · Age {currentAge + row.year}</td>
                <td className="tc-blue">{formatINR(row.sip, true)}</td>
                <td>{formatINR(row.invested, true)}</td>
                <td className="tc-gold">{formatINR(row.returns, true)}</td>
                <td className="tc-green">{formatINR(row.value, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
