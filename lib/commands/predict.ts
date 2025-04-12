import dayjs from 'dayjs'
import { config } from 'lib/config'
import { addPrediction, getPredictions } from 'lib/models/Predictions'
import { schedulePredictionTrigger } from 'lib/services/agenda/schedules'
import type { Prediction } from 'lib/services/mongodb/types'
import type { MessageResolver } from 'lib/types'

const HOW_TO_USE =
  "Valid entry must be `!predict <date> <prediction>` (`!predict YYYY-MM-DD Something that would've happend within now and this date`)"

export const predict: MessageResolver = async (msg, content) => {
  const regex = /^([^\s]*)\s(.*)$/
  const regexResult = regex.exec(content)
  const date = regexResult[1]
  const predictionContent = regexResult[2]?.trim()

  const isDateValid = /^\d{4}-\d{2}-\d{2}$/.test(date)

  if (!date) {
    msg.reply(HOW_TO_USE)
  }

  if (!isDateValid) {
    msg.reply(`Invalid date format. ${HOW_TO_USE}`)
    return
  }
  const triggerDate = dayjs(date).set('hour', 12).startOf('hour')
  const dateIsInThePast = dayjs(triggerDate.startOf('day')).isBefore(dayjs().endOf('day'))

  if (dateIsInThePast) {
    msg.reply('Only predictions set in the future allowed. (Minimum 1 day ahead)')
    return
  }

  if (!predictionContent) {
    msg.reply(`Prediction missing. ${HOW_TO_USE}`)
  }

  const addPredictionResult = await addPrediction({
    channelId: msg.channelId,
    content: predictionContent,
    messageUrl: msg.url,
    guildId: msg.guildId,
    messageId: msg.id,
    triggerDate: triggerDate.toDate(),
    userId: msg.author.id,
  })

  if (addPredictionResult) {
    await schedulePredictionTrigger({ predictionId: addPredictionResult.toString() }, triggerDate.toDate())
  }

  msg.reply(`Prediction "${predictionContent}" submitted. Reminder set for ${triggerDate.format('YYYY-MM-DD HH:mm')}`)
}

export const predictions: MessageResolver = async (msg, content) => {
  await msg.channel.sendTyping()
  const isOwner = msg.author.id === config.ownerId
  const ignoreGuilds = isOwner && content.includes('--ignore-guilds')
  const includePastPredictions = isOwner && content.includes('--include-outdated')
  const list = await getPredictions({
    guildId: ignoreGuilds ? undefined : msg.guildId,
    includePastPredictions,
  })

  const resolvePrediction = async (item: Prediction) => {
    const prediction = item.content
    const triggerDate = dayjs(item.triggerDate).format('YYYY-MM-DD')
    return `\`[${triggerDate}]\` "${prediction}" (${item.messageUrl ?? '-'})`
  }
  const lines = await Promise.all(list.map(resolvePrediction))

  msg.reply(lines.join('\n') || 'No predictions found!')
}
