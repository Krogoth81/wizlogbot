import dayjs from 'dayjs'
import {MessageResolver} from '..'

export const alcoholic: MessageResolver = async (msg, content, {config}) => {
  const name = content || 'Trondheim, Valentinlyst'

  let url = 'https://apis.vinmonopolet.no/stores/v0/details?storeNameContains='
  url += name.replace(' ', '_')

  const res = await fetch(url, {
    headers: {
      'Ocp-Apim-Subscription-Key': config.vinmonopolKey,
    },
  })
  let list = null
  try {
    list = await res.json()
  } catch (e) {}

  if (list?.length <= 0) {
    msg.channel.send(`Fant ingen treff på ${content}`)
    return null
  }

  const data = list[0]
  if (!data.openingHours) {
    console.log(data)
    msg.channel.send('Ute til lunch!')
    return
  }
  const {
    openingHours: {regularHours, exceptionHours},
  } = data

  const now = dayjs()

  const dayIndex = now.day() - 1 < 0 ? 6 : now.day() - 1

  let openingToday = regularHours[dayIndex].openingTime
  let closingToday = regularHours[dayIndex].closingTime
  let nextOpening = null
  let nextClosing = null
  let next = now.clone()
  let loops = 0
  const todayExceptionMessage = []
  const nextExceptionMessage = []

  exceptionHours.forEach((eh) => {
    if (now.format('YYYY-MM-DD') === eh.date) {
      todayExceptionMessage.push(`[${eh.date}]: ${eh.message}`)
      openingToday = eh.openingTime
      closingToday = eh.closingTime
    }
  })

  while (!nextOpening && loops < 30) {
    next = next.add(1, 'days')
    const nextDayIndex = next.day() - 1 < 0 ? 6 : next.day() - 1
    nextOpening = regularHours[nextDayIndex].openingTime
    nextClosing = regularHours[nextDayIndex].closingTime
    if (exceptionHours?.length > 0) {
      exceptionHours.forEach((eh) => {
        if (next.format('YYYY-MM-DD') === eh.date) {
          nextExceptionMessage.push(`[${eh.date}]: ${eh.message}`)
          nextOpening = eh.openingTime
          nextClosing = eh.closingTime
        }
      })
    }
    loops++
  }

  const df = 'YYYY-MM-DD'
  const dfPlus = 'YYYY-MM-DD HH:mm'
  const dfDay = 'dddd HH:mm'

  const momOpenToday = openingToday
    ? dayjs(`${now.format(df)} ${openingToday}`, `${df} HH:mm`)
    : null
  const momCloseToday = closingToday
    ? dayjs(`${now.format(df)} ${closingToday}`, `${df} HH:mm`)
    : null
  const momOpenNext = dayjs(`${next.format(df)} ${nextOpening}`, `${df} HH:mm`)
  const momCloseNext = dayjs(`${next.format(df)} ${nextClosing}`, `${df} HH:mm`)

  const otf = momOpenToday ? momOpenToday.format(dfDay) : 'N/A'
  const ctf = momCloseToday ? momCloseToday.format(dfDay) : 'N/A'
  const onf = momOpenNext ? momOpenNext.format(dfDay) : 'N/A'
  const cnf = momCloseNext ? momCloseNext.format(dfDay) : 'N/A'

  const otNow = momOpenToday ? momOpenToday.from(now) : 'N/A'
  const ctNow = momCloseToday ? momCloseToday.from(now) : 'N/A'
  const onNow = momOpenNext ? momOpenNext.from(now) : 'N/A'
  const cnNow = momCloseNext ? momCloseNext.from(now) : 'N/A'

  let reply = `Polsalg - ${now.format(dfPlus)} - ${data.storeName}\n`
  reply += `Status: ${
    now.isAfter(momOpenToday) && now.isBefore(momCloseToday) ? '**Åpent**' : '**Stengt**'
  }\n`
  todayExceptionMessage.forEach((em) => {
    reply += `> ${em}\n`
  })
  if (!momOpenToday || !momCloseToday) {
    reply += 'Stengt i dag.\n'
    reply += `Neste åpning: ${onNow} (${momOpenNext})\n`
  } else if (now.isBefore(momOpenToday)) {
    reply += `Åpner ${otNow} (${otf})\n`
    reply += `Stenger ${ctNow} (${ctf})\n`
  } else if (now.isAfter(momOpenToday) && now.isBefore(momCloseToday)) {
    reply += `Åpnet for ${otNow} (${otf})\n`
    reply += `Stenger ${ctNow} (${ctf})\n`
  } else if (now.isAfter(momOpenToday) && now.isAfter(momCloseToday)) {
    reply += `Stengte for ${ctNow} (${ctf})\n`
    if (nextExceptionMessage?.length > 0) {
      nextExceptionMessage.forEach((nem) => {
        reply += `> ${nem}\n`
      })
    }
    reply += `Åpner igjen ${onNow} (${onf})\n`
    reply += `Og stenger ${cnNow} (${cnf})`
  }

  msg.channel.send(reply)
}
