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
    _id: new ObjectId(),
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
    deleted: false,
    deletedAt: null,
    deletedBy: null,
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
  limit?: number
  includeAuthorFilter: boolean
  authorId: string
}

export const getPredictions = async ({
  guildId,
  includePastPredictions,
  limit = 5,
  authorId,
  includeAuthorFilter,
}: GetPredictionsProps) => {
  const mongo = await mongoClient()
  const filter: Filter<Prediction> = { deleted: false }

  if (includeAuthorFilter) {
    filter.createdBy = authorId
  }
  if (guildId) {
    filter.createdInGuildId = guildId
  }
  if (!includePastPredictions) {
    filter.triggerDate = { $gte: new Date() }
  }
  console.log(filter)
  return mongo.Predictions.find(filter).sort({ triggerDate: 1 }).limit(limit).toArray()
}

export const deletePredictions = async ({ ids, deletedBy }: { ids: Array<string>; deletedBy: string }) => {
  const mongo = await mongoClient()
  const res = await mongo.Predictions.updateMany(
    { deleted: false, _id: { $in: ids.map((id) => new ObjectId(id)) } },
    { $set: { deleted: true, deletedAt: new Date(), deletedBy } },
  )
  return res.modifiedCount
}
