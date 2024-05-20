import Agenda, { Processor } from 'agenda'
import { ScheduleTypes } from './types'
import { bot } from 'lib/server'
import { TextChannel } from 'discord.js'

const channelReminder: Processor<{ channelId: string }> = async (job, done) => {
  const channel = bot.channels.cache.get(job.attrs.data.channelId) as TextChannel

  await channel.send('Heya, dis is reminder yo!')
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
}
