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

  const { totalCount, users, searchRequests, randomRequests, invites, uptime, complaints } = response
  let up = moment.duration(moment().diff(moment(uptime)))
  let umonths = up.months()
  let udd = up.days()
  let uhh = up.hours()
  let umm = up.minutes()
  let uss = up.seconds()



  let reply = ''
  reply += `Current Status:\n`
  reply += `\`\`\`Lines in database: ${totalCount}\n`
  reply += `Wizards connected: ${users}\n`
  reply += `Number of search requests: ${searchRequests}\n`
  reply += `Number of random requests: ${randomRequests}\n`
  reply += `Number of stored items for !randomklage: ${complaints}\n`
  reply += `I've sent ${invites} invite links\n`
  reply += `Current server uptime: ${udd}d ${uhh}h ${umm}m ${uss}s\n`
  reply += `Current bot uptime: ${dd} ${hh} ${mm} ${ss}\`\`\``

  msg.channel.send(reply)
}
