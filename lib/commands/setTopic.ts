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
      channel
        .setTopic(content)
        .then(() => {
          msg.react('👍')
        })
        .catch((err) => {
          console.error(err)
        })

      const rateLimited = await new Promise((resolve) => {
        setTimeout(() => {
          const topic = channel.topic
          resolve(topic !== content)
        }, 2000)
      })

      if (rateLimited) {
        msg.reply(`HALP! I'm being rate limited. The topic change will happen, it might just take a few minutes!`)
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
          const date = dayjs()
            .set('date', Number(day))
            .set('month', Number(month) - 1)
            .set('hour', 12)
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
