import dayjs from 'dayjs'
import { DiscordAPIError, RESTJSONErrorCodes } from 'discord.js'
import type { TextChannel } from 'discord.js'
import { config } from 'lib/config'
import { findDuePredictions, getPredictionById, markPredictionPosted, recordPostFailure } from 'lib/models/Predictions'
import { bot } from 'lib/server'
import { enqueueSend } from 'lib/services/discord/sendQueue'
import type { Prediction } from 'lib/services/mongodb/types'

// A prediction posted more than this long after its trigger date is flagged as
// late, so nobody reading the channel thinks the bot fired at the wrong time.
const LATE_THRESHOLD_MS = 5 * 60 * 1000
// Transient failures are retried by the sweep; give up eventually so a
// permanently broken prediction can't be retried forever.
const MAX_POST_ATTEMPTS = 5
// Upper bound on how many overdue predictions one sweep pass will queue.
const SWEEP_BATCH_SIZE = 100
// Outside production the bot only ever posts in this channel.
const DEV_CHANNEL_NAME = 'bot-tester'

// Discord errors that no amount of retrying will fix.
const PERMANENT_ERROR_CODES: Array<number> = [
  RESTJSONErrorCodes.UnknownChannel,
  RESTJSONErrorCodes.UnknownGuild,
  RESTJSONErrorCodes.MissingAccess,
  RESTJSONErrorCodes.MissingPermissions,
]

const isPermanentError = (error: unknown) =>
  error instanceof DiscordAPIError && PERMANENT_ERROR_CODES.includes(Number(error.code))

// The stored messageUrl is written at creation time, so the happy path needs no
// REST call to recover it. Older documents predate the field; a Discord message
// link is fully derivable from the ids we already have.
const sourceMessageUrl = (prediction: Prediction) =>
  prediction.messageUrl ??
  `https://discord.com/channels/${prediction.createdInGuildId}/${prediction.createdInChannelId}/${prediction.createdByMessageId}`

const buildMessage = (prediction: Prediction) => {
  const age = dayjs(prediction.createdAt).locale('en').fromNow()
  const lateBy = Date.now() - new Date(prediction.triggerDate).getTime()
  const lateNote =
    lateBy > LATE_THRESHOLD_MS
      ? ` (due ${dayjs(prediction.triggerDate).tz('Europe/Oslo').format('YYYY-MM-DD HH:mm')})`
      : ''

  return `Prediction by <@${prediction.createdBy}> ${age}${lateNote} -> ${sourceMessageUrl(prediction)}\n> ${prediction.content}`
}

const abandon = async (id: string, reason: string) => {
  console.error(new Date(), `Abandoning prediction ${id}: ${reason}`)
  await recordPostFailure({ id, reason })
}

/**
 * Posts a single prediction. Runs inside a send-queue slot, so exactly one of
 * these is in flight at a time and they are spaced apart.
 *
 * Never throws: every outcome is recorded on the document so the sweep knows
 * whether to come back for it.
 */
const deliverPrediction = async (predictionId: string) => {
  // Re-read rather than trusting what was queued — the prediction may have been
  // deleted, edited or already delivered since then.
  const prediction = await getPredictionById(predictionId)

  if (!prediction) {
    console.warn(new Date(), `Prediction ${predictionId} no longer exists, skipping delivery`)
    return
  }
  if (prediction.deleted || prediction.postedAt || prediction.postAbandonedReason) {
    return
  }
  if ((prediction.postAttempts ?? 0) >= MAX_POST_ATTEMPTS) {
    await abandon(predictionId, `gave up after ${MAX_POST_ATTEMPTS} failed attempts`)
    return
  }

  try {
    // fetch, not cache.get: the channel cache is empty right after a restart,
    // which is exactly when a backlog of overdue predictions gets delivered.
    const channel = await bot.channels.fetch(prediction.createdInChannelId)

    if (!channel?.isTextBased()) {
      await abandon(predictionId, `channel ${prediction.createdInChannelId} is missing or not text-based`)
      return
    }

    // The `predictions` collection is shared between dev and prod (only the
    // Agenda collections are split, see services/mongodb/db.ts). The sweep
    // queries it directly, so without this a local dev run would deliver
    // production predictions into real channels alongside the live bot.
    // Mirrors the same #bot-tester gate the message handlers use in server.ts.
    if (!config.isProd && (channel as TextChannel).name !== DEV_CHANNEL_NAME) {
      return
    }

    await (channel as TextChannel).send(buildMessage(prediction))
    await markPredictionPosted(predictionId)
  } catch (error) {
    if (isPermanentError(error)) {
      await abandon(predictionId, `Discord rejected the send permanently (code ${(error as DiscordAPIError).code})`)
      return
    }
    // Transient: leave postedAt unset so the next sweep retries it.
    console.error(new Date(), `Failed to deliver prediction ${predictionId}, will retry`, error)
    await recordPostFailure({ id: predictionId })
  }
}

/**
 * Hands a prediction to the paced send queue. Safe to call more than once for
 * the same prediction — the queue dedupes by key, and deliverPrediction
 * re-checks postedAt before sending.
 */
export const queuePredictionDelivery = (predictionId: string) =>
  enqueueSend(`prediction:${predictionId}`, () => deliverPrediction(predictionId))

/**
 * Finds everything that should already have been posted and queues it.
 *
 * This is the safety net that makes delivery actually reliable: it recovers
 * predictions missed while the bot was down, lost to a crash mid-send, dropped
 * because their Agenda job failed, or left behind by a transient Discord error.
 */
export const sweepDuePredictions = async () => {
  const due = await findDuePredictions(SWEEP_BATCH_SIZE)
  if (due.length === 0) {
    return 0
  }

  const queued = due.filter((prediction) => queuePredictionDelivery(prediction._id.toString())).length
  console.log(new Date(), `Prediction sweep: ${due.length} due, ${queued} queued for delivery`)
  return queued
}
