import {MessageResolver} from '../types/types'

export const lastQuiz: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
