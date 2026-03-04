'use client';

function RangeField({ id, label, hint, value, min, max, step = 1, suffix = '', onChange, error }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="field">
      <div className="field-row">
        <label className="field-label" htmlFor={id}>
          {label}
          {hint && <span className="field-hint">{hint}</span>}
        </label>
        <span className="field-val" aria-live="polite" aria-label={`${label}: ${value}${suffix}`}>
          {value}{suffix}
        </span>
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
        <div className="range-ends" aria-hidden="true">
          <span>{min}{suffix}</span>
          <span>{max}{suffix}</span>
        </div>
      </div>
      {error && <div className="err-msg" role="alert">{error}</div>}
    </div>
  );
}

export default function Step1Personal({ inputs, errors, onChange, onNext }) {
  const { currentAge, retirementAge, lifeExpectancy } = inputs;
  const yearsToRet = Math.max(0, retirementAge - currentAge);
  const retDuration = Math.max(0, lifeExpectancy - retirementAge);
  const totalSpan = Math.max(1, lifeExpectancy - currentAge);
  const accPct = (yearsToRet / totalSpan) * 100;
  const retPct = (retDuration / totalSpan) * 100;

  return (
    <div className="anim-in" role="region" aria-label="Step 1: Personal Details">
      <div className="card">
        <div className="card-head">
          <div className="card-head-icon" aria-hidden="true">👤</div>
          <div>
            <h2>Personal Details</h2>
            <p>Set your age milestones to define accumulation and retirement phases</p>
          </div>
        </div>
        <div className="card-body">

          {/* Assumption note */}
          <div className="note-box" role="note">
            All inputs below are editable assumptions used for illustrative projection only.
            Actual outcomes may differ based on market conditions and personal circumstances.
          </div>

          <fieldset>
            <legend className="fs-legend">
              <span className="num" aria-hidden="true">①</span>
              Age Milestones
            </legend>

            <RangeField
              id="currentAge" label="Current Age" suffix=" yrs"
              hint="Your age today"
              value={currentAge} min={18} max={70}
              onChange={v => onChange('currentAge', v)}
              error={errors.currentAge}
            />
            <RangeField
              id="retirementAge" label="Planned Retirement Age" suffix=" yrs"
              hint="Age at which you plan to retire"
              value={retirementAge} min={40} max={80}
              onChange={v => onChange('retirementAge', v)}
              error={errors.retirementAge}
            />
            <RangeField
              id="lifeExpectancy" label="Life Expectancy" suffix=" yrs"
              hint="Plan conservatively — longer is safer"
              value={lifeExpectancy} min={50} max={100}
              onChange={v => onChange('lifeExpectancy', v)}
              error={errors.lifeExpectancy}
            />
          </fieldset>

          {/* Life Timeline Preview */}
          {yearsToRet > 0 && retDuration > 0 && (
            <div style={{ marginTop: 8 }}>
              <div className="timeline-title" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                Your Life Timeline Preview
              </div>
              <div
                className="timeline-bar"
                role="img"
                aria-label={`Life timeline: ${yearsToRet} years accumulation phase (age ${currentAge}–${retirementAge}), then ${retDuration} years retirement phase (age ${retirementAge}–${lifeExpectancy})`}
              >
                <div className="tbar-acc" style={{ width: `${accPct}%` }}>
                  <span className="tbar-label">
                    {accPct > 20 ? `Accumulation · ${yearsToRet} yrs` : ''}
                  </span>
                </div>
                <div className="tbar-ret" style={{ width: `${retPct}%` }}>
                  <span className="tbar-label">
                    {retPct > 15 ? `Retirement · ${retDuration} yrs` : ''}
                  </span>
                </div>
              </div>
              <div className="timeline-legend" aria-hidden="true">
                <div className="tleg-item">
                  <div className="tleg-dot" style={{ background: 'var(--blue)' }} />
                  Accumulation: Age {currentAge}–{retirementAge} ({yearsToRet} yrs)
                </div>
                <div className="tleg-item">
                  <div className="tleg-dot" style={{ background: '#f59e0b' }} />
                  Retirement: Age {retirementAge}–{lifeExpectancy} ({retDuration} yrs)
                </div>
              </div>
            </div>
          )}

          <div className="nav-btns">
            <button
              type="button" className="btn-primary"
              onClick={onNext}
              aria-label="Proceed to Step 2: Expenses and Returns"
            >
              Next: Expenses &amp; Returns
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
