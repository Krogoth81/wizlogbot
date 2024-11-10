import { MessageResolver } from 'lib/types'

export const echo: MessageResolver = async (msg, content) => {
  try {
    msg.channel.send(content)
  } catch (err) {
    await msg.reply(`Sorry mac, Can't do that! :rolling_eyes:\n**Here's why:**\n\`\`\`${err.message}\`\`\``)
  }
}
