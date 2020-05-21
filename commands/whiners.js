const moment = require('moment')

module.exports = async (msg, content, { bot, query }) => {
  msg.channel.startTyping()
  let response = await query.allComplaints()
  if (!response) {
    msg.channel.send("> Fant ikke noen klager. Noe har gått galt.. Kroooog!")
    return null
  }

  const users = {}
  for (let i = 0; i < response.length; i++) {
    let item = response[i]
    const { messageid, channelid } = item
    let channel = await bot.channels.fetch(channelid)
    const fetchMsg = await channel.messages.fetch(messageid)
    const username = fetchMsg.author.username
    if (!users[username]) users[username] = 1
    else users[username]++
  }

  let arr = Object.keys(users).map(key => {
    return {
      username: key,
      score: users[key]
    }
  }).sort((o1, o2) => o2.score - o1.score)

  let reply = '**Topp 10 Scoreboard - Klager**\n'
  arr.forEach((wizard, i) => {
    if (i < 10) reply += `#${i+1}: *${wizard.username}* - ${wizard.score}\n`
  })
  msg.channel.send(reply)
  msg.channel.stopTyping()
}
