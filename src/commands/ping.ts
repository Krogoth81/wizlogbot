import {MessageResolver} from '..'

export const ping: MessageResolver = async (msg) => {
  msg.channel.send('PONG!')
}
