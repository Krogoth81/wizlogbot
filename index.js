const Discord = require('discord.js')
const moment = require('moment-timezone')
moment.locale('nb')
moment.tz.setDefault('Europe/Oslo')

const CONFIG = require('./config.json') // Not included - make your own!
const requireDir = require('require-dir')
const query = require('./graphql')
const _ = require('lodash')

const bot = new Discord.Client()
const bootTime = moment()

const events = require('./events/index')

const answers = [
  "What do you want?",
  "I don't understand!",
  "Really now?",
  "\*whistles\*",
  "Exactly!",
  "No way!?",
  "Could you repeat that?",
  "You're not making any sense",
  "Wow. I can't believe you said that!",
  "Haha! :laughing: That's hilarious!",
  "Sorry, I'm busy grinding my gears."
]

const commands = requireDir('commands')

const directMsg = async (msg) => {
  try {
    if (msg.content.match(/^\!authme(\s|$)/)) {
      let response = await query.init(msg).authMe()
      const { success, url, message } = response
      if (success) msg.channel.send(`>>> ${message}\n${url}`)
      else msg.channel.send(`>>> ${message}`)
    } else {
      let randomLine = answers[Math.floor(Math.random() * answers.length)]
      msg.channel.send(randomLine)
    }
  } catch (e) {
    console.log(e)
  }
}


const channelMsg = async (msg) => {
  const context = {
    bot,
    bootTime,
    CONFIG,
    query: query.init(msg),
    commands
  }

  events(msg, context)

  const COMMAND = 1
  const CONTENT = 3
  let commandRegex = new RegExp(`^\!(${Object.keys(commands).join('|')})($|\\s)(.*)$`, 'i')

  let regexMatch = msg.content.match(commandRegex)

  if (!regexMatch) return null
  let key = regexMatch[COMMAND].toLowerCase()
  let content = regexMatch[CONTENT]


  if (key) commands[key](msg, content, context)
}

const start = async () => {

  bot.on('ready', async () => {
    console.log("READY!")
    console.log('Logged in as %s', bot.user.tag)
    bot.user.setActivity('paint dry', { type: 'WATCHING'})
  })

  if (process.env.NODE_ENV !== 'production') {
    bot.on('message', async (msg) => {
      const type = msg.channel.type
      if (msg.author.bot) return null
      if (type !== 'text') return null
      if (msg.guild.name !== 'Forged Alliance FOREVAH!' && msg.channel.name !== 'bot-tester') return null
      // ||========= TEST-STUFF GOES HERE ============||
      switch (type) {
        case 'dm':
        directMsg(msg)
        break
        case 'text':
        channelMsg(msg)
        default:
      }
      return null
      // ||===========================================||
    })
  } else {
    bot.on('message', async (msg) => {
      if (msg.author.bot) return null
      const type = msg.channel.type
      switch (type) {
        case 'dm':
        directMsg(msg)
        break
        case 'text':
        channelMsg(msg)
        default:
      }
      return null
    })
  }

  bot.login(CONFIG.botToken)
  console.log("Connecting!")

}


start()
