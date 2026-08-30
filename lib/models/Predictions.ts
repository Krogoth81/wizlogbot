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
    postedAt: null,
    postAttempts: 0,
    postAbandonedReason: null,
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

// --- Delivery tracking -------------------------------------------------------

// Marks a prediction as actually posted to Discord. Called immediately after a
// successful send; until this lands the sweep will keep retrying the delivery.
export const markPredictionPosted = async (id: string) => {
  const mongo = await mongoClient()
  await mongo.Predictions.updateOne(
    { _id: new ObjectId(id) },
    { $set: { postedAt: new Date(), updatedAt: new Date() } },
  )
}

// A send failed. Transient failures just bump the counter and stay eligible for
// the next sweep; a reason means "never retry this again".
export const recordPostFailure = async ({ id, reason }: { id: string; reason?: string }) => {
  const mongo = await mongoClient()
  await mongo.Predictions.updateOne(
    { _id: new ObjectId(id) },
    {
      $inc: { postAttempts: 1 },
      $set: { updatedAt: new Date(), postAbandonedReason: reason ?? null },
    },
  )
}

// Everything that should have been posted by `now` but hasn't been. This is the
// recovery path for downtime, crashes mid-send and transient Discord failures.
export const findDuePredictions = async (limit: number) => {
  const mongo = await mongoClient()
  return mongo.Predictions.find({
    deleted: false,
    // `$exists: true` matters: in Mongo a bare `null` match also matches
    // documents where the field is absent, which is every prediction created
    // before delivery tracking existed. Requiring the field means that if the
    // backfill ever fails to run, the sweep quietly finds nothing rather than
    // re-posting the entire history into the channel.
    postedAt: { $exists: true, $eq: null },
    postAbandonedReason: null,
    triggerDate: { $lte: new Date() },
  })
    .sort({ triggerDate: 1 })
    .limit(limit)
    .toArray()
}

// One-time migration, safe to run on every boot: `postedAt: { $exists: false }`
// stops matching once a doc has been touched.
//
// Order matters. Predictions that already triggered predate delivery tracking
// and we have no record of whether they posted, so they are backfilled as
// delivered first — otherwise the very first sweep would re-post years of
// history into the channel.
export const backfillDeliveryFields = async () => {
  const mongo = await mongoClient()
  const past = await mongo.Predictions.updateMany({ postedAt: { $exists: false }, triggerDate: { $lt: new Date() } }, [
    { $set: { postedAt: '$triggerDate', postAttempts: 0, postAbandonedReason: null } },
  ])
  const future = await mongo.Predictions.updateMany(
    { postedAt: { $exists: false } },
    { $set: { postedAt: null, postAttempts: 0, postAbandonedReason: null } },
  )
  if (past.modifiedCount || future.modifiedCount) {
    console.log(new Date(), `Backfilled delivery fields: ${past.modifiedCount} past, ${future.modifiedCount} pending`)
  }
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
