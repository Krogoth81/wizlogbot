import { MessageResolver } from 'lib/types'

export const echome: MessageResolver = async (msg, content) => {
  try {
    msg.reply(`Echoing:\n${content}`)
  } catch (err) {
    await msg.reply(`Sorry mac, Can't do that! :rolling_eyes:\n**Here's why:**\n\`\`\`${err.message}\`\`\``)
  }
}
