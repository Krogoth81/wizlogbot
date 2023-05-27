import { MessageResolver } from 'lib/types'

export const ping: MessageResolver = async (msg) => {
  msg.channel.send('PONG!')
}
