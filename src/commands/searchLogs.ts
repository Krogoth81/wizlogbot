import {MessageResolver} from '../types/types'

export const searchLogs: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
