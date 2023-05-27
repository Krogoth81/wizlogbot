import dayjs, { Dayjs } from 'dayjs'
import { MessageResolver } from 'lib/types'
import { config } from 'lib/config'
import { VinmonopolInfo } from './types'

const df = 'YYYY-MM-DD'
const dfPlus = 'YYYY-MM-DD HH:mm'
const dfDay = 'dddd HH:mm'

const fetchData = async (customName?: string) => {
  const name = customName || 'Trondheim, Valentinlyst'

  let url = 'https://apis.vinmonopolet.no/stores/v0/details?storeNameContains='
  url += name.replace(' ', '_')

  const res = await fetch(url, {
    headers: {
      'Ocp-Apim-Subscription-Key': config.vinmonopolKey,
    },
  })
  try {
    return (await res.json()) as Array<VinmonopolInfo>
  } catch {
    return []
  }
}

export const alcoholic: MessageResolver = async (msg, content) => {
  const fetchResult = await fetchData(content)
  const data = fetchResult?.[0]

  if (!data) {
    msg.channel.send(`Fant ingen treff på ${content}`)
    return
  }

  const {
    openingHours: { regularHours, exceptionHours },
  } = data

  const now = dayjs()

  const dayIndex = now.day() - 1 < 0 ? 6 : now.day() - 1

  const getDayjsFromTime = (day: Dayjs, time: string) =>
    time ? dayjs(`${day.format('YYYY-MM-DD')} ${time}`, dfPlus).tz('Europe/Oslo') : null

  const hours = regularHours.map((_, i) => {
    const rh = regularHours[(dayIndex + i) % regularHours.length]
    const day = now.clone().add(i, 'days')
    const ex = exceptionHours.find((eh) => eh.date === day.format('YYYY-MM-DD'))
    const open = getDayjsFromTime(day, ex ? ex.openingTime : rh.openingTime)
    const close = getDayjsFromTime(day, ex ? ex.closingTime : rh.closingTime)
    return {
      open,
      close,
      ex,
      isOpen: open && now.isAfter(open) && close && now.isBefore(close),
      wasOpen: close && now.isAfter(close),
    }
  })

  const today = hours[0]
  const next = hours.find((o) => o.open?.isAfter(now))
  let reply = `Polsalg - ${now.format(dfPlus)} - ${data.storeName}\n`

  const capitalize = (str: string) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`

  const hoursIncludeExeptions = !!hours.find((h) => !!h.ex)
  if (hoursIncludeExeptions) {
    reply += '**Unntak i åpningstider:**\n'
    hours.forEach((h) => {
      if (h.ex) {
        const daystring = dayjs(h.ex.date, df).format('dddd')
        reply += `> [${capitalize(daystring)} ${h.ex.date}]: *${h.ex.message || 'Ingen forklaring oppgitt'}*\n`
      }
    })
    reply += '\n'
  }
  reply += `Status: ${today.isOpen ? '**Åpent**' : '**Stengt**'}\n\n`

  if (!today.open) {
    reply += 'Stengt i dag.\n'
    reply += `Neste åpning: ${next.open.from(now)} (${capitalize(next.open.format(dfDay))})\n`
  } else if (today.open.isAfter(now)) {
    reply += `Åpner ${today.open.from(now)} (${capitalize(today.open.format(dfDay))})\n`
    reply += `Stenger ${today.close.from(now)} (${capitalize(today.close.format(dfDay))})\n`
  } else if (today.isOpen) {
    reply += `Åpnet for ${today.open.from(now)} (${capitalize(today.open.format(dfDay))})\n`
    reply += `Stenger ${today.close.from(now)} (${capitalize(today.close.format(dfDay))})\n`
  } else if (today.wasOpen) {
    reply += `Stengte for ${today.close.from(now)} (${capitalize(today.close.format(dfDay))})\n\n`
    reply += `Åpner igjen ${next.close.from(now)} (${capitalize(next.open.format(dfDay))})\n`
    reply += `Og stenger ${next.close.from(now)} (${capitalize(next.close.format(dfDay))})`
  }

  msg.channel.send(reply)
}
