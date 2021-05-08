export default async (msg, { query }) => {
  msg.react('👮')
  query.registerComplaint({ channelid: msg.channel.id, messageid: msg.id })
}
