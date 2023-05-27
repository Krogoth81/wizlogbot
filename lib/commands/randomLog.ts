import { MessageResolver } from '..'

export const randomLog: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
