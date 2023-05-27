import { MessageResolver } from 'lib/types'

export const randomLog: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
