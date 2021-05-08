import klage from './klage'
import drekkameir from './drekkameir'

const events = [
  {
    name: 'klage',
    trigger: klage,
    regex: /^!klage/i,
  },
  {
    name: 'drekkameir',
    trigger: drekkameir,
    regex: /(^|\s)drekka(\s|$)/i,
  },
]

export default (msg, context) => {
  events.forEach((e) => {
    if (msg.content.match(e.regex)) {
      e.trigger(msg, context)
    }
  })
}
