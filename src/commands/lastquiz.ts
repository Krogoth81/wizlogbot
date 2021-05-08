export default async (msg, content, { query }) => {
  msg.channel.startTyping()
  const response = await query.lastQuiz()
  msg.channel.send(`>>> <${response}>`)
  msg.channel.stopTyping()
}
