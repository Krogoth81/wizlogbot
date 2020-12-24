const moment = require('moment')
const fetch = require('node-fetch')
const _ = require('lodash')






module.exports = async (msg, content, { CONFIG }) => {
  let name = content || 'Trondheim, Valentinlyst'

  let url = 'https://apis.vinmonopolet.no/stores/v0/details?storeNameContains='
  url += name.replace(' ', '_')


  let res = await fetch(url, {
     headers: {
      'Ocp-Apim-Subscription-Key': CONFIG.vinmonopolKey
    }
  })
  let list = null
  try {
    list = await res.json()
  } catch (e) {}

  if (_.isEmpty(list)) {
    msg.channel.send(`Fant ingen treff på ${content}`)
    return null
  }

  let data = list[0]
  const { openingHours: { regularHours, exceptionHours } } = data

  const now = moment()

  let dayIndex = now.day() - 1 < 0 ? 6 : now.day() - 1

  let openingToday = regularHours[dayIndex].openingTime
  let closingToday = regularHours[dayIndex].closingTime
  let nextOpening = null
  let nextClosing = null
  let next = now.clone()
  let loops = 0
  let todayExceptionMessage = []
  let nextExceptionMessage = []

  exceptionHours.forEach(eh => {
    if (now.format('YYYY-MM-DD') === eh.date) {
      todayExceptionMessage.push(`[${eh.date}]: ${eh.message}`)
      openingToday = eh.openingTime
      closingToday = eh.closingTime
    }
  })

  while (!nextOpening && loops < 30) {
    next = next.add(1, 'days')
    let nextDayIndex = next.day() - 1 < 0 ? 6 : next.day() - 1
    nextOpening = regularHours[nextDayIndex].openingTime
    nextClosing = regularHours[nextDayIndex].closingTime
    if (!_.isEmpty(exceptionHours)) {
      exceptionHours.forEach(eh => {
        if (next.format('YYYY-MM-DD') === eh.date) {
          nextExceptionMessage.push(`[${eh.date}]: ${eh.message}`)
          nextOpening = eh.openingTime
          nextClosing = eh.closingTime
        }
      })
    }
    loops++
  }

  let df = 'YYYY-MM-DD'
  let dfPlus = 'YYYY-MM-DD HH:mm'
  let dfDay = 'dddd HH:mm'

  let momOpenToday = openingToday ? moment(`${now.format(df)} ${openingToday}`, `${df} HH:mm`) : null
  let momCloseToday = closingToday ? moment(`${now.format(df)} ${closingToday}`, `${df} HH:mm`) : null
  let momOpenNext = moment(`${next.format(df)} ${nextOpening}`, `${df} HH:mm`)
  let momCloseNext = moment(`${next.format(df)} ${nextClosing}`, `${df} HH:mm`)

  let otf = momOpenToday ? momOpenToday.format(dfDay) : 'N/A'
  let ctf = momCloseToday ? momCloseToday.format(dfDay) : 'N/A'
  let onf = momOpenNext ? momOpenNext.format(dfDay) : 'N/A'
  let cnf = momCloseNext ? momCloseNext.format(dfDay) : 'N/A'

  let otNow = momOpenToday ? momOpenToday.from(now) : 'N/A'
  let ctNow = momCloseToday ? momCloseToday.from(now) : 'N/A'
  let onNow = momOpenNext ? momOpenNext.from(now) : 'N/A'
  let cnNow = momCloseNext ? momCloseNext.from(now) : 'N/A'

  let reply = `Polsalg - ${now.format(dfPlus)} - ${data.storeName}\n`
  reply += `Status: ${now.isAfter(momOpenToday) && now.isBefore(momCloseToday) ? '**Åpent**' : '**Stengt**'}\n`
  todayExceptionMessage.forEach(em => {
    reply += `> ${em}\n`
  })
  if (!momOpenToday || !momCloseToday) {
    reply += `Stengt i dag.\n`
    reply += `Neste åpning: ${onNow} (${momOpenNext})\n`
  } else {
    if (now.isBefore(momOpenToday)) {
      reply += `Åpner ${otNow} (${otf})\n`
      reply += `Stenger ${ctNow} (${ctf})\n`
    } else if (now.isAfter(momOpenToday) && now.isBefore(momCloseToday)) {
      reply += `Åpnet for ${otNow} (${otf})\n`
      reply += `Stenger ${ctNow} (${ctf})\n`
    } else if (now.isAfter(momOpenToday) && now.isAfter(momCloseToday)) {
      reply += `Stengte for ${ctNow} (${ctf})\n`
      if (!_.isEmpty(nextExceptionMessage)) {
        nextExceptionMessage.forEach(nem => {
          reply += `> ${nem}\n`
        })
      }
      reply += `Åpner igjen ${onNow} (${onf})\n`
      reply += `Og stenger ${cnNow} (${cnf})`
    }
  }

  msg.channel.send(reply)

}
