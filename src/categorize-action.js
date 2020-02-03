const categorizeAction = async r => {
  const { criteria, expectRows, id } = r
  const filter = filterBuilder(criteria)
  const f = await wrappedFind(filter)
  printResult('categorizeAction', id, expectRows, f.length)
}