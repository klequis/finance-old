import { green } from 'logger'
export const findObjectInArray = (arr, findProp, findValue) => {
  const idx = arr.findIndex(i => i[findProp] === findValue)
  return arr[idx]
}
