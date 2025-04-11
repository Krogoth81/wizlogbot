import type { MessageResolver } from 'lib/types'

export const newthing: MessageResolver = async (msg) => {
  msg.channel.send(':satellite:  Ny dings! Ny dings! Ny dings! :satellite:')
}
