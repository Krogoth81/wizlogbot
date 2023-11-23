import schedule from 'node-schedule'
import dayjs from 'dayjs'
import { ChannelType, TextChannel } from 'discord.js'
import { MessageResolver } from 'lib/types'
import { nanoid } from 'nanoid'
import util from 'util'

const jobs: Array<{ id: string; job: schedule.Job; channelId: string }> = []

export const setTopic: MessageResolver = async (msg, content) => {
  try {
    if (msg.channel.type === ChannelType.GuildText) {
      const channel = msg.channel as TextChannel
      try {
        await channel.setTopic(content)
        msg.react('👍')
      } catch (err) {
        console.error(err)
        msg.reply(`Sorry mac, topic wasn't set! :rolling_eyes:\n**Here's why:**\n\`\`\`${err.message}\`\`\``)
      }

      if (msg.channel.name.toLocaleLowerCase() === 'dragongate') {
        const regex = /\s(\d{1,2}\/\d{1,2})(?:\s|$)/g
        const match = content.match(regex)

        if (match?.[0]) {
          if (jobs.find((j) => j.channelId === msg.channelId)) {
            jobs.splice(
              jobs.findIndex((j) => j.channelId === msg.channelId),
              1,
            )
          }

          const [day, month] = match[0].trim().split('/')
          const nextYear = dayjs().month() < Number(month) - 1
          const date = dayjs()
            .startOf('day')
            .set('date', Number(day))
            .set('month', Number(month) - 1)
            .set('hour', 11)
            .set('year', nextYear ? dayjs().year() + 1 : dayjs().year())
            .toDate()
          const id = nanoid(10)
          const job = schedule.scheduleJob(date, () => {
            msg.channel.send(
              `${
                content.split(' ')[0]
              } Husk møte i kveld! :comet::smiley_cat:  :squid::person_raising_hand::squid:  :shield::man_beard:  :dagger::smirk_cat:`,
            )
          })
          if (job) {
            msg.react('📅')
            jobs.push({ id, job, channelId: msg.channelId })
            console.log('Job added:', util.inspect(job, false, 5, true))
          }
        }
      }
    }
  } catch {
    console.error('Unable to set topic!')
  }
}
