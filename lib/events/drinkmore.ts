import type { MessageResolver } from 'lib/types'

export const drinkmore: MessageResolver = async (msg) => {
  msg.react('🍻')
}
