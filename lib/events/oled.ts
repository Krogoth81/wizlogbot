import type { MessageResolver } from 'lib/types'

export const oled: MessageResolver = async (msg) => {
  msg.channel.send('🎵📺 OLEEEEED OLED OLED OLEEED! 📺🎵')
}
