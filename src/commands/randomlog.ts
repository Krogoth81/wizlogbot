import moment from 'moment'

export default async (msg, content, { query }) => {
  const response = await query.random()
  let reply = ''

  if (response) {
    const { item } = response
    const author = item.author.toString()
    const output = item.message.toString()
    reply += `> <https://wizardry-logs.com?id=${item._id.toString()}>\n`
    reply += `${moment(item.createdAt).format('DD-MM-YYYY HH:mm')}\n`
    reply += `**${author}** wrote:\n`
    reply += `\`\`\`${output}\`\`\``
  } else {
    reply = '> Finner ikke noe verdt å vise. Noe må ha gått galt. Poke Krog!'
  }

  msg.channel.send(reply)
}
