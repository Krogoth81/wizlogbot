export default async (msg, content, { query }) => {
  msg.channel.startTyping()
  const response = await query.createQuiz()

  msg.channel.send(`>>> <${response}>`)
  msg.channel.stopTyping()
}
