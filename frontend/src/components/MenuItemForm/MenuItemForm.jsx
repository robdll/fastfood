import Spinner from '../Spinner/Spinner'
import './MenuItemForm.css'

function MenuItemForm({
  t,
  imageUrl,
  photoPreview,
  onPhotoChange,
  photoHint,
  price,
  onPriceChange,
  category,
  onCategoryChange,
  categories = [],
  ingredients = [],
  removedIngredients = [],
  onRemovedIngredientsChange,
  ingredientsLabel,
  ingredientsHint,
  youtubeUrl,
  sourceUrl,
  originLabel,
  originValue,
  showOrigin = false,
  isSubmitting,
  submitLabel,
  disableSubmit,
  onSubmit,
  showEmptyCategory = false,
}) {
  const handleIngredientToggle = (name) => {
    const normalized = name?.toString().trim()
    if (!normalized) return
    const next = new Set(removedIngredients ?? [])
    if (next.has(normalized)) {
      next.delete(normalized)
    } else {
      next.add(normalized)
    }
    onRemovedIngredientsChange?.(Array.from(next))
  }

  return (
    <div className="menuDetail">
      <div className="menuDetail__layout">
        <div className="menuDetail__panel menuDetail__area--details">
          <div className="menuDetail__content">
            <div className="menuDetail__left">
              <div className="menuDetail__formGrid">
                <label className="mealField">
                  <span>{t('dashboard.menuDetailPrice')}</span>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={price}
                    onChange={(event) => onPriceChange?.(event.target.value)}
                  />
                </label>
                {showOrigin && (
                  <label className="mealField">
                    <span>{originLabel}</span>
                    <input
                      className="input"
                      type="text"
                      value={originValue ?? '—'}
                      readOnly
                    />
                  </label>
                )}
                <label className="mealField">
                  <span>{t('dashboard.menuDetailCategory')}</span>
                  <select
                    className="input"
                    value={category ?? ''}
                    onChange={(event) => onCategoryChange?.(event.target.value)}
                  >
                    {showEmptyCategory && <option value="">{'—'}</option>}
                    {categories.map((categoryOption) => (
                      <option key={categoryOption} value={categoryOption}>
                        {categoryOption}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {(youtubeUrl || sourceUrl) && (
                <div className="menuDetail__links">
                  {youtubeUrl && (
                    <a
                      className="menuDetail__link menuDetail__link--youtube"
                      href={youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="YouTube"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        role="img"
                        aria-hidden="true"
                      >
                        <path
                          d="M23.5 7.2a3 3 0 0 0-2.1-2.1C19.6 4.6 12 4.6 12 4.6s-7.6 0-9.4.5a3 3 0 0 0-2.1 2.1A31.8 31.8 0 0 0 0 12a31.8 31.8 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.8 31.8 0 0 0 24 12a31.8 31.8 0 0 0-.5-4.8ZM9.6 15.6V8.4L15.9 12l-6.3 3.6Z"
                          fill="currentColor"
                        />
                      </svg>
                    </a>
                  )}
                  {sourceUrl && (
                    <a
                      className="menuDetail__link menuDetail__link--web"
                      href={sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Source website"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        role="img"
                        aria-hidden="true"
                      >
                        <path
                          d="M10.6 13.4a1 1 0 0 1 0-1.4l3.6-3.6a3 3 0 0 1 4.2 4.2l-2 2a1 1 0 1 1-1.4-1.4l2-2a1 1 0 1 0-1.4-1.4l-3.6 3.6a1 1 0 0 1-1.4 0Z"
                          fill="currentColor"
                        />
                        <path
                          d="M13.4 10.6a1 1 0 0 1 0 1.4l-3.6 3.6a3 3 0 0 1-4.2-4.2l2-2a1 1 0 1 1 1.4 1.4l-2 2a1 1 0 1 0 1.4 1.4l3.6-3.6a1 1 0 0 1 1.4 0Z"
                          fill="currentColor"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
            {ingredients.length > 0 && (
              <div className="menuDetail__ingredients">
                <span className="menuDetail__label menuDetail__title">
                  {ingredientsLabel}
                </span>
                {ingredientsHint && (
                  <p className="muted menuDetail__ingredientsHint">
                    {ingredientsHint}
                  </p>
                )}
                <div className="menuDetail__ingredientsList">
                  {ingredients.map((ingredient) => {
                    const isRemoved = removedIngredients.includes(ingredient.name)
                    return (
                      <label
                        key={ingredient.name}
                        className="ingredientItem"
                      >
                        <input
                          type="checkbox"
                          checked={!isRemoved}
                          onChange={() => handleIngredientToggle(ingredient.name)}
                        />
                        <span className="ingredientItem__name">
                          {ingredient.name}
                        </span>
                        {ingredient.measure && (
                          <span className="ingredientItem__meta">
                            {ingredient.measure}
                          </span>
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="menuDetail__image menuDetail__area--image">
          <label
            className="menuDetail__imagePicker"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              const file = event.dataTransfer?.files?.[0]
              if (!file) return
              onPhotoChange?.(file)
            }}
          >
            <input
              className="menuDetail__imageInput"
              type="file"
              accept="image/*"
              onChange={(event) =>
                onPhotoChange?.(event.target.files?.[0] ?? null)
              }
            />
            {photoPreview ? (
              <img src={photoPreview} alt={t('dashboard.menuNoImage')} />
            ) : imageUrl ? (
              <img src={imageUrl} alt={t('dashboard.menuNoImage')} />
            ) : (
              <div className="menuThumb menuThumb--large">
                <span>{t('dashboard.menuNoImage')}</span>
              </div>
            )}
            {photoHint && (
              <span className="menuDetail__imageHint">{photoHint}</span>
            )}
          </label>
        </div>
        <button
          className="btn btn--primary menuDetail__area--actions"
          type="button"
          onClick={onSubmit}
          disabled={disableSubmit || isSubmitting}
        >
          {isSubmitting ? (
            <Spinner
              className="spinner--button"
              label={t('common.loading')}
            />
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </div>
  )
}

export default MenuItemForm
