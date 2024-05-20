import { setReminderMessagebyChannelId } from 'lib/models/Schedules'
import { cancelChannelReminder } from 'lib/services/agenda/schedules'
import { MessageResolver } from 'lib/types'

export const setReminderMessage: MessageResolver = async (msg, content) => {
  await setReminderMessagebyChannelId({ channelId: msg.channelId, message: content, createdBy: msg.author.id })
  msg.react('✅')
}

export const cancelReminder: MessageResolver = async (msg) => {
  const res = await cancelChannelReminder(msg.channelId)
  msg.react(res > 0 ? '✅' : '🤷')
}
