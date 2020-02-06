import { find } from 'db'
import { DATA_COLLECTION_NAME } from 'db/constants'
import fs from 'fs'
import { union } from 'ramda'



const jsonToCsv = json => {
  const replacer = (key, value) => (value === null ? '' : value) // specify how you want to handle null values here
  /* TODO: dynamic header creation turned off for development
  const header = json.reduce((accum, curr, idx) => {
    // console.log('accum', accum)
    const keys = Object.keys(curr)
    // console.log('keys', keys)
    const b = union(accum, keys)
    // console.log('b', b)
    return b
  }, [])

  */
  const header = [
    'description',
    'category1',
    'category2',
    'date',
    'origDescription',
    'debit',
    'credit',
    'typeOrig',
    'omit',
    'checkNumber',
    '_id'
  ]
  
  // console.log('header', header);
  

  // const header = Object.keys(json[0])
  let csv = json.map(row =>
    header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(',')
  )

  csv.unshift(header.join(','))
  csv = csv.join('\r\n')
  return csv
}

const writeFile = async csv => {
  const res = await fs.promises.writeFile('new-data.csv', csv, 'utf8')
  return res
}

const writeCsvFile = async () => {
  const data = await find(DATA_COLLECTION_NAME, {})
  // console.log('data', data)

  // console.log('data', JSON.stringify(data))
  const csvData = jsonToCsv(data)
  // console.log('csvData', csvData)

  await writeFile(csvData)
  // console.log('write', write)
}

export default writeCsvFile
