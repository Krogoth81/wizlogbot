import dotenv from 'dotenv'
dotenv.config()
import Discord, { GatewayIntentBits, ChannelType, Partials } from 'discord.js'
import { config } from './config'
import './init'
import { commands } from './commands/'
import { events } from './events'

import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import 'dayjs/locale/nb'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { startScheduler } from './services/agenda/client'
import type { MessageContext } from './types'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.tz.setDefault('Europe/Oslo')
dayjs.locale('nb')

export const bot = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction, Partials.GuildMember, Partials.User],
})

enum RegexIndex {
  COMMAND = 1,
  CONTENT = 2,
}
const commandRegex = new RegExp(
  `^${config.isProd ? '!' : '_!'}(${commands.map((cm) => cm.key).join('|')})(?:$|\\s)(.*)$`,
  'i',
)

const getMessageValues = (msg: Discord.Message<boolean>) => {
  const regexMatch = msg.content.match(commandRegex)
  if (!regexMatch) {
    return null
  }
  return {
    command: regexMatch[RegexIndex.COMMAND].toLowerCase(),
    content: regexMatch[RegexIndex.CONTENT],
  }
}

const channelMsg = async (msg: Discord.Message<boolean>) => {
  const context: MessageContext = {
    bot,
    config,
    commands,
  }

  events(msg, undefined, context)

  const values = getMessageValues(msg)
  if (!values) {
    return
  }

  const command = commands.find((cm) => values.command?.toLowerCase() === cm.key.toLowerCase())

  if (command) {
    await command.run(msg, values.content, context)
  }
}

const start = async () => {
  // Scheduled jobs post to Discord, and Agenda starts processing overdue work
  // the moment it starts. Gating on 'ready' means a restart with a backlog can
  // never fire jobs against a client that isn't logged in yet.
  bot.once('ready', async () => {
    console.log('READY!')
    console.log('Logged in as %s', bot.user.tag)
    try {
      await startScheduler()
    } catch (error) {
      console.error(new Date(), 'Failed to start scheduler', error)
    }
  })

  bot.on('messageCreate', async (msg) => {
    if (msg.author.bot) {
      return
    }
    const { type } = msg.channel
    switch (type) {
      case ChannelType.GuildText: {
        if (!config.isProd) {
          console.log('CHANNEL NAME ->', msg.channel.name)
          if (msg.channel.name === 'bot-tester') {
            channelMsg(msg)
          }
        } else {
          channelMsg(msg)
        }
        break
      }
      default:
    }
  })

  bot.on('messageUpdate', async (_oldMsg, newMsg) => {
    if (newMsg.author?.bot || !newMsg.content) {
      return
    }
    const message = newMsg as Discord.Message<boolean>
    const values = getMessageValues(message)
    if (!values) {
      return
    }
    const command = commands.find((cm) => cm.key === values.command)
    if (!command) {
      return
    }

    // Only a couple of commands react to message edits.
    switch (command.key) {
      case 'settopic': {
        if (!config.isProd) {
          return
        }
        await command.run(message, values.content)
        break
      }
      case 'predict': {
        // Re-runs predict so editing a `!predict` message updates the stored
        // prediction (predict enforces its own 10-minute edit window). Mirror
        // the create-path channel gating so dev only reacts in #bot-tester.
        if (message.channel.type !== ChannelType.GuildText) {
          return
        }
        if (!config.isProd && message.channel.name !== 'bot-tester') {
          return
        }
        await command.run(message, values.content)
        break
      }
      default:
    }
  })

  bot.on('error', (error) => {
    console.error(new Date(), error)
  })

  // Most sends in this codebase are fire-and-forget, and an unhandled rejection
  // terminates the process on Node 18 — which would take the in-memory send
  // queue with it. Log and keep running instead.
  process.on('unhandledRejection', (error) => {
    console.error(new Date(), 'unhandledRejection', error)
  })

  // discord.js queues and retries 429s internally, so this is the only way to
  // find out we are being throttled.
  bot.rest.on('rateLimited', (info) => {
    console.warn(new Date(), 'RATE LIMITED', info)
  })

  bot.login(config.dicordClientToken)

  console.log('Connecting!')
}

start()
