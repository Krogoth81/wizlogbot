import {TextChannel} from 'discord.js'
import {MessageResolver} from '../types/types'

export const setTopic: MessageResolver = async (msg) => {
  try {
    if (msg.channel.isText) {
      const channel = msg.channel as TextChannel
      const res = channel.setTopic(msg.content)
      if (res) {
        msg.react('👍')
      }
    }
  } catch (e) {
    console.error('Unable to set topic!')
  }
}
