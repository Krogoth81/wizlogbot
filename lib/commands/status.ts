import type { MessageResolver } from 'lib/types'

export const status: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
