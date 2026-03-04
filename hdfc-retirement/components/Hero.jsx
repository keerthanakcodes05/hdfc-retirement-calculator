export default function Hero() {
  return (
    <section className="hero" aria-label="Introduction">
      <div className="container">
        <div className="hero-inner">
          <div>
            <div className="hero-eyebrow" aria-hidden="true">
              Investor Education &amp; Awareness
            </div>
            <h1>
              Your Retirement,<br />
              <em>Planned Perfectly.</em>
            </h1>
            <p className="hero-desc">
              India's most comprehensive retirement planning calculator.
              3-step corpus builder with lifestyle buckets, step-up SIP,
              corpus health scoring, and depletion analysis — all illustrative.
            </p>
            <div className="hero-pills" role="list" aria-label="Features">
              {[
                '3-Step Corpus Formula',
                'Lifestyle Buckets',
                'Step-Up SIP',
                'Health Gauge',
                'Depletion Timeline',
              ].map((p) => (
                <span key={p} className="hero-pill" role="listitem">{p}</span>
              ))}
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-visual-num">3</div>
            <div className="hero-visual-label">Formula Steps</div>
            <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.15)', margin: '8px 0' }} />
            <div className="hero-visual-num">₹</div>
            <div className="hero-visual-label">Corpus Calculator</div>
          </div>
        </div>
      </div>
    </section>
  );
}
