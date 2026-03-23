export default function BudgetSection({
  budget,
  onBudgetChange,
  estimatedTotal,
  budgetNum,
  isOverBudget,
  budgetProgress,
}) {
  return (
    <section className="card" aria-labelledby="budget-heading">
      <div className="card-header">
        <div className="card-icon icon-budget" aria-hidden="true">
          💎
        </div>
        <h2 id="budget-heading">Grocery Budget</h2>
      </div>
      <label className="sr-only" htmlFor="budget-input">
        Total grocery budget in dollars
      </label>
      <div className="input-wrapper">
        <span className="input-prefix" aria-hidden="true">
          $
        </span>
        <input
          id="budget-input"
          type="number"
          className="has-prefix"
          placeholder="Enter your budget"
          value={budget}
          onChange={(e) => onBudgetChange(e.target.value)}
          min="0"
          step="0.01"
          inputMode="decimal"
        />
      </div>
      {budget && (
        <div className="budget-display">
          <div className="budget-info">
            <div className="budget-row">
              <span className="budget-label">Total Budget</span>
              <span className="budget-amount">${parseFloat(budget).toFixed(2)}</span>
            </div>
            <div className="budget-row">
              <span className="budget-label">Estimated:</span>
              <span className={`budget-estimated ${isOverBudget ? 'over-budget' : ''}`}>
                ${estimatedTotal.toFixed(2)} Estimated
              </span>
            </div>
            <div
              className="progress-bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(budgetProgress)}
              aria-label="Budget used"
            >
              <div
                className={`progress-fill ${isOverBudget ? 'over-budget' : ''}`}
                style={{ width: `${budgetProgress}%` }}
              />
            </div>
            {isOverBudget && (
              <div className="over-budget-warning" role="alert">
                Over budget by ${(estimatedTotal - budgetNum).toFixed(2)}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
