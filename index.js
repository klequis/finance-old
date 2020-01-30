import fs from 'fs'
import csv from 'csvtojson'
import { dropCollection, find, insertMany, updateMany } from 'db'
import { DATA_COLLECTION_NAME } from 'db/constants'
// eslint-disable-next-line
import { green } from 'logger'

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
const rename = async r => {
  // const f = await find(DATA_COLLECTION_NAME, { description: { $in: [/^C/] } })
  // const f = await find(DATA_COLLECTION_NAME, { description: { $regex: `^${r.criteria[0].value}` } })
  // green('f', f)
  // green('r.actionValue', r.actionValue)
  const um = await updateMany(DATA_COLLECTION_NAME, { description: { $regex: `^${r.criteria[0].value}` } }, { description: r.actionValue })
  console.log('um ****************************')
  console.log(um)
}

// delete [none]
// strip  [none]
// categorize category1, [category2]

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
  await dropCollection(DATA_COLLECTION_NAME)
  const chaseJSON = await readChaseChecking()
  const newChaseJSON = await transformChaseChk(chaseJSON)
  await insertMany(DATA_COLLECTION_NAME, newChaseJSON)
  // console.log('ret', ret)
  const rules = await readRules()
  // green('rules', typeof rules.rules)

  // green(rules.rules)
  //rules.rules.map(r => green(r.action))
  green('rules.rules[0]', rules.rules[0])
  rename(rules.rules[0])
}

const applyRules = () => {}

main()
