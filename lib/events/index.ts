import { MessageResolver } from 'lib/types'
import { complaint } from './complaint'
import { drinkmore } from './drinkmore'
import { mountain } from './mountain'
import { newthing } from './newthing'

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
    regex: /(^|\s)drekka(\s|$)/i,
  },
  {
    key: 'fjellet',
    run: mountain,
    regex: /(^|\s)fjellet(\W|$)/i,
  },
  {
    key: 'nydings',
    run: newthing,
    regex: /(^|\s)ny dings(\W|$)/i,
    dipsoRegex: /(^|\s)dings(\W|$)/i,
  },
]

export const events: MessageResolver = async (msg, __, context) => {
  const dipsoUser = msg.author?.username?.toLowerCase().includes('dipso')
  const content = msg.content
  const event = eventsList.find((ev) => msg.content.match(ev.regex) || (dipsoUser && msg.content.match(ev.dipsoRegex)))

  event?.run(msg, content, context)
}
