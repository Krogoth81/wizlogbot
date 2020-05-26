const moment = require('moment')

module.exports = async (msg, content, { query }) => {
  msg.channel.startTyping()
  let response = await query.createQuiz()

  msg.channel.send(`>>> <${response}>`)
  msg.channel.stopTyping()

}
