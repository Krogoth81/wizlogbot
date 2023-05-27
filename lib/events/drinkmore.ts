import { MessageResolver } from 'lib/types'

export const drinkmore: MessageResolver = async (msg) => {
  msg.react('🍻')
}
