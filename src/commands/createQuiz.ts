import {MessageResolver} from '../types/types'

export const createQuiz: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
