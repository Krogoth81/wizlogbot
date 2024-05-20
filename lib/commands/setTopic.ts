import dayjs from 'dayjs'
import { ChannelType, TextChannel } from 'discord.js'
import { MessageResolver } from 'lib/types'
import { scheduleChannelReminder } from 'lib/services/agenda/schedules'
import { getReminderMessageByChannelId } from 'lib/models/Schedules'

const getDateFromTopicString = (text?: string) => {
  if (!text) {
    return null
  }
  const regex = /\s(\d{1,2}\/\d{1,2})(?:\s|$)/g
  const match = text.match(regex)
  if (!match) {
    return null
  }
  const [day, month] = match[0].trim().split('/')

  let dayjsObj = dayjs.tz(
    `${Number(day) < 10 ? `0${day}` : day}.${Number(month) < 10 ? `0${month}` : month}`,
    'DD.MM',
    'Europe/Oslo',
  )
  if (dayjs().isAfter(dayjsObj)) {
    dayjsObj = dayjsObj.add(1, 'year')
  }
  dayjsObj = dayjsObj.set('hour', 12).set('minute', 0).set('second', 0)
  return dayjsObj.toDate()
}

export const setTopic: MessageResolver = async (msg, content) => {
  try {
    if (msg.channel.type === ChannelType.GuildText) {
      const channel = msg.channel as TextChannel
      try {
        await channel.setTopic(content)
        msg.react('👍')
      } catch (err) {
        console.error(err)
        await msg.reply(`Sorry mac, topic wasn't set! :rolling_eyes:\n**Here's why:**\n\`\`\`${err.message}\`\`\``)
      }

      const date = getDateFromTopicString(content)
      if (date) {
        await scheduleChannelReminder({ channelId: msg.channelId }, date)
        const reminderMessage = await getReminderMessageByChannelId(msg.channelId)
        msg.author.send(
          `Added reminder for **${channel.name}** at ${dayjs
            .tz(date, 'Europe/Oslo')
            .format('DD.MM.YYYY HH:mm')}.\nCurrent message is:\n> ${reminderMessage}
            \nIf this is incorrect, write \`!cancelReminder\` in **${
              channel.name
            }**.\nCustom message can be set/edited with \`!setReminderMessage <message>\` in the targeted channel. (Do not use emojis from other servers)`,
        )
        msg.react('📅')
      }
    }
  } catch (e) {
    console.error(`Unable to set topic!\n${e.message}`)
  }
}
