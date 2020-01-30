export const toString = (value, deep = true) => {
  if (Array.isArray(value) && value.length && deep) {
    return toString(value[0], false)
  } else if (value instanceof Date) {
    return value.toISOString()
  } else if (value && typeof value === 'object' && value.toString) {
    return value.toString()
  } else if (value == null || (isNaN(value) && !value.length)) {
    return ''
  }

  return String(value)
}
