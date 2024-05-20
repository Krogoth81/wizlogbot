import { config } from 'lib/config'
import { MongoClient } from 'mongodb'
const { mongo } = config

let mongoClient: MongoClient

export const mongoDbConnectionString = `mongodb+srv://${mongo.user}:${mongo.password}@logbot.gwb7ufu.mongodb.net/?retryWrites=true&w=majority&appName=logbot`

export const getClient = async () => {
  if (!mongoClient) {
    mongoClient = new MongoClient(mongoDbConnectionString)
    await mongoClient.connect()
    mongoClient.on('error', console.error)
  }
  return mongoClient
}
