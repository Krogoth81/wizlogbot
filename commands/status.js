const moment = require('moment')

module.exports = async (msg, content, { query, bootTime }) => {
  let dur = moment.duration(moment().diff(bootTime))
  let months = `${dur.months()}months`
  let dd = `${dur.days()}d`
  let hh = `${dur.hours()}h`
  let mm = `${dur.minutes()}m`
  let ss = `${dur.seconds()}s`

  let response = await query.getStatus()
  if (!response) {
    msg.channel.send('Fikk ikke svar fra API. Krooooog!?')
    return null
  }

  const { totalCount, users, searchRequests, randomRequests, invites, uptime } = response
  let up = moment.duration(moment().diff(uptime))
  let umonths = `${up.months()}months`
  let udd = `${up.days()}d`
  let uhh = `${up.hours()}h`
  let umm = `${up.minutes()}m`
  let uss = `${up.seconds()}s`

  let reply = ''
  reply += `Current Status:\n`
  reply += `\`\`\`Lines in database: ${totalCount}\n`
  reply += `Wizards connected: ${users}\n`
  reply += `Number of search requests: ${searchRequests}\n`
  reply += `Number of random requests: ${randomRequests}\n`
  reply += `I've sent ${invites} invite links\n`
  reply += `Current server uptime: ${udd} ${uhh} ${umm} ${uss}\n`
  reply += `Current bot uptime: ${dd} ${hh} ${mm} ${ss}\`\`\``

  msg.channel.send(reply)
}
