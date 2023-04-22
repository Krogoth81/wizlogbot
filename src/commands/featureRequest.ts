import { MessageResolver } from '..'
export const featureRequest: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
