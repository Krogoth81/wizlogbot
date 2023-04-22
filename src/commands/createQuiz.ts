import { MessageResolver } from '..'

export const createQuiz: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
