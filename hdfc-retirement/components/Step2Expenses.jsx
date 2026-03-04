'use client';

import { useState } from 'react';
import { LIFESTYLE_PROFILES } from '@/lib/calculator';

function RangeField({ id, label, hint, value, min, max, step = 0.5, suffix = '%', onChange, error }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="field">
      <div className="field-row">
        <label className="field-label" htmlFor={id}>
          {label}
          {hint && <span className="field-hint">{hint}</span>}
        </label>
        <span className="field-val" aria-live="polite">{value}{suffix}</span>
      </div>
      <div className="range-wrap">
        <input
          type="range" className="range" id={id} name={id}
          min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          aria-valuemin={min} aria-valuemax={max}
          aria-valuenow={value} aria-valuetext={`${value}${suffix}`}
          aria-label={label}
          style={{ background: `linear-gradient(to right, #224c87 ${pct}%, #d4d4d4 ${pct}%)` }}
        />
        <div className="range-ends" aria-hidden="true"><span>{min}{suffix}</span><span>{max}{suffix}</span></div>
      </div>
      {error && <div className="err-msg" role="alert">{error}</div>}
    </div>
  );
}

function NumberField({ id, label, hint, value, prefix, suffix, min, max, onChange, error }) {
  return (
    <div className="field">
      <div className="field-row">
        <label className="field-label" htmlFor={id}>
          {label}
          {hint && <span className="field-hint">{hint}</span>}
        </label>
      </div>
      <div className={`num-input-wrap${error ? ' err' : ''}`}>
        {prefix && <span className="inp-pre" aria-hidden="true">{prefix}</span>}
        <input
          type="number" className="num-input" id={id} name={id}
          value={value} min={min} max={max}
          onChange={e => onChange(Number(e.target.value) || 0)}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          inputMode="numeric"
        />
        {suffix && <span className="inp-suf" aria-hidden="true">{suffix}</span>}
      </div>
      {error && <div className="err-msg" role="alert" id={`${id}-err`}>{error}</div>}
    </div>
  );
}

