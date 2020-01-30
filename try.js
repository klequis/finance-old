const x = ['a', 'b', 'c']

const y = x.map(i => i === 'b' ? null : i)

console.log('y', y)