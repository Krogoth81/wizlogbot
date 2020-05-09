const moment = require('moment')

module.exports = async (msg, content, { query }) => {

  let response = await query.addRequest(content)
  let reply = ''

  if (response) {
    reply += `*Feature request lagt til:*\n`
    reply += `> ${content}\n`
    if (!_.isEmpty(response)) {
      let prev = ''
      let done = []
      let notDone = []
      response.forEach(o => {
        if (o.resolvedAt) done.push(o)
        else notDone.push(o)
      })

      if (!_.isEmpty(notDone)) prev += 'Todo:\n'
      notDone.forEach((item, i) => {
        prev += `[${moment(item.createdAt).format('DD-MM-YYYY HH:mm')}]: ${item.content}\n`
      })

      if (!_.isEmpty(done)) prev += 'Done:\n'
      done.forEach((item, i) => {
        prev += `[${moment(item.createdAt).format('DD-MM-YYYY HH:mm')}]: ${item.content}\n`
      })

      reply += `\`\`\`${prev}\`\`\``
    }

  } else {
    reply = '> Fikk ikke svar fra API-server. Poke Krog!'
  }



  msg.channel.send(reply)
}