export default function Step2Expenses({ inputs, errors, onChange, onBack, onCalculate, isCalc }) {
  const [showBuckets, setShowBuckets] = useState(false);
  const [showStepUp, setShowStepUp] = useState(false);

  return (
    <div className="anim-in" role="region" aria-label="Step 2: Expenses and Returns">
      <div className="card">
        <div className="card-head">
          <div className="card-head-icon" aria-hidden="true">💼</div>
          <div>
            <h2>Expenses &amp; Returns</h2>
            <p>Define your lifestyle, current expenses, and return assumptions</p>
          </div>
        </div>
        <div className="card-body">

          <div className="note-box" role="note">
            All assumptions below are user-editable and illustrative only.
            Actual market returns may vary. This calculator uses inflation-adjusted projections.
          </div>

          {/* LIFESTYLE PICKER */}
          <fieldset style={{ marginBottom: 24 }}>
            <legend className="fs-legend">
              <span className="num" aria-hidden="true">①</span>
              Retirement Lifestyle
            </legend>
            <div
              className="lifestyle-grid"
              role="radiogroup"
              aria-label="Select your retirement lifestyle"
            >
              {LIFESTYLE_PROFILES.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`lifestyle-btn${inputs.lifestyle === p.id ? ' active' : ''}`}
                  role="radio"
                  aria-checked={inputs.lifestyle === p.id}
                  aria-label={`${p.label}: ${p.description}`}
                  onClick={() => onChange('lifestyle', p.id)}
                  title={p.description}
                >
                  <span className="ls-icon" aria-hidden="true">{p.icon}</span>
                  <span className="ls-label">{p.label}</span>
                  <span className="ls-desc">{p.description}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', marginTop: 2 }}>
                    {p.expenseMultiplier === 1 ? 'Baseline' : p.expenseMultiplier > 1 ? `+${Math.round((p.expenseMultiplier - 1) * 100)}% expenses` : `-${Math.round((1 - p.expenseMultiplier) * 100)}% expenses`}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="sep" role="separator" />

          {/* EXPENSES */}
          <fieldset>
            <legend className="fs-legend">
              <span className="num" aria-hidden="true">②</span>
              Current Annual Expenses
            </legend>
            <NumberField
              id="currentExpense" label="Current Annual Household Expenses"
              hint="Sum of all yearly household costs (housing, food, utilities, etc.)"
              value={inputs.currentExpense} prefix="₹" min={10000} max={100000000}
              onChange={v => onChange('currentExpense', v)}
              error={errors.currentExpense}
            />
          </fieldset>

          <div className="sep" role="separator" />

          {/* RETURN ASSUMPTIONS */}
          <fieldset>
            <legend className="fs-legend">
              <span className="num" aria-hidden="true">③</span>
              Return &amp; Inflation Assumptions
            </legend>

            <RangeField
              id="inflationRate" label="General Inflation Rate (p.a.)"
              hint="Expected annual price increase — illustrative assumption"
              value={inputs.inflationRate} min={2} max={15} step={0.5} suffix="%"
              onChange={v => onChange('inflationRate', v)}
              error={errors.inflationRate}
            />
            <RangeField
              id="preRetirementReturn" label="Pre-Retirement Expected Return (p.a.)"
              hint="Annual return during accumulation phase — equity-oriented"
              value={inputs.preRetirementReturn} min={4} max={20} step={0.5} suffix="%"
              onChange={v => onChange('preRetirementReturn', v)}
              error={errors.preRetirementReturn}
            />
            <RangeField
              id="postRetirementReturn" label="Post-Retirement Expected Return (p.a.)"
              hint="Annual return during retirement — typically debt-oriented, conservative"
              value={inputs.postRetirementReturn} min={2} max={15} step={0.5} suffix="%"
              onChange={v => onChange('postRetirementReturn', v)}
              error={errors.postRetirementReturn}
            />
          </fieldset>

          <div className="sep" role="separator" />

          {/* INFLATION BUCKETS (advanced, user-editable) */}
          <div style={{ marginBottom: 16 }}>
            <button
              type="button" className="stepup-toggle"
              aria-expanded={showBuckets}
              aria-controls="buckets-panel"
              onClick={() => setShowBuckets(v => !v)}
            >
              <span aria-hidden="true">🧮</span>
              Advanced: Expense Bucket Inflation Rates
              <span className="field-hint" style={{ fontStyle: 'italic', fontSize: 11, marginLeft: 4 }}>
                (Medical, Travel, etc. inflate at different rates)
              </span>
              <span className={`stepup-chevron${showBuckets ? ' open' : ''}`} aria-hidden="true">▼</span>
            </button>
            <div
              id="buckets-panel"
              className="stepup-panel"
              style={{ maxHeight: showBuckets ? '480px' : '0' }}
              aria-hidden={!showBuckets}
            >
              <div style={{ paddingTop: 16, borderTop: '1px dashed var(--border)', marginTop: 10 }}>
                <div className="note-box" role="note" style={{ marginBottom: 14 }}>
                  Medical costs typically inflate faster (8–12%). These rates are applied
                  separately to each expense bucket. All assumptions are editable and illustrative.
                </div>
                <RangeField
                  id="dailyInflation" label="Daily Living Inflation (p.a.)"
                  value={inputs.dailyInflation} min={2} max={15} step={0.5} suffix="%"
                  onChange={v => onChange('dailyInflation', v)}
                />
                <RangeField
                  id="medicalInflation" label="Medical / Healthcare Inflation (p.a.)"
                  hint="Medical costs typically rise faster than general inflation"
                  value={inputs.medicalInflation} min={4} max={20} step={0.5} suffix="%"
                  onChange={v => onChange('medicalInflation', v)}
                />
                <RangeField
                  id="travelInflation" label="Travel &amp; Leisure Inflation (p.a.)"
                  value={inputs.travelInflation} min={2} max={15} step={0.5} suffix="%"
                  onChange={v => onChange('travelInflation', v)}
                />
                <RangeField
                  id="dependentsInflation" label="Dependents / Family Inflation (p.a.)"
                  value={inputs.dependentsInflation} min={2} max={15} step={0.5} suffix="%"
                  onChange={v => onChange('dependentsInflation', v)}
                />
              </div>
            </div>
          </div>

          {/* STEP-UP SIP */}
          <div style={{ marginBottom: 8 }}>
            <button
              type="button" className="stepup-toggle"
              aria-expanded={showStepUp}
              aria-controls="stepup-panel"
              onClick={() => setShowStepUp(v => !v)}
            >
              <span aria-hidden="true">📈</span>
              Step-Up SIP (Annual SIP Increase)
              <span className="field-hint" style={{ fontStyle: 'italic', fontSize: 11, marginLeft: 4 }}>
                (As income grows, invest more each year)
              </span>
              <span className={`stepup-chevron${showStepUp ? ' open' : ''}`} aria-hidden="true">▼</span>
            </button>
            <div
              id="stepup-panel"
              className="stepup-panel"
              style={{ maxHeight: showStepUp ? '320px' : '0' }}
              aria-hidden={!showStepUp}
            >
              <div style={{ paddingTop: 16, borderTop: '1px dashed var(--border)', marginTop: 10 }}>
                <div className="note-box" role="note">
                  With Step-Up SIP, your monthly investment increases by a fixed percentage
                  each year — ideal as your income grows. This lowers your initial SIP requirement.
                  Illustrative only.
                </div>
                <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <input
                    type="checkbox"
                    id="useStepUp"
                    checked={inputs.useStepUp}
                    onChange={e => onChange('useStepUp', e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--blue)', cursor: 'pointer' }}
                    aria-label="Enable Step-Up SIP"
                  />
                  <label htmlFor="useStepUp" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', cursor: 'pointer' }}>
                    Enable Step-Up SIP (calculate lower initial SIP)
                  </label>
                </div>
                {inputs.useStepUp && (
                  <RangeField
                    id="stepUpRate" label="Annual Step-Up Rate"
                    hint="Your SIP increases by this % every year"
                    value={inputs.stepUpRate} min={1} max={30} step={1} suffix="%"
                    onChange={v => onChange('stepUpRate', v)}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="nav-btns">
            <button
              type="button" className="btn-secondary"
              onClick={onBack}
              aria-label="Go back to Step 1: Personal Details"
            >
              ← Back
            </button>
            <button
              type="button" className="btn-primary"
              onClick={onCalculate}
              disabled={isCalc}
              aria-label="Calculate retirement plan"
              aria-busy={isCalc}
            >
              {isCalc ? (
                <><span aria-hidden="true">⏳</span> Calculating…</>
              ) : (
                <><span aria-hidden="true">⚡</span> Calculate My Retirement Plan</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
