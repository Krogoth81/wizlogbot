import {MessageResolver} from '../types/types'

export const ping: MessageResolver = async (msg) => {
  msg.channel.send('PONG!')
}
