import {MessageResolver} from '../types/types'

export const randomLog: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
