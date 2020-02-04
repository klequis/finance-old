import { find, updateMany, findOneAndUpdate } from 'db'
// import omitAction from 'actions/omit-action'
// import categorizeAction from 'actions/categorize-action'
// import replaceAllAction from 'actions/replace-all-action'
// import replaceSubstringAction from 'actions/replace-substring-action'
// import stripAction from 'actions/strip-action'
// import truncateAction from 'actions/truncate-action'
import { DATA_COLLECTION_NAME } from 'db/constants'
import loadData from './load-data'
import {
  readRules,
  // makeRegEx,
  // andCondition,
  // wrappedFind,
  // operationBeginsWith,
  // operationContains,
  // operationEquals,
  // conditionBuilder,
  filterBuilder,
  printResult
} from 'actions/action-utils'
// import { hasProp } from 'lib'
import writeCsvFile from './json-to-csv'
import { hasProp } from 'lib'

// eslint-disable-next-line
import { blue, green, greenf, redf, yellow } from 'logger'

const rulesToRun = [1, 2, 3, 4]

const printFilter = filter => {
  if (hasProp('$and', filter)) {
    const a = filter.$and
    yellow('$and', a)
  } else {
    yellow('filter', filter)
  }
}

const main = async () => {
  await loadData(true)
  // const data = await find(DATA_COLLECTION_NAME, {})

  const { rules: allRules } = await readRules()
  const runRules = allRules.filter(r => rulesToRun.includes(r.id))
  console.log('runRules', runRules)

  // omit rules
  blue('** omit rules **')
  const omitRules = runRules.filter(rule => rule.action.action === 'omit')
  for (let i = 0; i < omitRules.length; i++) {
    const rule = omitRules[i]
    console.log('---')
    console.log(`** id: ${rule.id}`)
    const { criteria } = rule
    const filter = filterBuilder(criteria)
    const f = await find(DATA_COLLECTION_NAME, filter)
    printFilter(filter)
    printResult(rule.id, rule.numExpectedDocs, f.length)
    const set = { omit: true }
    const udm = await updateMany(DATA_COLLECTION_NAME, filter, set)
  }

  // strip rules
  blue('** stripRules** ')
  const stripRules = runRules.filter(rule => rule.action.action === 'strip')

  for (let i = 0; i < stripRules.length; i++) {
    const rule = stripRules[i]
    console.log('---')
    console.log(`** id: ${rule.id}`)
    // yellow('rule', rule)
    const { criteria, action } = rule
    // yellow('criteria', criteria)
    const filter = filterBuilder(criteria)
    // yellow('filter', filter)
    const f = await find(DATA_COLLECTION_NAME, filter)
    // yellow('f', f)
    printResult(rule.id, rule.numExpectedDocs, f.length)
    const { field, findValue, numAdditionalChars } = action
    // regExAsString won't work for all criteria yet - modify
    const regExAsString =
      numAdditionalChars > 0
        ? `(${findValue}).{${numAdditionalChars}}`
        : `(${findValue})`
    const regex = new RegExp(regExAsString)
    for (let j = 0; j < f.length; j++) {
      const doc = f[j]
      const origFieldValue = doc[field]
      // yellow('origFieldValue', origFieldValue)
      const newFieldValue = doc[field].replace(regex, '').trim()
      // yellow(' newFieldValue', newFieldValue)
      const foau = await findOneAndUpdate(
        DATA_COLLECTION_NAME,
        { _id: doc._id },
        { [field]: newFieldValue, [`orig${field}`]: origFieldValue }
      )
      // yellow('           foau', foau[0].description)
    }
  }

  // // replace rules
  // blue('** replaceAllRules **')
  // const replaceAllRules = runRules.filter(
  //   rule => rule.action.action === 'replaceAll'
  // )
  // for (let i = 0; i < replaceAllRules.length; i++) {
  //   const rule = replaceAllRules[i]
  //   console.log('---')
  //   console.log(`** id: ${rule.id}`)
  //   const { criteria, action } = rule
  //   const filter = filterBuilder(criteria)
  //   const f = await find(DATA_COLLECTION_NAME, filter)
  //   printResult(rule.id, rule.numExpectedDocs, f.length)
  //   const { field, replaceWithValue } = action
  //   for (let j = 0; j < f.length; j++) {
  //     const doc = f[j]
  //     // yellow('old description', doc.description)
  //     const foau = await findOneAndUpdate(
  //       DATA_COLLECTION_NAME,
  //       { _id: doc._id },
  //       { [field]: replaceWithValue }
  //     )
  //     // yellow('           foau', foau[0].description)
  //   }
  // }

  // // categorize rules
  // blue('** categorizeRules **')
  // const categorizeRules = runRules.filter(
  //   rule => rule.action.action === 'categorize'
  // )
  // for (let i = 0; i < categorizeRules.length; i++) {
  //   const rule = categorizeRules[i]
  //   console.log('---')
  //   console.log(`** id: ${rule.id}`)
  //   const { criteria, action } = rule
  //   const filter = filterBuilder(criteria)
  //   // yellow('filter', filter)
  //   const f = await find(DATA_COLLECTION_NAME, filter)
  //   printResult(rule.id, rule.numExpectedDocs, f.length)
  //   const { category1, category2 } = action
  //   // You probable don't need to loop here and you didn't (probably) need to do so for replaceRules either
  //   const set = hasProp('category2', action)
  //     ? { category1, category2 }
  //     : { category1 }
  //   const udm = await updateMany(DATA_COLLECTION_NAME, filter, set)
  //   // yellow('udm', udm)
  //   // { "typeOrig" : "atm" },
  // }
  writeCsvFile()
}

main()
