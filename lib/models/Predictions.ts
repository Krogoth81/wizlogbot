import { mongoClient } from 'lib/services/mongodb/db'
import { type Prediction, PredictionStateType } from 'lib/services/mongodb/types'
import { type Filter, ObjectId } from 'mongodb'

interface PredictionInput {
  messageId: string
  channelId: string
  userId: string
  content: string
  guildId: string
  triggerDate: Date
  messageUrl: string
}

export const addPrediction = async ({
  channelId,
  guildId,
  content,
  messageId,
  triggerDate,
  userId,
  messageUrl,
}: PredictionInput) => {
  const mongo = await mongoClient()
  const res = await mongo.Predictions.insertOne({
    content,
    createdByMessageId: messageId,
    createdAt: new Date(),
    createdBy: userId,
    state: PredictionStateType.UNKNOWN,
    createdInChannelId: channelId,
    triggerDate,
    createdInGuildId: guildId,
    updatedAt: new Date(),
    messageUrl,
  })
  return res.insertedId
}

export const getPredictionById = async (id: string) => {
  const mongo = await mongoClient()
  return mongo.Predictions.findOne({ _id: new ObjectId(id) })
}

interface GetPredictionsProps {
  guildId?: string
  includePastPredictions: boolean
}

export const getPredictions = async ({ guildId, includePastPredictions }: GetPredictionsProps) => {
  const mongo = await mongoClient()
  const filter: Filter<Prediction> = {}

  if (guildId) {
    filter.createdInGuildId = guildId
  }
  if (!includePastPredictions) {
    filter.triggerDate = { $gte: new Date() }
  }

  return mongo.Predictions.find(filter).toArray()
}
