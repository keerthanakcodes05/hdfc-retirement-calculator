export default function Header() {
  return (
    <header className="site-header" role="banner">
      <div className="container">
        <div className="header-inner">
          <a href="/" className="brand" aria-label="HDFC Mutual Fund – Home">
            <div className="brand-badge" aria-hidden="true">
              <span>HDFC</span>
              <small>MF</small>
            </div>
            <div>
              <div className="brand-name">HDFC Mutual Fund</div>
              <div className="brand-sub">Investor Education &amp; Awareness</div>
            </div>
          </a>
          <div className="header-tag" role="note" aria-label="FinCal Innovation Hackathon by IIT-BHU">
            FinCal Hackathon · IIT-BHU
          </div>
        </div>
      </div>
    </header>
  );
}
