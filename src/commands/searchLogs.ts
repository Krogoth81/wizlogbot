import { MessageResolver } from '..'

export const searchLogs: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
