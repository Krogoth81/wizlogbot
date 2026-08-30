import type Agenda from 'agenda'
import type { DefineOptions, Processor } from 'agenda'
import type { TextChannel } from 'discord.js'
import { getPredictionById } from 'lib/models/Predictions'
import { getReminderMessageByChannelId } from 'lib/models/Schedules'
import { bot } from 'lib/server'
import { enqueueSend } from 'lib/services/discord/sendQueue'
import { queuePredictionDelivery, sweepDuePredictions } from 'lib/services/predictions/delivery'
import { ScheduleTypes } from './types'

// Run one job of a given name at a time. The processors themselves are now
// cheap (they queue work rather than talking to Discord), so there is nothing
// to gain from Agenda's default concurrency of 5 — and serialising keeps the
// ordering of same-timestamp predictions predictable.
const SERIAL: DefineOptions = { concurrency: 1, lockLimit: 1 }

const channelReminder: Processor<{ channelId: string }> = async (job, done) => {
  const { channelId } = job.attrs.data
  try {
    const message = await getReminderMessageByChannelId(channelId)
    enqueueSend(`reminder:${channelId}`, async () => {
      // fetch, not cache.get — the cache is cold after every redeploy.
      const channel = await bot.channels.fetch(channelId)
      if (!channel?.isTextBased()) {
        console.error(new Date(), `Channel reminder skipped: ${channelId} is missing or not text-based`)
        return
      }
      await (channel as TextChannel).send(message)
    })
  } catch (error) {
    console.error(new Date(), `channelReminder failed for ${channelId}`, error)
  } finally {
    done()
  }
}

// The fast path: a prediction's date arrived. All this does is hand the id to
// the paced send queue, so the job finishes in milliseconds and Agenda's own
// queue never backs up behind Discord. If the send later fails, or the process
// dies before it happens, PREDICTION_SWEEP picks it back up.
const predictionDateReached: Processor<{ predictionId: string }> = async (job, done) => {
  const { predictionId } = job.attrs.data
  try {
    const prediction = await getPredictionById(predictionId)
    // The `finally` below releases the job; returning early here is enough.
    if (!prediction || prediction.deleted || prediction.postedAt) {
      return
    }
    queuePredictionDelivery(predictionId)
  } catch (error) {
    console.error(new Date(), `predictionDateReached failed for ${predictionId}`, error)
  } finally {
    done()
  }
}

const predictionSweep: Processor<any> = async (_job, done) => {
  try {
    await sweepDuePredictions()
  } catch (error) {
    console.error(new Date(), 'predictionSweep failed', error)
  } finally {
    done()
  }
}

const runTest: Processor<any> = async (job, done) => {
  console.log(new Date(), '\n--- TEST SUCCESSFUL ---\n')
  console.log(new Date(), 'JOB (attrs): ', job.attrs, '\n')
  done()
}

export const setAgendaDefinitions = (agenda: Agenda) => {
  agenda.define(ScheduleTypes.TEST, SERIAL, runTest)
  agenda.define(ScheduleTypes.CHANNEL_REMINDER, SERIAL, channelReminder)
  agenda.define(ScheduleTypes.PREDICTION_DATE_REACHED, SERIAL, predictionDateReached)
  agenda.define(ScheduleTypes.PREDICTION_SWEEP, SERIAL, predictionSweep)
}
