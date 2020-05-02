const moment = require('moment')

module.exports = async (msg, content, { query }) => {
  if (content.length <= 3) {
    msg.channel.send(`@${msg.author.username} Søkestreng for kort.`)
    return null
  }
  let logItem = await query.search('#wizardry', `${content}`)
  isExecuting = false
  if (!logItem) {
    msg.channel.send(`>>> Searching for: "_${content}_"
      _Ingen treff_  :confused:`
    )
  } else {
    let author = logItem.author.toString()
    let output = logItem.message.toString()
    let reply = ''
    reply += `> Søkte etter: "_${content}_"\n`
    reply += `> Fikk ${logItem.count} treff. Viser første:`
    reply += `<https://wizardry-logs.com?id=${logItem._id.toString()}>\n`
    reply += `[${moment(logItem.createdAt).format('DD-MM-YYYY HH:mm')}]\n`
    reply += `**${author}** wrote:\n`
    reply += `\`\`\`${output}\`\`\``

    msg.channel.send(reply)
  }
}
