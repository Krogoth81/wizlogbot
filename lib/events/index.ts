import type { MessageResolver } from 'lib/types'
import { complaint } from './complaint'
import { drinkmore } from './drinkmore'
import { mountain } from './mountain'
import { newthing } from './newthing'
import { oled } from './oled'

interface TextEvent {
  key: string
  run: MessageResolver
  regex: RegExp
  dipsoRegex?: RegExp
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
    regex: /(^|[^a-zA-Z0-9]+)drekka\smeir($|[^a-zA-Z0-9]+)/i,
  },
  {
    key: 'fjellet',
    run: mountain,
    regex: /(^|[^a-zA-Z0-9]+)fjellet($|[^a-zA-Z0-9]+)/i,
  },
  {
    key: 'oled',
    run: oled,
    regex: /(^|[^a-zA-Z0-9]+)oled($|[^a-zA-Z0-9]+)/i,
  },
  {
    key: 'nydings',
    run: newthing,
    regex: /(^|[^a-zA-Z0-9]+)ny\sdings($|[^a-zA-Z0-9]+)/i,
    dipsoRegex: /(^|[^a-zA-Z0-9]+)dings($|[^a-zA-Z0-9]+)/i,
  },
]

export const events: MessageResolver = async (msg, __, context) => {
  const dipsoUser = msg.author?.username?.toLowerCase().includes('dipso')
  const content = msg.content
  const events = eventsList.filter(
    (ev) => msg.content.match(ev.regex) || (dipsoUser && ev.dipsoRegex && msg.content.match(ev.dipsoRegex)),
  )
  for (const event of events) {
    event?.run(msg, content, context)
  }
}
