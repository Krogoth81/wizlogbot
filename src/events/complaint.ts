import {MessageResolver} from '../types/types'

export const complaint: MessageResolver = async (msg) => {
  msg.react('👮')
}
