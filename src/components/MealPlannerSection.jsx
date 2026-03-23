export default function MealPlannerSection({
  mealPlanInput,
  onMealPlanChange,
  onGenerate,
  isGeneratingMeals,
}) {
  return (
    <section className="card meal-planner-card" aria-labelledby="meal-heading">
      <div className="card-header">
        <div className="card-icon icon-meal" aria-hidden="true">
          🍽️
        </div>
        <h2 id="meal-heading">AI Meal Planner</h2>
      </div>
      <p className="meal-planner-desc" id="meal-desc">
        Enter meals (with optional servings) and we&apos;ll generate your ingredient list.
      </p>
      <div className="input-group">
        <label className="sr-only" htmlFor="meal-plan-input">
          Meals to plan
        </label>
        <input
          id="meal-plan-input"
          type="text"
          placeholder='e.g., "Chicken stir-fry for 4, Caesar salad, spaghetti carbonara"'
          value={mealPlanInput}
          onChange={(e) => onMealPlanChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
          aria-describedby="meal-desc"
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={onGenerate}
          disabled={isGeneratingMeals || !mealPlanInput.trim()}
        >
          {isGeneratingMeals ? 'Generating…' : 'Generate list'}
        </button>
      </div>
    </section>
  )
}
