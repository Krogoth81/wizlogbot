import type { MessageResolver } from 'lib/types'

export const randomComplaint: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
