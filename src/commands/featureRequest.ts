import {MessageResolver} from '../types/types'

export const featureRequest: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
