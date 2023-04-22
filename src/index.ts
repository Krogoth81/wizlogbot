import dotenv from 'dotenv'
dotenv.config()
import Discord, { Message, GatewayIntentBits } from 'discord.js'
import { config } from './config'
import './init'
import { commands } from './commands/'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/nb'
import { events } from './events'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Europe/Berlin')
dayjs.locale('nb')

export interface MessageContext {
  bot: Discord.Client<boolean>
  config: typeof config
  commands: typeof commands
}

export type MessageResolver = (msg: Message<boolean>, content?: string, context?: MessageContext) => Promise<void>

const bot = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMessageTyping,
  ],
})

enum RegexIndex {
  COMMAND = 1,
  CONTENT = 2,
}
const commandRegex = new RegExp(`^\!(${commands.map((cm) => cm.key).join('|')})(?:$|\\s)(.*)$`, 'i')

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

  const command = commands.find((cm) => values.command === cm.key)

  if (command) {
    await command.run(msg, values.content, context)
  }
}

const start = async () => {
  bot.on('ready', async () => {
    console.log('READY!')
    console.log('Logged in as %s', bot.user.tag)
  })

  bot.on('messageCreate', async (msg) => {
    if (msg.author.bot) {
      return
    }
    const { type } = msg.channel
    switch (type) {
      case Discord.ChannelType.GuildText: {
        if (!config.isProd) {
          console.log('CHANNEL NAME ->', msg.channel.name)
          if (msg.channel.name === 'bot-tester') {
            channelMsg(msg)
          }
        } else {
          channelMsg(msg)
        }
      }
      default:
    }
  })

  bot.on('messageUpdate', async (oldMsg, newMsg) => {
    if (newMsg.author.bot) {
      return
    }
    if (oldMsg.content.startsWith('!settopic') && newMsg.content.startsWith('!settopic')) {
      if (!config.isProd) {
        return
      }
      const values = getMessageValues(newMsg as Discord.Message<boolean>)
      const command = commands.find((cm) => cm.key === values.command)
      if (!command) {
        return
      }
      await command.run(newMsg as Discord.Message<boolean>, values.content)
    }
  })

  bot.on('error', (error) => {
    console.error(new Date(), error)
  })

  bot.login(config.dicordClientToken)

  console.log('Connecting!')
}

start()
