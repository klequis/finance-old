import fs from 'fs'
import { deleteMany, find, updateMany } from 'db'
import { DATA_COLLECTION_NAME } from 'db/constants'
import { mergeAll } from 'ramda'
import loadData from './load-data'
// eslint-disable-next-line
import { green, greenf, redf } from 'logger'

const readRules = async () => {
  const rules = await fs.promises.readFile('rules.json')
  const json = await JSON.parse(rules)
  return json
}

// rename action-value
const renameAction = async r => {
  // const f = await find(DATA_COLLECTION_NAME, { description: { $in: [/^C/] } })
  // const f = await find(DATA_COLLECTION_NAME, { description: { $regex: `^${r.criteria[0].value}` } })
  // green('f', f)
  // green('r.actionValue', r.actionValue)
  const from = r.criteria[0].value
  const to = r.actionValue
  const um = await updateMany(
    DATA_COLLECTION_NAME,
    { description: { $regex: `^${from}` } },
    { description: to }
  )

  greenf(`Renamed ${um.modifiedCount} documents`)
  greenf('    from: ', from)
  greenf('    to: ', to)
}

const operationBeginsWith = (field, value) => {
  return { [field]: { $regex: `^${value}`, $options: 'im' } }
}

const operationEquals = (field, value) => {
  return { [field]: { $eq: value } }
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

const conditionBuilder = criteria => {
  // takes a single criteria object
  const { field, operation, value } = criteria
  switch (operation) {
    case 'beginsWith':
      return operationBeginsWith(field, value)
    case 'equals':
      return operationEquals(field, value)
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
    return { $and: [] }
  }
}

// delete [none]
const deleteAction = async r => {
  const { criteria } = r

  let filter
  if (criteria.length > 1) {
    green('criteria', criteria)
    // const works = {
    //   $and: [
    //     { description: { $regex: '^NY STATE' } },
    //     { description: { $regex: 'NYSTTAXRFD' } }
    //   ]
    // }

    const x = mergeAll(
      criteria.map(c => {
        // const { field, operation, value } = c
        const ret = conditionBuilder(c)
        green('ret', ret)
        return ret
      })
    )
    filter = { $and: [x] }
    // green('works', works)
    green('filter', filter)
    // green('y', y)
  } else {

    // return
    // const criteria = r.criteria[0]
    // const { field, operation, value } = criteria
    // switch (operation) {
    //   case 'beginsWith':
    //     filter = operationBeginsWith(field, value)
    //     break
    //   case 'equals':
    //     filter = operationEquals(field, value)
    //     break
    //   default:
    //     redf(
    //       'deleteAction ERROR: ',
    //       `operation ${operation} not covered in switch`
    //     )
    // }
  }
  // green('filter', filter)
  green('filter', filter)
  const f = await find(
    DATA_COLLECTION_NAME,
    filter,
    {},
    // { caseLevel: true, locale: 'en_US' }
    { locale: 'en', strength: 2 }
  )
  // green('f', f)
  green('documents returned', f.length)

  const dm = await deleteMany(DATA_COLLECTION_NAME, filter, {}, { locale: 'en', strength: 2 })
  greenf(`Deleted ${dm.deletedCount} documents`)
  greenf(`    filter: ${filter}`)
}

// strip  [none]
const stripAction = async r => {}
// categorize category1, [category2]
const categorizeAction = async r => {}

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
        deleteAction(r)
        break
      case 'strip':
        // stripAction(r)
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
