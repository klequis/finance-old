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

export const operationBeginsWith = (field, value) => {
  return { [field]: { $regex: `^${value}`, $options: 'im' } }
}

export const operationContains = (field, value) => {
  return { [field]: { $regex: `${value}`, $options: 'im' } }
}

export const operationEquals = (field, value) => {
  return { [field]: { $eq: value } }
}

export const conditionBuilder = criteria => {
  // takes a single criteria object
  const { field, operation, value } = criteria
  switch (operation) {
    case 'beginsWith':
      return operationBeginsWith(field, value)
    case 'equals':
      return operationEquals(field, value)
    case 'contains':
      return operationContains(field, value)
    default:
      redf(
        'deleteAction ERROR: ',
        `operation ${operation} not covered in switch`
      )
      throw new Error('conditionBuilder ERROR: unknown operation')
  }
}

export const filterBuilder = (criteria, includeOmitted = false) => {
  const omit = { omit: { $exists: includeOmitted } }
  // green('criteria', criteria)
  if (criteria.length === 1) {
    const singleCriteria = conditionBuilder(criteria[0])
    // green('single criteria', singleCriteria)
    const merged = mergeRight(singleCriteria, omit)
    return merged
  } else {
    // green('** multi condition **')
    const multipleCriteria = mergeAll(
      criteria.map(c => {
        const ret = conditionBuilder(c)
        // green('condition', ret)
        return ret
      })
    )
    return { $and: [mergeRight(multipleCriteria, omit)] }
  }
}

export const printResult = (id, expectRows, actualRows) => {
  // yellow('actualRows', actualRows)
  expectRows === actualRows
    ? greenf(`OK: id: ${id}, expected: ${expectRows}, actual: ${actualRows}`)
    : redf(`ERROR: id: ${id}, expected: ${expectRows}, actual: ${actualRows}`)
}

export const makeRegEx = criteria => {
  // operation: [beginsWith || contains]
  const { operation, value } = criteria
  let regEx
  if (operation === 'beginsWith') {
    regEx = new RegExp(`^${value}`)
  }
  if (operation === 'contains') {
    regEx = new RegExp(`${value}`)
  }
  return regEx
}

export const andCondition = (criteria, doc) => {
  return criteria.every(c => {
    const { field } = c
    const regEx = makeRegEx(c)
    return doc[field].match(regEx)
  })
}
