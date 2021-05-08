export default async (msg, content, { bot, query }) => {
  msg.channel.startTyping()

  try {
    const response = await query.allComplaints()
    if (!response) {
      msg.channel.send('> Fant ikke noen klager. Noe har gått galt.. Kroooog!')
      return null
    }
    const uniqueChannels = [...new Set(response.map((o) => o.channelid))]
    const channelArray = await Promise.all(
      uniqueChannels.map(
        (o) =>
          new Promise(async (resolve) => {
            try {
              const channel = await bot.channels.fetch(o)
              resolve({ id: o, channel })
              return
            } catch (e) {
              console.log(new Date(), e.message)
              resolve({ id: o, channel: null })
            }
          })
      )
    )
    const channels = channelArray.reduce((acc: object, o: any) => {
      return ({ ...acc, [o.id]: o.channel })
    }, {})
    const whines: any[] = await Promise.all(
      response.map(
        ({ messageid, channelid }) =>
          new Promise(async (resolve) => {
            let message = null
            if (!channels[channelid]) return resolve(null)
            try {
              const channel = channels[channelid]
              message = await channel.messages.fetch(messageid)
            } catch (e) {
              console.log(new Date(), 'Error"', e.message)
            }
            resolve(message)
          })
      )
    )

    const users = {}
    for (const whineMessage of whines) {
      if (!whineMessage) continue
      const { username } = whineMessage.author
      if (!users[username]) users[username] = 1
      else users[username]++
    }

    const arr = Object.keys(users)
      .map((key) => ({
        username: key,
        score: users[key],
      }))
      .sort((o1, o2) => o2.score - o1.score)

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
