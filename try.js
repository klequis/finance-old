// const x = ['one', 'twoe', 'three']



// const r = x.some(i => i.match(/^a/))
// console.log('some', r)

// const y = ['aaa', 'bab', 'cac']
// const s = y.every(i => i.match(/a/gm))
// console.log('every', s)

// const z = ['abc', 'ade', 'afg']
// const t = z.every(i => i.match(/^a/gm))
// console.log('t', t);


const andCondition = (criteria, str) => {
  return criteria.every(c => str.match(c))
}

const a = andCondition([/^t/gm, /apple/gm], 'this is very good')
console.log('a', a);

const c = 'bat'

const d = new RegExp(`^${c}`)
console.log('d', d)
