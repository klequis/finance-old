import { isHexadecimal } from 'validator'

// This is the same as validator.js isMongoId() except returns true/false
// instead of throwing as would validator.js.isMongoId which uses assertString
export const isHexStringLen24 = str => {
  const isString = typeof str === 'string' || str instanceof String
  if (!isString) {
    return false
  }
  return isHexadecimal(str) && str.length === 24
}
