import {MessageResolver} from '..'

export const randomComplaint: MessageResolver = async (msg) => {
  msg.channel.send('Command not available')
}
