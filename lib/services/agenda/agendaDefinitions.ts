import type Agenda from 'agenda'
import type { Processor } from 'agenda'
import { ScheduleTypes } from './types'
import { bot } from 'lib/server'
import type { TextChannel } from 'discord.js'
import { getReminderMessageByChannelId } from 'lib/models/Schedules'
import { getPredictionById } from 'lib/models/Predictions'
import dayjs from 'dayjs'

const channelReminder: Processor<{ channelId: string }> = async (job, done) => {
  const channel = bot.channels.cache.get(job.attrs.data.channelId) as TextChannel
  const message = await getReminderMessageByChannelId(job.attrs.data.channelId)
  await channel.send(message)
  done()
}

const predictionDateReached: Processor<{ predictionId: string }> = async (job, done) => {
  const prediction = await getPredictionById(job.attrs.data.predictionId)
  if (prediction.deleted) {
    done()
    return
  }
  const channel = bot.channels.cache.get(prediction.createdInChannelId) as TextChannel
  const message = await channel.messages.fetch(prediction.createdByMessageId)
  const user = bot.users.resolve(prediction.createdBy)
  await channel.send(
    `Prediction by <@${user.id}> ${dayjs(prediction.createdAt).locale('en').fromNow()} -> ${message.url}\n\> ${prediction.content}`,
  )
  done()
}

const runTest: Processor<any> = async (job, done) => {
  console.log(new Date(), '\n--- TEST SUCCESSFUL ---\n')
  console.log(new Date(), 'JOB (attrs): ', job.attrs, '\n')
  done()
}

export const setAgendaDefinitions = (agenda: Agenda) => {
  agenda.define(ScheduleTypes.TEST, runTest)
  agenda.define(ScheduleTypes.CHANNEL_REMINDER, channelReminder)
  agenda.define(ScheduleTypes.PREDICTION_DATE_REACHED, predictionDateReached)
}
