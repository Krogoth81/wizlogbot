import dayjs from 'dayjs'
import type { MessageResolver } from 'lib/types'

// The VPS runs UTC, so a bare dayjs() lands in the wrong week for the couple of
// hours around midnight Oslo time — most visibly on a Sunday night, when the
// week number is about to roll over.
const TZ = 'Europe/Oslo'

export const ukenr: MessageResolver = async (msg) => {
  const now = dayjs().tz(TZ)
  await msg.channel.send(`Uke ${now.isoWeek()} (${now.format('YYYY-MM-DD')})`)
}
