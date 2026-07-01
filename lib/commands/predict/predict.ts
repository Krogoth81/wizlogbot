import dayjs from 'dayjs'
import { MessageFlags } from 'discord.js'
import { config } from 'lib/config'
import {
  addPrediction,
  deletePredictions,
  getPredictionByMessageId,
  getPredictions,
  setPredictionReplyMessageId,
  updatePrediction,
} from 'lib/models/Predictions'
import type { Dayjs } from 'dayjs'
import { bot } from 'lib/server'
import { cancelPredictionTrigger, schedulePredictionTrigger } from 'lib/services/agenda/schedules'
import type { Prediction } from 'lib/services/mongodb/types'
import type { MessageResolver } from 'lib/types'
import * as chrono from 'chrono-node'
import { normalizeNorwegianDateInput } from './normalizeNorwegian'

const HOW_TO_USE =
  'Usage: `!predict <when> | <prediction>`\n' +
  'Examples:\n' +
  '• `!predict tomorrow 6pm | Klokken er nå 18:00!`\n' +
  '• `!predict neste fredag halv seks | Trump har forbudt mørkhudede å stemme` (Norsk funker også!)\n' +
  '• `!predict 2029-12-31 | Atomkringen har begynt` (fixed dates still work)'

const STRICT_DATE = /^\d{4}-\d{2}-\d{2}$/

// How long after creating a prediction the author may still edit it by editing
// their original `!predict` message. The message-edit routing lives in
// server.ts (messageUpdate); this constant enforces the time bound.
const EDIT_WINDOW_MINUTES = 10

const confirmationText = (triggerDate: Dayjs, updated = false): string =>
  `Prediction submitted. Reminder set for \`${triggerDate.format('YYYY-MM-DD HH:mm')}\`${updated ? '. (Updated)' : ''}`

export const predict: MessageResolver = async (msg, content) => {
  const now = dayjs().tz('Europe/Oslo')
  const osloOffsetMinutes = now.utcOffset()

  let whenText: string
  let predictionContent: string

  if (content.includes('|')) {
    // Preferred path: explicit delimiter. Everything left of the first "|" is
    // the date/time; everything right is the prediction, kept verbatim.
    const idx = content.indexOf('|')
    whenText = content.slice(0, idx).trim()
    predictionContent = content.slice(idx + 1).trim()
  } else {
    // Backwards-compatible path for the old `!predict YYYY-MM-DD <prediction>`
    // muscle memory: treat the first token as a strict date.
    const [firstToken, ...rest] = content.trim().split(/\s+/)
    if (STRICT_DATE.test(firstToken)) {
      whenText = firstToken
      predictionContent = rest.join(' ').trim()
    } else {
      // No delimiter and not a strict date — we can't reliably tell where the
      // date ends and the prediction begins. Ask the user to use the delimiter.
      msg.reply(`Couldn't find a clear date/time. ${HOW_TO_USE}`)
      return
    }
  }

  if (!predictionContent) {
    msg.reply(`Prediction missing. ${HOW_TO_USE}`)
    return
  }

  // Normalize Norwegian -> English, then let chrono parse. Reference instant +
  // Oslo offset so "i morgen"/"neste mandag" resolve relative to Oslo time
  // regardless of the server's own timezone. forwardDate makes bare weekdays
  // resolve to the NEXT occurrence, as expected for scheduling.
  const normalized = normalizeNorwegianDateInput(whenText)
  const result = chrono.parse(normalized, { instant: now.toDate(), timezone: osloOffsetMinutes }, { forwardDate: true })[0]

  if (!result) {
    msg.reply(`Didn't understand the date "${whenText}". ${HOW_TO_USE}`)
    return
  }

  // If no explicit time was given, keep the old "noon" default instead of
  // chrono's midnight default.
  const hasExplicitTime = result.start.isCertain('hour')
  const parsed = dayjs(result.start.date()).tz('Europe/Oslo')
  const triggerDate = hasExplicitTime ? parsed : parsed.set('hour', 12).startOf('hour')

  // Original rule was "minimum 1 day ahead". Now that specific times are
  // supported you may want to allow same-day future times (e.g. "om 2 timer").
  // This keeps a plain "must be in the future" check; swap in the stricter
  // 1-day rule here if you prefer the old behavior.
  if (!triggerDate.isAfter(now)) {
    msg.reply('Only predictions set in the future are allowed.')
    return
  }

  // Edit path: this command re-runs when the author edits their original
  // `!predict` message (see the messageUpdate handler in server.ts). If a
  // prediction already exists for this message, update it in place instead of
  // inserting a duplicate — but only inside the edit window.
  const existing = await getPredictionByMessageId(msg.id)
  if (existing) {
    const editWindowCloses = dayjs(existing.createdAt).add(EDIT_WINDOW_MINUTES, 'minute')
    if (now.isAfter(editWindowCloses)) {
      msg.reply(`The ${EDIT_WINDOW_MINUTES}-minute edit window has closed — the original prediction stands.`)
      return
    }

    const predictionId = existing._id.toString()
    await updatePrediction({ id: predictionId, content: predictionContent, triggerDate: triggerDate.toDate() })
    // Reschedule in case the date changed (schedulePredictionTrigger cancels the
    // existing trigger for this id first).
    await schedulePredictionTrigger({ predictionId }, triggerDate.toDate())

    // Update the bot's original confirmation in place rather than posting a new
    // message. If that reply is gone/uneditable (or predates this feature), send
    // a fresh one and remember it so further edits stay quiet.
    const updatedText = confirmationText(triggerDate, true)
    try {
      if (!existing.replyMessageId) {
        throw new Error('no stored reply message')
      }
      const botReply = await msg.channel.messages.fetch(existing.replyMessageId)
      await botReply.edit(updatedText)
    } catch {
      const sent = await msg.reply(updatedText)
      await setPredictionReplyMessageId({ id: predictionId, replyMessageId: sent.id })
    }
    return
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
    // Remember the confirmation message so a later edit can update it in place.
    const sent = await msg.reply(confirmationText(triggerDate))
    await setPredictionReplyMessageId({ id: addPredictionResult.toString(), replyMessageId: sent.id })
  }
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
    const number = Number(content.match(limitRegex)?.[1])
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
