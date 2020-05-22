module.exports = async (msg, { query }) => {
  msg.react('👮')
  query.registerComplaint({ channelid: msg.channel.id, messageid: msg.id })
}
