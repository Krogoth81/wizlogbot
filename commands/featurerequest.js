const moment = require('moment')

module.exports = async (msg, content, { query }) => {

  let response = await query.addRequest(content)
  let reply = '>>>'

  if (response) {
    reply += `Feature request lagt til:`
    reply += `\`\`\`${content}\`\`\``

  } else {
    reply = '> Fikk ikke svar fra API-server. Poke Krog!'
  }



  msg.channel.send(reply)
}
