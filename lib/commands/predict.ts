import dayjs from 'dayjs'
import { MessageFlags } from 'discord.js'
import { config } from 'lib/config'
import { addPrediction, deletePredictions, getPredictions } from 'lib/models/Predictions'
import { bot } from 'lib/server'
import { cancelPredictionTrigger, schedulePredictionTrigger } from 'lib/services/agenda/schedules'
import type { Prediction } from 'lib/services/mongodb/types'
import type { MessageResolver } from 'lib/types'

const HOW_TO_USE = 'Valid entry must be `!predict <date> <prediction>` (`!predict YYYY-MM-DD Your prediction here`)'

export const predict: MessageResolver = async (msg, content) => {
  const regex = /^([^\s]*)\s(.*)$/
  const regexResult = regex.exec(content)
  const date = regexResult?.[1]
  const predictionContent = regexResult?.[2]?.trim()

  const isDateValid = /^\d{4}-\d{2}-\d{2}$/.test(date)

  if (!date) {
    msg.reply(HOW_TO_USE)
    return
  }

  if (!isDateValid) {
    msg.reply(`Invalid date format. ${HOW_TO_USE}`)
    return
  }
  const triggerDate = dayjs.tz(date, 'YYYY-MM-DD', 'Europe/Oslo').set('hour', 12).startOf('hour')
  const dateIsInThePast = dayjs(triggerDate.startOf('day')).isBefore(dayjs().tz('Europe/Oslo').endOf('day'))

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

  msg.reply(`Prediction submitted. Reminder set for \`${triggerDate.format('YYYY-MM-DD HH:mm')}\``)
}

export const predictions: MessageResolver = async (msg, content) => {
  await msg.channel.sendTyping()
  const isOwner = msg.author.id === config.ownerId

  if (isOwner && content.startsWith('delete ')) {
    const ids = content.match(/[a-zA-Z0-9]{24}/g)
    if (ids?.length > 0) {
      const deleteResultCount = await deletePredictions({ ids, deletedBy: msg.author.id })
      for (const id of ids) {
        await cancelPredictionTrigger(id)
      }
      msg.reply(`${deleteResultCount} message${deleteResultCount > 1 ? 's' : ''} deleted.`)
    } else {
      msg.reply('Missing id(s) - Correct use: `!predictions delete <id>` (seperate multiple ids in a row with a space)')
    }
    return
  }
  const help = isOwner && content.startsWith('--help')
  if (help) {
    msg.reply(`**Available flags for !predictions:**
      \`delete <id>\` (owner only)
      \`--ignore-guilds\` (owner only)
      \`--include-outdated\` (owner only)
      \`--limit=<number>\` (owner only)
      \`--include-ids\` (owner only)
      \`--mine\`
      `)
    return
  }

  const ignoreGuilds = isOwner && content.includes('--ignore-guilds')
  const includePastPredictions = isOwner && content.includes('--include-outdated')
  const useCustomLimit = isOwner && content.includes('--limit=')
  const includeAuthorFilter = content.includes('--mine')
  const includeIds = isOwner && content.includes('--include-ids')

  let limit = undefined

  if (useCustomLimit) {
    const limitRegex = /--limit=([0-9]{1,2})/
    const number = Number(limitRegex[1])
    if (!Number.isNaN(number) && number > 0 && number < 100) {
      limit = number
    }
  }

  const list = await getPredictions({
    guildId: ignoreGuilds ? undefined : msg.guildId,
    includePastPredictions,
    includeAuthorFilter,
    authorId: msg.author.id,
    limit,
  })

  const resolvePrediction = async (item: Prediction) => {
    const prediction = item.content
    const triggerDate = dayjs(item.triggerDate).format('YYYY-MM-DD')
    const user = await bot.users.fetch(item.createdBy)
    const reply = `\`[${triggerDate}]\` ${user?.toString()} "${prediction}" (${item.messageUrl ?? '-'})`
    return includeIds ? `\`${item._id}\` - ${reply}` : reply
  }
  const lines = await Promise.all(list.map(resolvePrediction))

  msg.reply({
    content: lines.join('\n') || `${includeAuthorFilter ? "You don't have any predictions!" : 'No predictions found!'}`,
    allowedMentions: { parse: [] },
    flags: [MessageFlags.SuppressEmbeds],
  })
}
