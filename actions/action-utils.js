import { DATA_COLLECTION_NAME } from 'db/constants'
import { find } from 'db/dbFunctions'
import fs from 'fs'
import { mergeAll, mergeRight } from 'ramda'

// eslint-disable-next-line
import { blue, green, greenf, redf, yellow } from 'logger'

export const readRules = async () => {
  const rules = await fs.promises.readFile('rules.json')
  const json = await JSON.parse(rules)
  return json
}

export const wrappedFind = async filter => {
  // green('filter', filter)
  return find(
    DATA_COLLECTION_NAME,
    filter,
    {},
    // { caseLevel: true, locale: 'en_US' }
    { locale: 'en', strength: 2 }
  )
}

const operationBeginsWith = (field, value) => {
  return { [field]: { $regex: `^${value}`, $options: 'im' } }
}

const operationContains = (field, value) => {
  return { [field]: { $regex: `${value}`, $options: 'im' } }
}

const operationEquals = (field, value) => {
  return { [field]: { $eq: value } }
}

const operationRegex = (field, value) => {
  
  return { [field]: { $regex: `${value}`, $options: 'im' } }
}

const createRegex = (findValue, numAdditionalChars = 0) => {
  const regExAsString =
    numAdditionalChars > 0
      ? `(${findValue}).{${numAdditionalChars}}`
      : `(${findValue})`
  return new RegExp(regExAsString)
}

const operationIn = (field, value) => {
  // green('value', value)
  const regex = new RegExp(value)
  // green('regex', regex)
  const r = { [field]: { $in: [regex] } }
  // green('r', r)
  return r
}

export const conditionBuilder = criteria => {

  // TODO: hard coding descriptions  => origDescription
  // Where should this logic be?

  // takes a single criteria object
  const { field: origField, operation, value } = criteria
  const field = origField === 'description' ? 'origDescription' : origField
  switch (operation) {
    case 'beginsWith':
      return operationBeginsWith(field, value)
    case 'equals':
      return operationEquals(field, value)
    case 'contains':
      return operationContains(field, value)
    case 'regex':
      return operationRegex(field, value)
    case '$in':
      return operationIn(field, value)
    default:
      redf(
        'deleteAction ERROR: ',
        `operation ${operation} not covered in switch`
      )
      throw new Error('conditionBuilder ERROR: unknown operation')
  }
}

export const filterBuilder = (criteria) => {
  return mergeAll(
    criteria.map(c => {
      const ret = conditionBuilder(c)
      green('condition', ret)
      return ret
    })
  )
}

export const printResult = (id, expectRows, actualRows) => {
  expectRows === actualRows
    ? greenf(`OK: id: ${id}, expected: ${expectRows}, actual: ${actualRows}`)
    : redf(`ERROR: id: ${id}, expected: ${expectRows}, actual: ${actualRows}`)
}

// export const makeRegEx = criteria => {
//   // operation: [beginsWith || contains]
//   const { operation, value } = criteria
//   let regEx
//   if (operation === 'beginsWith') {
//     regEx = new RegExp(`^${value}`)
//   }
//   if (operation === 'contains') {
//     regEx = new RegExp(`${value}`)
//   }
//   return regEx
// }

// export const andCondition = (criteria, doc) => {
//   return criteria.every(c => {
//     const { field } = c
//     const regEx = makeRegEx(c)
//     return doc[field].match(regEx)
//   })
// }
