import { MessageResolver } from '..'

export const mountain: MessageResolver = async (msg) => {
  msg.channel.send('🎵 Oppå fjellet, oppå fjellet! 🎵')
}
