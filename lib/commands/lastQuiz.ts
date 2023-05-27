import { MessageResolver } from '..'

export const lastQuiz: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
