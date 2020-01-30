// import { ObjectID } from 'mongodb'
import { omit } from 'ramda'
export const removeIdProp = obj => omit(['_id'], obj)
