import type { MessageResolver } from 'lib/types'

export const mountain: MessageResolver = async (msg) => {
  msg.channel.send('🎵 Oppå fjellet, oppå fjellet! 🎵')
}
