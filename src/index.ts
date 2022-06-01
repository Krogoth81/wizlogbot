import dotenv from 'dotenv'
dotenv.config()
import Discord, {Intents} from 'discord.js'
import * as config from './config'
import './init'

const bot = new Discord.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
  ],
})

import {commands} from './commands/'
import {MessageContext} from './types/types'

enum RegexIndex {
  COMMAND = 1,
  CONTENT = 2,
}

const channelMsg = async (msg: Discord.Message<boolean>) => {
  const context: MessageContext = {
    bot,
    config,
    commands,
  }

  const commandRegex = new RegExp(
    `^\!(${commands.map((cm) => cm.key).join('|')})(?:$|\\s)(.*)$`,
    'i'
  )

  const regexMatch = msg.content.match(commandRegex)

  if (!regexMatch) {
    return null
  }

  const key = regexMatch[RegexIndex.COMMAND].toLowerCase()
  const content = regexMatch[RegexIndex.CONTENT]

  const command = commands.find((cm) => key === cm.key)

  if (command) {
    command.run(msg, content, context)
  }
}

const start = async () => {
  bot.on('ready', async () => {
    console.log('READY!')
    console.log('Logged in as %s', bot.user.tag)
    bot.user.setActivity('paint dry', {type: 'WATCHING'})
  })

  bot.on('messageCreate', async (msg) => {
    if (msg.author.bot) {
      return
    }
    const {type} = msg.channel
    switch (type) {
      case 'GUILD_TEXT':
        channelMsg(msg)
      default:
    }
  })

  bot.on('messageUpdate', async (oldMsg, newMsg) => {
    if (newMsg.author.bot) {
      return
    }
    if (oldMsg.content.startsWith('!settopic') && newMsg.content.startsWith('!settopic')) {
      commands.find((cm) => cm.key === 'settopic').run(newMsg as Discord.Message<boolean>)
    }
  })

  bot.login(config.dicordClientToken)
  console.log('Connecting!')
}

start()
