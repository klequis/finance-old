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

const renameAction = async r => {
  const { criteria, expectRows, id, action } = r
  const { actionValue: to } = action
  const filter = filterBuilder(criteria)

  // tmp code
  const f = await wrappedFind(filter)
  printResult('renameAction', id, expectRows, f.length)
  // tmp code

  const um = await updateMany(DATA_COLLECTION_NAME, filter, { description: to })

  // greenf(`Renamed ${um.modifiedCount} documents`)
  // greenf('    from: ', from)
  // greenf('    to: ', to)
}

const deleteAction = async r => {
  const { criteria, expectRows, id } = r

  const filter = filterBuilder(criteria)

  // tmp
  const f = await wrappedFind(filter)
  printResult('deleteAction', id, expectRows, f.length)
  // tmp

  const dm = await deleteMany(
    DATA_COLLECTION_NAME,
    filter,
    {},
    { locale: 'en', strength: 2 }
  )
  // greenf(`Deleted ${dm.deletedCount} documents`)
  // greenf(`    filter: ${filter}`)

  // test
}

const stripAction = async r => {
  const { action, criteria, expectRows, id } = r
  const filter = filterBuilder(criteria)
  const f = await wrappedFind(filter)

  const changes = []
  // tmp code
  // printResult('stripAction', id, expectRows, f.length)
  // tmp code
  const { replaceValue, replaceWith, numAdditionalChars } = action
  for (let i; i < f.length; i++) {
    const doc = f[i]
    const regExAsString =
      numAdditionalChars > 0
        ? `(${replaceValue}).{${numAdditionalChars}}`
        : `(${replaceValue})`

    const desc = doc.description
    const reg = new RegExp(regExAsString)
    const newDesc = desc.replace(reg, replaceWith)
    const ret = await findOneAndUpdate(
      DATA_COLLECTION_NAME,
      { _id: doc._id },
      { description: newDesc }
    )
    const change = { original: desc, new: ret[0].description }
    yellow('change', change)
    changes.push(change)

    green(`${id}: returned desc: `, ret[0].description)
  }
  // yellow('stripAction: changes', changes)
  return changes
}

const categorizeAction = async r => {
  const { criteria, expectRows, id } = r
  const filter = filterBuilder(criteria)
  const f = await wrappedFind(filter)
  printResult('categorizeAction', id, expectRows, f.length)
}

const runRule = async r => {
  switch (r.action.action) {
    case 'rename':
      return renameAction(r)
    case 'delete':
      return deleteAction(r)
    case 'strip':
      // const a = await stripAction(r)
      // console.log('a', a)
      return await stripAction(r)
    case 'categorize':
      return categorizeAction(r)
    default:
      redf('ERROR', `unknown action ${r.action}`)
  }
}

const main = async () => {
  await loadData(true)
  const { rules } = await readRules()
  // green('rules', rules)
  // green('rules.length', rules.rules.length)
  for (let i = 0; i < rules.length; i++) {
    const r = rules[i]
    // console.log('r', r)
    if ([5, 18].includes(r.id)) {
      blue(`start rule ${r.id}`)
      const change = await runRule(r)
      blue(`end rule ${r.id}`)
      yellow('main: change', change)
    }
  }
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