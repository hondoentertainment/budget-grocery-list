export default function RecipeImportSection({
  recipeUrl,
  onRecipeUrlChange,
  onImport,
  isImporting,
}) {
  return (
    <section className="card recipe-import-card" aria-labelledby="recipe-heading">
      <div className="card-header">
        <div className="card-icon icon-recipe" aria-hidden="true">
          🔗
        </div>
        <h2 id="recipe-heading">Recipe import</h2>
      </div>
      <p className="meal-planner-desc" id="recipe-desc">
        Paste a recipe URL. We use AI to extract ingredient names and add them in one tap (needs API key or proxy).
      </p>
      <div className="input-group recipe-import-row">
        <label className="sr-only" htmlFor="recipe-url-input">
          Recipe page URL
        </label>
        <input
          id="recipe-url-input"
          type="url"
          inputMode="url"
          placeholder="https://example.com/recipe"
          value={recipeUrl}
          onChange={(e) => onRecipeUrlChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onImport()}
          aria-describedby="recipe-desc"
          autoComplete="url"
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onImport}
          disabled={isImporting || !recipeUrl.trim()}
        >
          {isImporting ? 'Importing…' : 'Import ingredients'}
        </button>
      </div>
    </section>
  )
}
