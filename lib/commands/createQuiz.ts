import type { MessageResolver } from 'lib/types'

export const createQuiz: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
