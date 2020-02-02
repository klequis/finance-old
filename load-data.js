import { createIndex, dropCollection, insertMany } from './db'
import csv from 'csvtojson'
import { DATA_COLLECTION_NAME } from 'db/constants'
import { mergeRight, merge } from 'ramda'
// eslint-disable-next-line
import { green, greenf, redf, yellow } from 'logger'

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
    // yellow('check #', typeof r['Check or Slip #'])
    const checkNumber = typeof r['Check or Slip #'] === 'number'
      ? r['Check or Slip #']
      : null
    // console.log('checkNumber', checkNumber)
    const a = {
      date: new Date(r['Posting Date']).toISOString(),
      description: r.Description.replace(/\s{2,}/g, ' '),
      debit: r.Amount <= 0 ? r.Amount : null,
      credit: r.Amount <= 0 ? null : r.Amount,
      typeOrig: r.Type.toLowerCase()
    }
    const b = checkNumber !== null ? { checkNumber } : {}
    
    const c = mergeRight(a, b)
    if (checkNumber !== null) { 
      console.log('checkNumber', checkNumber) 
      console.log('c', c)
    }
    return c
  })
}

const loadData = async (loadRaw = false) => {
  console.log('*')
  console.log('*')
  green('****** New run ******')
  console.log('*')
  console.log('*')
  await dropCollection(DATA_COLLECTION_NAME)

  const chaseJSON = await readChaseChecking()
  const newChaseJSON = await transformChaseChk(chaseJSON)

  await insertMany(DATA_COLLECTION_NAME, newChaseJSON)
  // { collation: { caseLevel: true, locale: 'en_US' } }
  await createIndex(DATA_COLLECTION_NAME, 'description', {
    collation: { caseLevel: true, locale: 'en_US' }
  })
  await createIndex(DATA_COLLECTION_NAME, 'typeOrig', {
    collation: { caseLevel: true, locale: 'en_US' }
  })
  if (loadRaw) {
    await dropCollection('data-all')
    await insertMany('data-all', newChaseJSON)
  }
}

export default loadData
