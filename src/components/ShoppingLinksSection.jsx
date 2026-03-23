export default function ShoppingLinksSection({
  shoppingItems,
  estimatedTotal,
  budgetNum,
  generateAmazonUrl,
  generateWalmartUrl,
  generateTargetUrl,
  onOpenAll,
  onCopyLinks,
  onShare,
  onClearAll,
  pricedNeedCount,
  needCount,
  categoryCount,
}) {
  const withPrices = shoppingItems.filter((i) => parseFloat(i.estimatedPrice) > 0).length
  const remaining =
    budgetNum > 0 ? Math.max(0, budgetNum - estimatedTotal) : null

  return (
    <section className="card" aria-labelledby="links-heading">
      <div className="card-header">
        <div className="card-icon icon-results" aria-hidden="true">
          🔗
        </div>
        <h2 id="links-heading">Shopping links ({shoppingItems.length} items)</h2>
      </div>

      <div className="basket-efficiency" aria-labelledby="insights-title">
        <div className="efficiency-header">
          <span className="efficiency-title" id="insights-title">
            List insights
          </span>
          <span className="efficiency-badge">Live</span>
        </div>
        <div className="efficiency-grid efficiency-grid-2">
          <div className="efficiency-stat">
            <span className="stat-label">Need from store</span>
            <span className="stat-value">{needCount}</span>
          </div>
          <div className="efficiency-stat">
            <span className="stat-label">Categories</span>
            <span className="stat-value">{categoryCount}</span>
          </div>
          <div className="efficiency-stat">
            <span className="stat-label">Estimated total</span>
            <span className="stat-value">${estimatedTotal.toFixed(2)}</span>
          </div>
          <div className="efficiency-stat">
            <span className="stat-label">Items with prices</span>
            <span className="stat-value">
              {withPrices}/{shoppingItems.length}
            </span>
          </div>
          {remaining != null && (
            <div className="efficiency-stat span-2">
              <span className="stat-label">Budget headroom</span>
              <span className={`stat-value ${remaining === 0 ? 'warn' : 'success'}`}>
                ${remaining.toFixed(2)} left
              </span>
            </div>
          )}
        </div>
        {pricedNeedCount < needCount && (
          <p className="insight-hint">
            Add estimates to every line item for the most accurate budget bar—most list apps skip this.
          </p>
        )}
        <p className="insight-hint subtle">
          Compare unit prices in stores; retailer links open sorted low-to-high to save time.
        </p>
      </div>

      <p className="links-lede">Open searches on Amazon, Walmart, and Target (price-sorted).</p>

      <div className="results-list">
        {shoppingItems.map((item) => (
          <div key={item.id} className="result-item">
            <span>{item.name}</span>
            <div className="result-actions">
              <a
                href={generateAmazonUrl(item.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="retailer-link amazon"
              >
                Amazon
              </a>
              <a
                href={generateWalmartUrl(item.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="retailer-link walmart"
              >
                Walmart
              </a>
              <a
                href={generateTargetUrl(item.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="retailer-link target"
              >
                Target
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="action-buttons">
        <button type="button" className="btn btn-amazon" onClick={() => onOpenAll('amazon')}>
          Open all Amazon
        </button>
        <button type="button" className="btn btn-walmart" onClick={() => onOpenAll('walmart')}>
          Open all Walmart
        </button>
        <button type="button" className="btn btn-target" onClick={() => onOpenAll('target')}>
          Open all Target
        </button>
      </div>

      <div className="action-buttons">
        <button type="button" className="btn btn-success" onClick={onShare}>
          Share list
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => onCopyLinks('amazon')}>
          Copy Amazon links
        </button>
        <button type="button" className="btn btn-secondary" onClick={onClearAll}>
          Clear list
        </button>
      </div>
    </section>
  )
}
