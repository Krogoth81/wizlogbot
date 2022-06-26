import {TextChannel} from 'discord.js'
import {MessageResolver} from '..'

export const setTopic: MessageResolver = async (msg, content) => {
  try {
    if (msg.channel.isText) {
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
        msg.reply(
          `HALP! I'm being rate limited. The topic change will happen, it might just take a few minutes!`
        )
      }
    }
  } catch (e) {
    console.error('Unable to set topic!')
  }
}
