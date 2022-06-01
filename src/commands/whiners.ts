import {MessageResolver} from '../types/types'

export const whiners: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
