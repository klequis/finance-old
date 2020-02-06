const stripAction = (rule, doc) => {
  const { action, criteria, expectRows, id } = rule
  const { field } = criteria
  
  // const { replaceValue, replaceWith, numAdditionalChars } = action
  if (andCondition(criteria, doc)) {
    console.log('match: ', doc[field])

  }
  // const matchRegEx = new RegExp(criteria.value)
  // if (doc.description.match(matchRegEx) !== null) {
  //   return doc
  // }


  // const regExAsString =
  //   numAdditionalChars > 0
  //     ? `(${replaceValue}).{${numAdditionalChars}}`
  //     : `(${replaceValue})`
  // const regex = new RegExp(regExAsString)

  // const filteredData = data.filter(doc => doc.description.match(regex) !== null)
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
  //   changes.push(change)

  //   green(`${id}: returned desc: `, ret[0].description)
  // }
}