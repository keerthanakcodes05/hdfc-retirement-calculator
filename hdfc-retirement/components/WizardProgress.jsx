'use client';

const STEPS = [
  { num: 1, label: 'Personal Details' },
  { num: 2, label: 'Expenses & Returns' },
  { num: 3, label: 'Your Retirement Plan' },
];

export default function WizardProgress({ currentStep }) {
  return (
    <nav
      className="wizard-progress"
      aria-label="Calculator progress"
      role="navigation"
    >
      <div className="container">
        <ol className="wizard-steps" role="list">
          {STEPS.map((s) => {
            const isDone = currentStep > s.num;
            const isActive = currentStep === s.num;
            return (
              <li
                key={s.num}
                className={`wstep${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}
                role="listitem"
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Step ${s.num}: ${s.label}${isDone ? ' (completed)' : isActive ? ' (current)' : ''}`}
              >
                <div className="wstep-num" aria-hidden="true">
                  {isDone ? '✓' : s.num}
                </div>
                <div className="wstep-label">{s.label}</div>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
