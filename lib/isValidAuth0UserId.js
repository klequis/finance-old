import { isHexStringLen24 } from './isHexStringLen24'

const parseId = userId => {
  const a = userId.split('|')
  return a[1]
}

export const isValidAuth0UserId = userId => {
    // e.g., "auth0|5d1c...7"
    if (userId === undefined) {
      return false
    }
    const id = parseId(userId)
    return isHexStringLen24(id)
}