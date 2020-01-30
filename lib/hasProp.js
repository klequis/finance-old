import { path, isNil } from 'ramda'

export const hasProp = (prop, obj) => {
  if (isNil(obj)) {
    return false
  }
  return path(prop.split('.'), obj) === undefined ? false : true
}
