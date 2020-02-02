import fs from 'fs'
import { deleteMany, find, updateMany, findOneAndUpdate } from 'db'
import { DATA_COLLECTION_NAME } from 'db/constants'
import { mergeAll } from 'ramda'
import loadData from './load-data'
// eslint-disable-next-line
import { green, greenf, redf, yellow } from 'logger'

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
  green('filter', filter)
  // tmp code
  const f = await wrappedFind(filter)
  printResult('stripAction', id, expectRows, f.length)
  // tmp code

  // // If action.actionValue is undefined set to ''
  // const { replaceValue actionValue: tmpActionValue, numAdditionalChars: tmpAdditionalChars } = action
  // const actionValue = tmpActionValue || ''
  // // Same for numAdditionalChars
  // const numAdditionalChars = tmpAdditionalChars || 0

  const { replaceValue, replaceWith, numAdditionalChars } = action
  // green('numAdditionalChars', numAdditionalChars)
  // if ((criteria.value = 'CHECK #')) {
  // indexOf
  // match (regex)
  // replace looks good for replacing :)
  // search (regex)
  // subString (start/end)

  // CHECK # 2441      ESSEX PORTFOLIO  CHECKPAYMT        ARC ID: 4770369575
  // For more information, see Chapter 3.4.5.1
  f.forEach(async doc => {
    // green('criteria', criteria)
    const regExAsString =
      numAdditionalChars > 0
        ? `(${replaceValue}).{${numAdditionalChars}}`
        : `(${replaceValue})`

    const desc = doc.description
    const reg = new RegExp(regExAsString)
    // console.log('reg', reg)
    const z = desc.replace(reg, replaceWith)
    console.log('z', `'${z}'`)
    console.log('i', doc._id)
    const ret = await findOneAndUpdate(DATA_COLLECTION_NAME, { _id: doc._id }, { description: z })
    green('ret', ret)
  })
}

const categorizeAction = async r => {
  const { criteria, expectRows, id } = r
  const filter = filterBuilder(criteria)
  const f = await wrappedFind(filter)
  printResult('categorizeAction', id, expectRows, f.length)
}

const main = async () => {
  await loadData(true)
  const rules = await readRules()

  rules.rules.forEach(r => {
    if (r.id === 5) {
      switch (r.action.action) {
        case 'rename':
          renameAction(r)
          break
        case 'delete':
          deleteAction(r)
          break
        case 'strip':
          stripAction(r)
          break
        case 'categorize':
          categorizeAction(r)
          break
        default:
          redf('ERROR', `unknown action ${r.action}`)
      }
    }
  })
}

main()
