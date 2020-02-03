import fs from 'fs'
import { deleteMany, find, updateMany, findOneAndUpdate } from 'db'
import { DATA_COLLECTION_NAME } from 'db/constants'
import { mergeAll } from 'ramda'
import loadData from './load-data'
// eslint-disable-next-line
import { blue, green, greenf, redf, yellow } from 'logger'

const readRules = async () => {
  const rules = await fs.promises.readFile('rules.json')
  const json = await JSON.parse(rules)
  return json
}

const wrappedFind = async filter => {
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

const conditionBuilder = criteria => {
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

const filterBuilder = criteria => {
  if (criteria.length === 1) {
    return conditionBuilder(criteria[0])
  } else {
    const x = mergeAll(
      criteria.map(c => {
        const ret = conditionBuilder(c)
        return ret
      })
    )
    return { $and: [x] }
  }
}

const printResult = (fName, id, expectRows, actualRows) => {
  console.log('---')
  console.log(`** ${fName} id: ${id}`)
  // yellow('actualRows', actualRows)
  expectRows === actualRows
    ? greenf(`OK: id: ${id}, expected: ${expectRows}, actual: ${actualRows}`)
    : redf(`ERROR: id: ${id}, expected: ${expectRows}, actual: ${actualRows}`)
}





const makeRegEx = criteria => {
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

const andCondition = (criteria, doc) => {
  return criteria.every(c => {
    const { field } = c
    const regEx = makeRegEx(c)
    return doc[field].match(regEx)
  })
}





const runRule = (rule, doc) => {
  // yellow('runRule')
  const { action } = rule.action
  switch (action) {
    case 'replace':
      return replaceAction(rule, doc)
    case 'delete':
      return deleteAction(rule, doc)
    case 'strip':
      // const a = await stripAction(r)
      // console.log('a', a)
      return stripAction(rule, doc)
    case 'categorize':
      return categorizeAction(rule, doc)
    default:
      redf('ERROR', `unknown action ${rule.action}`)
  }
}

const main = async () => {
  await loadData(true)
  const data = await find(DATA_COLLECTION_NAME, {})
  const { rules } = await readRules()
  // console.log('data', typeof data)
  data.forEach(doc => {
    
    rules.forEach(rule => {
      // yellow('doc.id', doc.id)
      // yellow('doc', doc)
      if ([5, 18].includes(rule.id)) {
        // yellow('rule', rule)
        runRule(rule, doc)
      }
    })
  })
  // green('rules', rules)
  // green('rules.length', rules.rules.length)

  // for (let i = 0; i < rules.length; i++) {
  //   const r = rules[i]
  //   // console.log('r', r)
  //   if ([5, 18].includes(r.id)) {
  //     blue(`start rule ${r.id}`)
  //     const change = await runRule(r)
  //     blue(`end rule ${r.id}`)
  //     yellow('main: change', change)
  //   }
  // }
  // rules.rules.forEach(async r => {
  //   if ([5, 18].includes(r.id)) {
  //     await runRule(r)
  //   }
  //   // if ([5, 18].includes(r.id)) {
  //   //   const before = await find(DATA_COLLECTION_NAME, { description: { $regex: '^CHECK #' }})
  //   //   green(`Running: ${r.id}`)
  //   //   green(`Before:`, before)
  //   // }

  //   // if ([5, 18].includes(r.id)) {
  //   //   const after = await find(DATA_COLLECTION_NAME, { description: { $regex: '^CHECK #' }})
  //   //   green(`after ${r.id}:`, after)
  //   // }
  // })
}

main()

/*
  - get all the data
  - run the rules
  - replace all the data

*/
