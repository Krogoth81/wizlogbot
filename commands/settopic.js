const moment = require('moment')

module.exports = async (msg, content, { query, bootTime }) => {
  try {
    const res = await msg.channel.setTopic(content)
    if (res) msg.react('👍')
  } catch (e) {  }
}
