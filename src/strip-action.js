const stripAction = (rule, doc) => {
  const { action, criteria, expectRows, id } = rule
  const { field } = criteria
  
  // const { replaceValue, replaceWith, numAdditionalChars } = action
  // yellow('stripAction')
  if (andCondition(criteria, doc)) {
    yellow('criteria', criteria)
    yellow('field', field)
    console.log('match: ', doc[field])
    yellow('action', action)

  }
  // yellow('doc', doc)
  // yellow('filter', filterBuilder(criteria))
  // yellow('criteria', criteria)
  // yellow('criteria.value', criteria.value)
  // const matchRegEx = new RegExp(criteria.value)
  // yellow('matchRegEx', matchRegEx)
  // if (doc.description.match(matchRegEx) !== null) {
  //   return doc
  // }
  // yellow('** it matched')
  // yellow('desc', doc.description)


  // const regExAsString =
  //   numAdditionalChars > 0
  //     ? `(${replaceValue}).{${numAdditionalChars}}`
  //     : `(${replaceValue})`
  // const regex = new RegExp(regExAsString)

  // const filteredData = data.filter(doc => doc.description.match(regex) !== null)
  // yellow('filteredData', filteredData)
  // tmp code
  // printResult('stripAction', id, expectRows, f.length)
  // tmp code
  // const { replaceValue, replaceWith, numAdditionalChars } = action
  // for (let i; i < f.length; i++) {
  //   const doc = f[i]
  //   const regExAsString =
  //     numAdditionalChars > 0
  //       ? `(${replaceValue}).{${numAdditionalChars}}`
  //       : `(${replaceValue})`

  //   const desc = doc.description
  //   const reg = new RegExp(regExAsString)
  //   const newDesc = desc.replace(reg, replaceWith)
  //   const ret = await findOneAndUpdate(
  //     DATA_COLLECTION_NAME,
  //     { _id: doc._id },
  //     { description: newDesc }
  //   )
  //   const change = { original: desc, new: ret[0].description }
  //   yellow('change', change)
  //   changes.push(change)

  //   green(`${id}: returned desc: `, ret[0].description)
  // }
  // // yellow('stripAction: changes', changes)
}