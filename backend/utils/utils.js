const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const getFormValues = (source, fields) => {
  return fields.reduce((acc, field) => {
    const raw =
      source && typeof source.get === 'function' ? source.get(field) : source?.[field]
    acc[field] = (raw || '').toString().trim()
    return acc
  }, {})
}

export { getFormValues, isPlainObject }
