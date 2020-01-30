const checkForHexString = new RegExp('^[0-9a-fA-F]{24}$')
export const isValidMongoStringId = id => {
  let _id = ''
  try {
    if (!id) {
      return false
    } else {
      _id = typeof id !== 'string' ? id.toString() : (_id = id)
    }
    return checkForHexString.test(_id)
  } catch (e) {
    return false
  }
}
