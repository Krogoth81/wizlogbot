import {MessageResolver} from '..'

export const status: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
