import { MessageResolver } from 'lib/types'

export const lastQuiz: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
