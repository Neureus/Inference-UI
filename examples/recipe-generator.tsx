/**
 * Example: Recipe Generator using useObject
 * Demonstrates type-safe object generation with Zod schema validation
 */

import React, { useState } from 'react';
import { useObject } from '@inference-ui/react';
import { z } from 'zod';

/**
 * Define Recipe schema with Zod
 */
const RecipeSchema = z.object({
  name: z.string().min(1, 'Recipe name is required'),
  description: z.string().optional(),
  prepTime: z.number().min(0, 'Prep time must be positive'),
  cookTime: z.number().min(0, 'Cook time must be positive'),
  servings: z.number().min(1, 'Must serve at least 1 person'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  ingredients: z.array(
    z.object({
      item: z.string(),
      amount: z.string(),
    })
  ),
  instructions: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  nutritionInfo: z
    .object({
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
    })
    .optional(),
});

type Recipe = z.infer<typeof RecipeSchema>;

export default function RecipeGenerator() {
  const [prompt, setPrompt] = useState('');
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  const {
    object: recipe,
    submit,
    reload,
    stop,
    isLoading,
    validationError,
    error,
    status,
  } = useObject({
    api: 'https://inference-ui-api.neureus.workers.dev/stream/object',
    schema: RecipeSchema,
    onFinish: (generatedRecipe) => {
      console.log('Recipe generated:', generatedRecipe);
      // Auto-save completed recipes
      setSavedRecipes((prev) => [...prev, generatedRecipe]);
    },
    onError: (error) => {
      console.error('Recipe generation error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      submit(prompt);
    }
  };

  const presetPrompts = [
    'Generate a healthy breakfast recipe with eggs and vegetables',
    'Create a quick 15-minute pasta dinner recipe',
    'Make a vegan chocolate dessert recipe',
    'Generate a traditional Italian pizza recipe',
    'Create a low-carb chicken salad recipe',
  ];

  return (
    <div className="recipe-generator">
      <header className="header">
        <h1>🍳 AI Recipe Generator</h1>
        <p>Generate delicious recipes with AI-powered streaming</p>
      </header>

      <div className="generator-section">
        <form onSubmit={handleSubmit} className="prompt-form">
          <div className="input-group">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the recipe you want... (e.g., 'A healthy vegetarian pasta dish')"
              rows={3}
              disabled={isLoading}
            />
            <div className="form-actions">
              {isLoading ? (
                <button type="button" onClick={stop} className="btn-stop">
                  ⏹ Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="btn-generate"
                >
                  ✨ Generate Recipe
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="preset-prompts">
          <p>Or try these:</p>
          <div className="preset-buttons">
            {presetPrompts.map((preset, i) => (
              <button
                key={i}
                onClick={() => {
                  setPrompt(preset);
                  submit(preset);
                }}
                disabled={isLoading}
                className="btn-preset"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Status indicator */}
        {status !== 'ready' && (
          <div className={`status-bar status-${status}`}>
            {status === 'submitted' && '⏳ Thinking...'}
            {status === 'streaming' && '📝 Generating recipe...'}
            {status === 'error' && '⚠ Error occurred'}
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="error-box">
            <strong>Error:</strong> {error.message}
            <button onClick={reload} className="btn-retry">
              🔄 Retry
            </button>
          </div>
        )}

        {/* Validation errors */}
        {validationError && (
          <div className="validation-box">
            <strong>Validation Errors (streaming):</strong>
            <ul>
              {validationError.errors.map((err, i) => (
                <li key={i}>
                  <code>{err.path.join('.')}</code>: {err.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recipe preview (updates in real-time as it streams) */}
        {recipe && (
          <div className="recipe-card">
            <div className="recipe-header">
              <h2>{recipe.name || '(Generating name...)'}</h2>
              {recipe.difficulty && (
                <span className={`difficulty difficulty-${recipe.difficulty}`}>
                  {recipe.difficulty}
                </span>
              )}
            </div>

            {recipe.description && (
              <p className="recipe-description">{recipe.description}</p>
            )}

            <div className="recipe-meta">
              {recipe.prepTime !== undefined && (
                <div className="meta-item">
                  <strong>Prep:</strong> {recipe.prepTime} min
                </div>
              )}
              {recipe.cookTime !== undefined && (
                <div className="meta-item">
                  <strong>Cook:</strong> {recipe.cookTime} min
                </div>
              )}
              {recipe.servings !== undefined && (
                <div className="meta-item">
                  <strong>Servings:</strong> {recipe.servings}
                </div>
              )}
            </div>

            {recipe.tags && recipe.tags.length > 0 && (
              <div className="recipe-tags">
                {recipe.tags.map((tag, i) => (
                  <span key={i} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className="recipe-section">
                <h3>Ingredients</h3>
                <ul className="ingredients-list">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className={isLoading ? 'streaming' : ''}>
                      <span className="amount">{ing.amount}</span>{' '}
                      <span className="item">{ing.item}</span>
                    </li>
                  ))}
                  {isLoading && <li className="loading-indicator">...</li>}
                </ul>
              </div>
            )}

            {recipe.instructions && recipe.instructions.length > 0 && (
              <div className="recipe-section">
                <h3>Instructions</h3>
                <ol className="instructions-list">
                  {recipe.instructions.map((step, i) => (
                    <li key={i} className={isLoading ? 'streaming' : ''}>
                      {step}
                    </li>
                  ))}
                  {isLoading && <li className="loading-indicator">...</li>}
                </ol>
              </div>
            )}

            {recipe.nutritionInfo && (
              <div className="recipe-section">
                <h3>Nutrition (per serving)</h3>
                <div className="nutrition-grid">
                  <div className="nutrition-item">
                    <strong>Calories</strong>
                    <span>{recipe.nutritionInfo.calories}</span>
                  </div>
                  <div className="nutrition-item">
                    <strong>Protein</strong>
                    <span>{recipe.nutritionInfo.protein}g</span>
                  </div>
                  <div className="nutrition-item">
                    <strong>Carbs</strong>
                    <span>{recipe.nutritionInfo.carbs}g</span>
                  </div>
                  <div className="nutrition-item">
                    <strong>Fat</strong>
                    <span>{recipe.nutritionInfo.fat}g</span>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && (
              <div className="recipe-actions">
                <button onClick={reload} className="btn-secondary">
                  🔄 Regenerate
                </button>
                <button
                  onClick={() => {
                    if (recipe) {
                      setSavedRecipes((prev) => [...prev, recipe as Recipe]);
                      alert('Recipe saved!');
                    }
                  }}
                  className="btn-primary"
                >
                  💾 Save Recipe
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Saved recipes */}
      {savedRecipes.length > 0 && (
        <div className="saved-recipes">
          <h2>Saved Recipes ({savedRecipes.length})</h2>
          <div className="recipes-grid">
            {savedRecipes.map((savedRecipe, i) => (
              <div key={i} className="recipe-thumbnail">
                <h3>{savedRecipe.name}</h3>
                <p>
                  {savedRecipe.prepTime + savedRecipe.cookTime} min •{' '}
                  {savedRecipe.servings} servings
                </p>
                <button
                  onClick={() => {
                    const json = JSON.stringify(savedRecipe, null, 2);
                    navigator.clipboard.writeText(json);
                    alert('Recipe copied to clipboard!');
                  }}
                  className="btn-small"
                >
                  📋 Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Add CSS styles for the recipe generator
 */
const styles = `
.recipe-generator {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.header p {
  color: #666;
  font-size: 1.1rem;
}

.generator-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.prompt-form textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
}

.form-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.btn-generate {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.preset-prompts {
  margin-top: 1.5rem;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-preset {
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
}

.recipe-card {
  margin-top: 2rem;
  padding: 2rem;
  background: #fafafa;
  border-radius: 12px;
}

.recipe-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.difficulty {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.difficulty-easy {
  background: #c8e6c9;
  color: #2e7d32;
}

.difficulty-medium {
  background: #fff9c4;
  color: #f57f17;
}

.difficulty-hard {
  background: #ffcdd2;
  color: #c62828;
}

.recipe-meta {
  display: flex;
  gap: 1.5rem;
  margin: 1rem 0;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  font-size: 0.875rem;
}

.recipe-section {
  margin: 2rem 0;
}

.recipe-section h3 {
  margin-bottom: 1rem;
  color: #333;
}

.ingredients-list {
  list-style: none;
  padding: 0;
}

.ingredients-list li {
  padding: 0.5rem;
  background: white;
  margin-bottom: 0.5rem;
  border-radius: 6px;
}

.ingredients-list li.streaming {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.instructions-list {
  padding-left: 0;
  list-style-position: inside;
}

.instructions-list li {
  padding: 0.75rem;
  background: white;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  line-height: 1.6;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.nutrition-item {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  text-align: center;
}

.recipe-actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.saved-recipes {
  margin-top: 3rem;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.recipe-thumbnail {
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
`;
