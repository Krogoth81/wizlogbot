import { MessageResolver } from '..'
import { complaint } from './complaint'
import { drinkmore } from './drinkmore'
import { mountain } from './mountain'

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
  {
    key: 'fjellet',
    run: mountain,
    regex: /(^|\s)fjellet(\W|$)/i,
  },
]

export const events: MessageResolver = async (msg, __, context) => {
  const content = msg.content
  const event = eventsList.find((ev) => msg.content.match(ev.regex))
  console.log(event)
  event?.run(msg, content, context)
}
