// settings are in keybase

import settings from './config.settings'
import debug from 'debug'

// eslint-disable-next-line
import { green } from 'logger'

export const TEST_LOCAL = 'testLocal'
export const DEV = 'development'
export const PROD = 'production'

const unknowEnvName = env =>
  `ERROR: config/index.js: unknown environment name: ${env}. Must be ${TEST_LOCAL}, ${DEV} or ${PROD}`

const lConfig = debug('server:config')

const mongoUri = env => {
  switch (env) {
    case TEST_LOCAL:
      lConfig('env: ', env)
      lConfig('monguUri: ', settings.db.testLocal.mongoUri)
      return settings.db.testLocal.mongoUri
    case DEV:
      lConfig('env: ', env)
      lConfig('monguUri: ', settings.db.development.mongoUri)
      return settings.db.development.mongoUri
    case PROD:
      return settings.db.production.mongoUri
    default:
      throw new Error(unknowEnvName())
  }
}

const dbName = env => {
  switch (env) {
    case TEST_LOCAL:
      return settings.db[TEST_LOCAL].dbName
    case DEV:
      return settings.db[DEV].dbName
    case PROD:
      return settings.db[PROD].dbName
    default:
      throw new Error(unknowEnvName())
  }
}

const apiRoot = env => {
  switch (env) {
    case TEST_LOCAL:
    case DEV:
      return settings.apiRoot.local
    case PROD:
      return settings.apiRoot.remote
    default:
      throw new Error(unknowEnvName())
  }
}

const port = env => {
  switch (env) {
    case TEST_LOCAL:
    case DEV:
      return settings.serverPort.local
    case PROD:
      return settings.serverPort.remote
    default:
      throw new Error(unknowEnvName())
  }
}

const setNodeEnv = (env) => {
  if (env) {
    return env
  } else if (process.env.NODE_ENV) {
    // green('env', env)
    const ret = process.env.NODE_ENV
    // green('setNodeEnv: ret', ret)
    return ret
  } else {
    return PROD
  }
}

const config = env => {
  
  const _env = setNodeEnv(env)
  // green('config: _env', _env)
  const envExists = [TEST_LOCAL, DEV, PROD].findIndex(
    i => i === _env
  )
  
  if (!(envExists >= 0)) {
    throw new Error(unknowEnvName())
  }
  
  const ret = {
    env: _env,
    dbName: dbName(_env),
    mongoUri: mongoUri(_env),
    testUser: settings.testUser
  }
  return ret
}

export default config
