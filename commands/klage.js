const moment = require('moment')
const _ = require('lodash')

module.exports = async (msg, content, { query }) => {
  msg.react('👮')
  query.registerComplaint({ channelid: msg.channel.id, messageid: msg.id })
}
