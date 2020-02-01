import fs from 'fs'
import { deleteMany, find, updateMany } from 'db'
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
  green('filter', filter)
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
        // const { field, operation, value } = c
        const ret = conditionBuilder(c)
        green('ret', ret)
        return ret
      })
    )
    return { $and: [x] }
  }
}


const renameAction = async r => {
  const { criteria, actionValue } = r
  const from = criteria[0].value
  const to = actionValue

  const filter = filterBuilder(criteria)
  // tmp code
  const f = await wrappedFind(filter)
  green('rename - documents', f.length)
  // tmp code

  // const um = await updateMany(
  //   DATA_COLLECTION_NAME,
  //   filterBuilder(criteria),
  //   { description: to }
  // )

  // greenf(`Renamed ${um.modifiedCount} documents`)
  // greenf('    from: ', from)
  // greenf('    to: ', to)
}

const a = {
  criteria: [
    {
      field: 'description',
      operation: 'beginsWith',
      value: 'Morgan Stanley'
    },
    { field: 'type', operation: 'equals', value: 'credit' }
  ],
  action: 'delete'
}

const b = {
  $and: [
    { description: { $regex: '^NY STATE' } },
    { description: { $regex: 'NYSTTAXRFD' } }
  ]
}

const c = {
  $and: [
    { description: { $regex: 'Bel Air II', $options: 'im' } },
    { typeOrig: 'BILLPAY' }
  ]
}


// delete [none]
const deleteAction = async r => {
  const { criteria } = r

  const filter = filterBuilder(criteria)
  
  const f = await wrappedFind(filter)
  green('delete - documents returned', f.length)

  // const dm = await deleteMany(DATA_COLLECTION_NAME, filter, {}, { locale: 'en', strength: 2 })
  // greenf(`Deleted ${dm.deletedCount} documents`)
  // greenf(`    filter: ${filter}`)
}

// strip  [none]
const stripAction = async r => {
  
  const { criteria, expectRows } = r
  const f = await wrappedFind(filterBuilder(criteria))
  // green('f', f)
  expectRows === f.length
    ? greenf(`OK: expected: ${expectRows}, actual: ${f.length}`)
    : redf(`ERROR: expected: ${expectRows}, actual: ${f.length}`)
  green('f.length', f.length)

}

// categorize category1, [category2]
const categorizeAction = async r => {
  
}

const main = async () => {
  await loadData()
  // return
  const rules = await readRules()

  // keep
  // green('rules.rules[0]', rules.rules[0])
  // renameAction(rules.rules[0])
  // keep

  // rename action-value
  // delete [none]
  // strip  [none]
  // categorize category1, [category2]

  rules.rules.forEach(r => {
    switch (r.action) {
      case 'rename':
        // renameAction(r)
        break
      case 'delete':
        // deleteAction(r)
        break
      case 'strip':
        stripAction(r)
        break
      case 'categorize':
        // categorizeAction(r)
        break
      default:
        redf('ERROR', `unknown action ${r.action}`)
    }
  })
}

main()
