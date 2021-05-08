import moment from 'moment'

export default async (msg, content, { query, bootTime }) => {
  const dur = moment.duration(moment().diff(bootTime))
  const dd = `${dur.days()}d`
  const hh = `${dur.hours()}h`
  const mm = `${dur.minutes()}m`
  const ss = `${dur.seconds()}s`

  const response = await query.getStatus()
  if (!response) {
    msg.channel.send('Fikk ikke svar fra API. Krooooog!?')
    return null
  }

  const {
    totalCount,
    users,
    searchRequests,
    randomRequests,
    invites,
    uptime,
    complaints,
  } = response
  const up = moment.duration(moment().diff(moment(uptime)))
  const udd = up.days()
  const uhh = up.hours()
  const umm = up.minutes()
  const uss = up.seconds()

  let reply = ''
  reply += 'Current Status:\n'
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
