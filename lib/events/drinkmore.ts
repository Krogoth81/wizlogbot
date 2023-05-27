import { MessageResolver } from '..'

export const drinkmore: MessageResolver = async (msg) => {
  msg.react('🍻')
}
