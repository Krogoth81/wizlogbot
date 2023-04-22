import { MessageResolver } from '..'
import { complaint } from './complaint'
import { drinkmore } from './drinkmore'

interface TextEvent {
  key: string
  run: MessageResolver
  regex: RegExp
}

const eventsList: Array<TextEvent> = [
  {
    key: 'klage',
    run: complaint,
    regex: /^!klage/i,
  },
  {
    key: 'drekkameir',
    run: drinkmore,
    regex: /(^|\s)drekka(\s|$)/i,
  },
]

export const events: MessageResolver = async (msg, __, context) => {
  const content = msg.content
  const event = eventsList.find((ev) => msg.content.match(ev.regex))
  event?.run(msg, content, context)
}
