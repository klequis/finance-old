import fs from 'fs'
import csv from 'csvtojson'
import { dropCollection, deleteMany, insertMany, updateMany } from 'db'
import { DATA_COLLECTION_NAME } from 'db/constants'
// eslint-disable-next-line
import { green, greenf, redf } from 'logger'

const readRules = async () => {
  const rules = await fs.promises.readFile('rules.json')
  const json = await JSON.parse(rules)
  return json
}

const readChaseChecking = async () => {
  const json = await csv({
    trim: true,
    checkType: true
  }).fromFile('data/chase.carl.checking.2465.csv')
  return json
}

// readRules().then(rules => console.log(rules))

const transformChaseChk = data => {
  return data.map(r => {
    return {
      date: new Date(r['Posting Date']).toISOString(),
      description: r.Description,
      debit: r.Amount <= 0 ? r.Amount : null,
      credit: r.Amount <= 0 ? null : r.Amount,
      typeOrig: r.Type
    }
  })
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
  return { [field]: { $regex: `^${value}` } }
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
  }
}

// delete [none]
const deleteAction = async r => {
  const filter = r.criteria.map(async criteria => {
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
    }
  })
  const dm = await deleteMany(DATA_COLLECTION_NAME, filter)

  greenf(`Deleted ${dm.deletedCount} documents`)
  greenf(`    filter: ${filter}`)
}

// strip  [none]
const stripAction = async r => {}
// categorize category1, [category2]
const categorizeAction = async r => {}

// const getRule = (r) => {
//   switch (r.action) {
//     case 'rename':
//       return {
//         criteria: r.criteria,
//         action: r.action,
//         actionValue: r.actionValue
//       }
//     case 'delete':
//     case 'strip':
//       return {
//         criteria: r.criteria,
//         action: 'delete'
//       }
//     default:
//       return null
//   }
// }

const main = async () => {
  console.log()
  green('****** New run ******')
  await dropCollection(DATA_COLLECTION_NAME)
  const chaseJSON = await readChaseChecking()
  const newChaseJSON = await transformChaseChk(chaseJSON)
  await insertMany(DATA_COLLECTION_NAME, newChaseJSON)
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
  })
}

main()
