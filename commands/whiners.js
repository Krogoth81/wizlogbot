const moment = require('moment')

module.exports = async (msg, content, { bot, query }) => {
  msg.channel.startTyping()
  let response = await query.allComplaints()
  if (!response) {
    msg.channel.send("> Fant ikke noen klager. Noe har gått galt.. Kroooog!")
    return null
  }
  try {
    const users = {}
    console.log('Found', response.length, 'complains')
    const whines = await Promise.all(
      response.map(({ messageid, channelid }) => {
        console.log('checking', messageid, channelid)
        return new Promise(async resolve => {
          let message = null
          try { 
            const channel = await bot.channels.fetch(channelid)
            console.log('channel', channel)
            message = await channel.messages.fetch(messageid)
            console.log('message? -> ', !!message)
          } catch (e) { 
            console.log(e.message)
          }
          resolve(message)
        })
      })
    )

    for (let whineMessage of whines) {
      if (!whineMessage) continue
      const username = whineMessage.author.username
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
      if (i < 10) reply += `#${i + 1}: *${wizard.username}* - ${wizard.score}\n`
    })
    msg.channel.send(reply)
  } catch (e) {
    console.log(e)
    msg.channel.send(`Å nei! En feil oppsto! Krog?\n${e.message}`)
  } finally {
    msg.channel.stopTyping()
  }
}
