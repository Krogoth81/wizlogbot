const klage = require('./klage')

const events = [
  {
    name: 'klage',
    trigger: require('./klage'),
    regex: /^!klage/i,
  },
  {
    name: 'drekkameir',
    trigger: require('./drekkameir'),
    regex: /(^|\s)drekka(\s|$)/i,
  }
]

module.exports = (msg, context) => {
  events.forEach(e => {
    if (msg.content.match(e.regex)) {
      e.trigger(msg, context)
    }
  })
}
