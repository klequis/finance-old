const replaceAllAction = async r => {
  const { criteria, expectRows, id, action } = r
  const { actionValue: to } = action
  const filter = filterBuilder(criteria)

  // tmp code
  const f = await wrappedFind(filter)
  printResult('replaceAction', id, expectRows, f.length)
  // tmp code

  const um = await updateMany(DATA_COLLECTION_NAME, filter, { description: to })

  // greenf(`replaced ${um.modifiedCount} documents`)
  // greenf('    from: ', from)
  // greenf('    to: ', to)
}