import { MessageResolver } from 'lib/types'
export const featureRequest: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
