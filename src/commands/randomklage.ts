import moment from 'moment'

export default async (msg, content, { bot, query }) => {
  const response = await query.randomComplaint()
  if (!response) {
    msg.channel.send('> Fant ikke noen klager. Noe har gått galt.. Kroooog!')
    return null
  }
  const { messageid, channelid } = response
  const channel = await bot.channels.fetch(channelid)

  const fetchMsg = await channel.messages.fetch(messageid)

  const targetMsg = {
    content: fetchMsg.content,
    username: fetchMsg.author.username,
    timestamp: fetchMsg.createdTimestamp,
    id: fetchMsg.id,
    channelname: fetchMsg.channel.name,
  }

  const beforeRes = await channel.messages.fetch({ before: messageid, limit: 5 })
  const before = beforeRes
    .map((bMsg) => {
      const beforeMsg = {
        content: bMsg.content,
        username: bMsg.author.username,
        timestamp: bMsg.createdTimestamp,
      }
      return beforeMsg
    })
    .sort((o1, o2) => o1.timestamp - o2.timestamp)

  const timestampString = moment(targetMsg.timestamp).format('DD-MM-YYYY (HH:mm)')

  let reply = ''
  reply += `__En klage ble registrert av **${targetMsg.username}** i *#${targetMsg.channelname}* - ${timestampString}__\n`
  before.forEach((m) => {
    reply += `**${m.username}** (${moment(m.timestamp).format('HH:mm')}):\n> ${m.content}\n`
  })
  reply += `**${targetMsg.username}** (${moment(targetMsg.timestamp).format('HH:mm')}):\n> ${
    targetMsg.content
  }`
  msg.channel.send(reply)
}
