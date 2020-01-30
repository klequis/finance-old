import { isValid } from 'date-fns'
export const isValidDate = (value, optional = false) => {
  if (optional && value === undefined) {
    return true
  }
  if (!optional && value === undefined) {
    return false
  }
  const valid = isValid(new Date(value))
  return valid
}
