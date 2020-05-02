const moment = require('moment')

module.exports = async (msg, content, { query }) => {
  if (content.length <= 3) {
    msg.channel.send(`@${msg.author.username} Søkestreng for kort.`)
    return null
  }
  let response = await query.search('#wizardry', `${content}`)
  isExecuting = false
  if (!response || response.count === 0) {
    msg.channel.send(`>>> Searching for: "_${content}_"
      _Ingen treff_  :confused:`
    )
  } else {
    let logItem = response.items[0]
    let author = logItem.author.toString()
    let output = logItem.message.toString()
    let reply = ''
    reply += `> Søkte etter: "_${content}_"\n`
    reply += `> Fikk ${response.count} treff. Viser første:\n`
    reply += `<https://wizardry-logs.com?id=${logItem._id.toString()}>\n`
    reply += `[${moment(logItem.createdAt).format('DD-MM-YYYY HH:mm')}]\n`
    reply += `**${author}** wrote:\n`
    reply += `\`\`\`${output}\`\`\``

    msg.channel.send(reply)
  }
}
