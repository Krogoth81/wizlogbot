import type { MessageResolver } from 'lib/types'
import { complaint } from './complaint'
import { drinkmore } from './drinkmore'
import { mountain } from './mountain'
import { newthing } from './newthing'
import { oled } from './oled'
import dayjs from 'dayjs'

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

interface TriggerData {
  user: string
  key: string
  timestamp: number
}

const RATE_LIMIT_TIME_IN_SECONDS = 600
const previousTriggers: Array<TriggerData> = []

export const events: MessageResolver = async (msg, __, context) => {
  const dipsoUser = msg.author?.username?.toLowerCase().includes('dipso')
  const content = msg.content
  const rateLimitTimestamp = dayjs().subtract(RATE_LIMIT_TIME_IN_SECONDS, 'seconds').valueOf()
  const events = eventsList.filter(
    (ev) => msg.content.match(ev.regex) || (dipsoUser && ev.dipsoRegex && msg.content.match(ev.dipsoRegex)),
  )
  for (const event of events) {
    const prevTriggerIndex = previousTriggers.findIndex(pt => pt.user === msg.author.id && pt.key === event.key && rateLimitTimestamp < pt.timestamp)
    if (prevTriggerIndex < 0) {
      event?.run(msg, content, context)
      if (prevTriggerIndex === -1) {
        previousTriggers.push({
          key: event.key,
          timestamp: dayjs().valueOf(),
          user: msg.author.id
        })
      } else {
        previousTriggers[prevTriggerIndex].timestamp = dayjs().valueOf()
      }
    }
  }
}
