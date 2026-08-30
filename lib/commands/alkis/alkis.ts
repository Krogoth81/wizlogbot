import dayjs, { type Dayjs } from 'dayjs'
import { config } from 'lib/config'
import type { MessageResolver } from 'lib/types'
import type { VinmonopolInfo } from './types'

const df = 'YYYY-MM-DD'
const dfPlus = 'YYYY-MM-DD HH:mm'
const dfDay = 'dddd HH:mm'

// Vinmonopolet reports opening hours as Norwegian wall-clock times ("10:00"),
// with no zone attached. They have to be anchored to Norway explicitly rather
// than to whatever zone the process happens to run in: the VPS runs UTC, so
// `dayjs('... 10:00', format)` produced 10:00 UTC — putting every open/close
// comparison an hour out in winter and two in summer. The formatted output
// still read "10:00" either way, which is what made this so hard to spot: only
// the Åpent/Stengt status and the isAfter/isBefore checks were ever wrong.
const TZ = 'Europe/Oslo'

// NB: dayjs.tz must be given all three arguments here. The two-argument form
// dayjs.tz(input, format) treats the second argument as a timezone and throws
// "Invalid time zone specified".
const parseInOslo = (date: string, time: string) => dayjs.tz(`${date} ${time}`, dfPlus, TZ)

const fetchData = async (customName?: string) => {
  const name = customName || 'Trondheim, Valentinlyst'

  let url = 'https://apis.vinmonopolet.no/stores/v0/details?storeNameContains='
  // Every space, not just the first — multi-word store names were mangled.
  url += name.replace(/ /g, '_')

  try {
    const res = await fetch(url, {
      headers: {
        'Ocp-Apim-Subscription-Key': config.vinmonopolKey,
      },
    })
    return (await res.json()) as Array<VinmonopolInfo>
  } catch {
    return []
  }
}

export const alcoholic: MessageResolver = async (msg, content) => {
  const fetchResult = await fetchData(content)
  const data = fetchResult?.[0]

  if (!data) {
    await msg.channel.send(`Fant ingen treff på ${content}`)
    return
  }

  const {
    openingHours: { regularHours, exceptionHours },
  } = data

  const now = dayjs().tz(TZ)

  // Look the day up by name instead of trusting the array to be Monday-first.
  const regularByDay = new Map(regularHours.map((rh) => [rh.dayOfTheWeek as string, rh]))

  const hours = Array.from({ length: 7 }, (_, i) => {
    const day = now.add(i, 'day')
    const date = day.format(df)
    const ex = exceptionHours.find((eh) => eh.date === date)
    // An exception for the date replaces that day's regular hours entirely.
    const source = ex ?? regularByDay.get(day.locale('en').format('dddd'))
    // The API's own `closed` flag is authoritative; it can be set even when
    // opening/closing times are still present.
    const isClosedDay = !source || source.closed || !source.openingTime || !source.closingTime

    const open = isClosedDay ? null : parseInOslo(date, source.openingTime)
    const close = isClosedDay ? null : parseInOslo(date, source.closingTime)

    return {
      open,
      close,
      ex,
      isOpen: !!open && !!close && now.isAfter(open) && now.isBefore(close),
      wasOpen: !!close && now.isAfter(close),
    }
  })

  const today = hours[0]
  const next = hours.find((o) => o.open?.isAfter(now))
  let reply = `Polsalg - ${now.format(dfPlus)} - ${data.storeName}\n`

  const capitalize = (str: string) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`

  const hoursIncludeExeptions = !!hours.find((h) => !!h.ex)
  if (hoursIncludeExeptions) {
    reply += '**Unntak i åpningstider:**\n'
    for (const h of hours) {
      if (h.ex) {
        const daystring = dayjs.tz(h.ex.date, df, TZ).format('dddd')
        reply += `> [${capitalize(daystring)} ${h.ex.date}]:\n>   *${h.ex.message || 'Ingen forklaring oppgitt'}*${
          h.ex.openingTime ? `\n>   (${h.ex.openingTime} - ${h.ex.closingTime})` : ''
        }\n`
      }
    }
    reply += '\n'
  }
  reply += `Status: ${today.isOpen ? '**Åpent**' : '**Stengt**'}\n\n`

  const formatDate = (date: Dayjs) => capitalize(date.format(dfDay))

  const to = today.open
  const tc = today.close
  // `next` is undefined if nothing in the coming week opens again (every day
  // closed, or a store being wound down). Previously this threw.
  const no = next?.open
  const nc = next?.close
  const nextOpening = no && nc ? `${formatDate(no)}` : null

  if (!to) {
    reply += 'Stengt i dag.\n'
    reply += nextOpening ? `Neste åpning: (${nextOpening})\n` : 'Fant ingen kommende åpningstider.\n'
  } else if (to.isAfter(now)) {
    reply += `Åpner (${formatDate(to)})\n`
    reply += `Stenger (${formatDate(tc)})\n`
  } else if (today.isOpen) {
    reply += `Åpnet ${formatDate(to)}\n`
    reply += `Stenger ${formatDate(tc)}\n`
  } else if (today.wasOpen) {
    reply += `Stengte ${formatDate(tc)}\n\n`
    reply += nextOpening
      ? `Åpner igjen ${nextOpening}\nOg stenger ${formatDate(nc)}`
      : 'Fant ingen kommende åpningstider.'
  }

  try {
    await msg.channel.send(reply)
  } catch (error) {
    console.error(new Date(), 'alkis reply failed', error)
  }
}
