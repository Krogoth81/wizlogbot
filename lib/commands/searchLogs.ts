import type { MessageResolver } from 'lib/types'

export const searchLogs: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
