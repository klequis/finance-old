// is laterDate after earlierDate
/**
 * @description Check if one date is after another.
 * 
 * @param {string} earlierDate - an ISO date string
 * @param {string} laterDate - an ISO date string
 * 
 * @returns {bool} true if laterDate is greater than earlierDate, else false
 */
export const isDateTimeAfter = (earlierDate, laterDate) => {

  const earlier = new Date(earlierDate).getTime()
  const later = new Date(laterDate).getTime()

  if (later > earlier) {
    return true
  } else {
    return false
  }
  
}
