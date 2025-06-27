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
    regex: /(^|\s|\_|\*)drekka(\_|\*|\s|$)/i,
  },
  {
    key: 'fjellet',
    run: mountain,
    regex: /(^|\s|\_|\*)fjellet(\_|\*|\s|$)/i,
  },
  {
    key: 'oled',
    run: oled,
    regex: /(^|\s|\_|\*)oled(\_|\*|\s|$)/i,
  },
  {
    key: 'nydings',
    run: newthing,
    regex: /(^|\s|\_|\*)ny dings(\_|\*|\s|$)/i,
    dipsoRegex: /(^|\s|\_|\*)dings(\_|\*|\s|$)/i,
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
