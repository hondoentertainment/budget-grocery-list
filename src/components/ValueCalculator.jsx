export default function ValueCalculator({ calcData, onCalcChange, result }) {
  return (
    <section id="value-calculator-panel" className="card value-calc-card" aria-labelledby="calc-heading">
      <div className="card-header">
        <div className="card-icon icon-results" aria-hidden="true">
          ⚖️
        </div>
        <h2 id="calc-heading">Unit price comparison</h2>
      </div>
      <p className="calc-hint">Enter total price and weight or volume (same units for both options).</p>
      <div className="calc-grid">
        <div className="calc-col">
          <p>Option 1</p>
          <label className="sr-only" htmlFor="calc-p1">
            Option 1 price
          </label>
          <input
            id="calc-p1"
            type="number"
            placeholder="Price $"
            value={calcData.p1}
            onChange={(e) => onCalcChange({ ...calcData, p1: e.target.value })}
            inputMode="decimal"
          />
          <label className="sr-only" htmlFor="calc-w1">
            Option 1 weight or volume
          </label>
          <input
            id="calc-w1"
            type="number"
            placeholder="Weight or volume"
            value={calcData.w1}
            onChange={(e) => onCalcChange({ ...calcData, w1: e.target.value })}
            inputMode="decimal"
          />
        </div>
        <div className="calc-col">
          <p>Option 2</p>
          <label className="sr-only" htmlFor="calc-p2">
            Option 2 price
          </label>
          <input
            id="calc-p2"
            type="number"
            placeholder="Price $"
            value={calcData.p2}
            onChange={(e) => onCalcChange({ ...calcData, p2: e.target.value })}
            inputMode="decimal"
          />
          <label className="sr-only" htmlFor="calc-w2">
            Option 2 weight or volume
          </label>
          <input
            id="calc-w2"
            type="number"
            placeholder="Weight or volume"
            value={calcData.w2}
            onChange={(e) => onCalcChange({ ...calcData, w2: e.target.value })}
            inputMode="decimal"
          />
        </div>
      </div>
      {result && (
        <div className="calc-result" role="status">
          {result}
        </div>
      )}
    </section>
  )
}
