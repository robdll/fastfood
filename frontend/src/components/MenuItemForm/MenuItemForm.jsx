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
        <div className="menuDetail__image">
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
        <div className="menuDetail__panel">
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
          <div className="menuDetail__actions">
            <button
              className="btn btn--primary"
              type="button"
              onClick={onSubmit}
              disabled={disableSubmit || isSubmitting}
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenuItemForm
