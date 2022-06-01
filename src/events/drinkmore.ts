import {MessageResolver} from '../types/types'

export const drinkmore: MessageResolver = async (msg) => {
  msg.react('🍻')
}
