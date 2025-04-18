import dayjs from 'dayjs'
import { initAgenda } from './client'
import { ScheduleTypes } from './types'

export const cancelChannelReminder = async (channelId: string) => {
  const agenda = await initAgenda()
  console.log('Cancelling job', channelId)
  const res = await agenda.cancel({ name: ScheduleTypes.CHANNEL_REMINDER, 'data.channelId': channelId })
  return res
}

export const scheduleTestInMinutes = async (data: any, minutes: number) => {
  const agenda = await initAgenda()
  console.log('data', data, '\nminutes', minutes)
  await agenda.schedule(dayjs().add(minutes, 'minute').toDate(), ScheduleTypes.TEST, data)
}

export const scheduleChannelReminder = async (data: { channelId: string }, date: Date) => {
  const agenda = await initAgenda()
  console.log('Creating job: ', data, date)

  await cancelChannelReminder(data.channelId)
  const res = await agenda.schedule(date, ScheduleTypes.CHANNEL_REMINDER, data)

  return res
}

export const cancelPredictionTrigger = async (predictionId: string) => {
  const agenda = await initAgenda()
  const res = await agenda.cancel({ name: ScheduleTypes.PREDICTION_DATE_REACHED, 'data.predictionId': predictionId })
  return res
}

export const schedulePredictionTrigger = async (data: { predictionId: string }, date: Date) => {
  const agenda = await initAgenda()
  await cancelPredictionTrigger(data.predictionId)
  const res = await agenda.schedule(date, ScheduleTypes.PREDICTION_DATE_REACHED, data)
  return res
}
