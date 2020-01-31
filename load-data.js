import { createIndex, dropCollection, insertMany } from './db'
import csv from 'csvtojson'
import { DATA_COLLECTION_NAME } from 'db/constants'
// eslint-disable-next-line
import { green, greenf, redf } from 'logger'

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

const loadData = async (loadRaw = false) => {
  console.log('*')
  console.log('*')
  console.log('*')
  console.log('*')
  green('****** New run ******')
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
