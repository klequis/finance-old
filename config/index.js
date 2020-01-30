// settings are in keybase

import settings from './config.settings'
import debug from 'debug'

export const TEST_LOCAL = 'testLocal'
export const TEST_REMOTE = 'testRemote'
export const DEV = 'development'
export const PROD = 'production'

const unknowEnvName = env =>
  `ERROR: config/index.js: unknown environment name: ${env}. Must be ${TEST_LOCAL}, ${TEST_REMOTE}, ${DEV} or ${PROD}`

const lConfig = debug('server:config')


const mongoUri = env => {
  switch (env) {
    case TEST_LOCAL:
      lConfig('env: ', env)
      lConfig('monguUri: ', settings.db.testLocal.mongoUri)
      return settings.db.testLocal.mongoUri
    case TEST_REMOTE:
      lConfig('env: ', env)
      lConfig('monguUri: ', settings.db.testRemote.mongoUri)
      return settings.db.testRemote.mongoUri
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
    case TEST_REMOTE:
      return settings.db[TEST_REMOTE].dbName
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
    case TEST_REMOTE:
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
    case TEST_REMOTE:
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
    return process.env.NODE_ENV
  } else {
    return PROD
  }
}

const config = env => {
  const _env = setNodeEnv(env)
  const envExists = [TEST_LOCAL, DEV, TEST_REMOTE, PROD].findIndex(
    i => i === _env
  )

  if (!(envExists >= 0)) {
    throw new Error(unknowEnvName())
  }

  return {
    port: port(_env),
    apiRoot: apiRoot(_env),
    auth0: settings.auth0,
    env: _env,
    dbName: dbName(_env),
    mongoUri: mongoUri(_env),
    testUser: settings.testUser
  }
}

export default config
