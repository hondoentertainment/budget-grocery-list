import { STAPLES } from '../constants'

export default function StaplesTray({ onAddStaple, showCalc, onToggleCalc }) {
  return (
    <section className="staples-tray" aria-label="Quick-add staples">
      {STAPLES.map((staple) => (
        <button
          key={staple.name}
          type="button"
          className="staple-chip"
          onClick={() => onAddStaple(staple.name)}
        >
          <span>{staple.icon}</span> {staple.name}
        </button>
      ))}
      <button
        type="button"
        className={`staple-chip calc-toggle ${showCalc ? 'active' : ''}`}
        onClick={onToggleCalc}
        aria-expanded={showCalc}
        aria-controls="value-calculator-panel"
      >
        Value calc
      </button>
    </section>
  )
}
