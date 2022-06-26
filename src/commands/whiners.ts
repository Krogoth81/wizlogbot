import {MessageResolver} from '..'

export const whiners: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
