import { MessageResolver } from 'lib/types'

export const complaint: MessageResolver = async (msg) => {
  msg.react('👮')
}
