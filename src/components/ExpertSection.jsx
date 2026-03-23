export default function ExpertSection({
  expertHacks,
  onRefreshHacks,
  isLoadingHacks,
  flavorProfile,
  onGetFlavor,
  isLoadingFlavor,
}) {
  return (
    <div className="expert-grid">
      <section className="card expert-card" aria-labelledby="hacks-heading">
        <div className="card-header">
          <div className="card-icon icon-recipe" aria-hidden="true">
            🧠
          </div>
          <h2 id="hacks-heading">Expert budget hacks</h2>
          <button type="button" className="btn btn-secondary btn-small" onClick={onRefreshHacks} disabled={isLoadingHacks}>
            {isLoadingHacks ? 'Analyzing…' : 'Refresh Hacks'}
          </button>
        </div>
        {expertHacks.length > 0 ? (
          <ul className="hacks-list">
            {expertHacks.map((hack, i) => (
              <li key={i} className="hack-item">
                {hack}
              </li>
            ))}
          </ul>
        ) : (
          <p className="hack-promo">Tap refresh for tailored savings ideas for your list.</p>
        )}
      </section>

      <section className="card flavor-card" aria-labelledby="flavor-heading">
        <div className="card-header">
          <div className="card-icon icon-culinary" aria-hidden="true">
            👩‍🍳
          </div>
          <h2 id="flavor-heading">Culinary concierge</h2>
          <button type="button" className="btn btn-primary btn-small" onClick={onGetFlavor} disabled={isLoadingFlavor}>
            {isLoadingFlavor ? 'Designing…' : 'Get Strategy'}
          </button>
        </div>
        {flavorProfile ? (
          <div className="flavor-content">
            <div className="flavor-anchor">
              <span className="flavor-label">Flavor anchor</span>
              <span className="flavor-value">{flavorProfile.anchor}</span>
            </div>
            <div className="flavor-pantry">
              <span className="flavor-label">Elevate with</span>
              <div className="flavor-tags">
                {flavorProfile.pantry.map((p) => (
                  <span key={p} className="flavor-tag">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="hack-promo">Get a quick flavor strategy that matches your ingredients.</p>
        )}
      </section>
    </div>
  )
}
