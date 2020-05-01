const moment = require('moment')

module.exports = (msg, content, { bootTime }) => {
  msg.channel.send(`
    >>> Current Status:\`\`\`
    Lines in database: MANY!
    Wizards connected: Not that many
    Accurate status report: Nope! This is hard coded!
    Current uptime: ${moment().diff(moment(bootTime), 'days')}d, ${moment().diff(moment(bootTime), 'hours')}h, ${moment().diff(moment(bootTime), 'minutes')}m, ${moment().diff(moment(bootTime), 'seconds')}s\`\`\`
    `)
}
