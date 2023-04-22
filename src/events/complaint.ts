import { MessageResolver } from '..'

export const complaint: MessageResolver = async (msg) => {
  msg.react('👮')
}
