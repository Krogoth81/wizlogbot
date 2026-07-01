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
    replyMessageId: null,
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

// Used by the edit path: when a user edits their original `!predict` message,
// the command re-runs and looks up the prediction it originally created by that
// message's id, so it can update in place instead of inserting a duplicate.
export const getPredictionByMessageId = async (messageId: string) => {
  const mongo = await mongoClient()
  return mongo.Predictions.findOne({ createdByMessageId: messageId, deleted: false })
}

export const updatePrediction = async ({
  id,
  content,
  triggerDate,
}: {
  id: string
  content: string
  triggerDate: Date
}) => {
  const mongo = await mongoClient()
  const res = await mongo.Predictions.updateOne(
    { _id: new ObjectId(id), deleted: false },
    { $set: { content, triggerDate, updatedAt: new Date() } },
  )
  return res.modifiedCount
}

// Records which message the bot's confirmation reply is, so a later edit can
// update that reply in place.
export const setPredictionReplyMessageId = async ({ id, replyMessageId }: { id: string; replyMessageId: string }) => {
  const mongo = await mongoClient()
  await mongo.Predictions.updateOne({ _id: new ObjectId(id) }, { $set: { replyMessageId } })
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
