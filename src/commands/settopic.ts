export default async (msg, content, {}) => {
  try {
    const res = await msg.channel.setTopic(content)
    if (res) msg.react('👍')
  } catch (e) {}
}
