import { MessageResolver } from 'lib/types'

export const whiners: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
