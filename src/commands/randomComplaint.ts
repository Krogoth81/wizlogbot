import {MessageResolver} from '../types/types'

export const randomComplaint: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
