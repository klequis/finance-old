import fs from 'fs'


console.log('hello')

const readRules = async () => {
  const rules = await fs.promises.readFile('rules.json')
  
  const json = await JSON.parse(rules)
  return json
}

readRules().then(rules => console.log(rules))
