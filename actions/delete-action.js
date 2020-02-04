import { DATA_COLLECTION_NAME } from 'db/constants'

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

export default deleteAction