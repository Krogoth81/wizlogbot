import express from 'express'
import http from 'http'
import Discord from 'discord.js'
import moment from 'moment-timezone'
import cors from 'cors'
import bodyParser from 'body-parser'
import _ from 'lodash'
// import CONFIG from './config.json' // Not included - make your own!
import query from './graphql'

import events from './events/'

import { TextChannel } from 'discord.js'

const { BOTTOKEN, GRAPHQLTOKEN, VINMONOPOLKEY, OWNERID } = process.env
const CONFIG = { BOTTOKEN, GRAPHQLTOKEN, VINMONOPOLKEY, OWNERID }

moment.locale('nb')
moment.tz.setDefault('Europe/Oslo')
const app = express()
const bot = new Discord.Client()
const bootTime = moment()

const answers = [
  'What do you want?',
  "I don't understand!",
  'Really now?',
  '\\*whistles\\*',
  'Exactly!',
  'No way!?',
  'Could you repeat that?',
  "You're not making any sense",
  "Wow. I can't believe you said that!",
  "Haha! :laughing: That's hilarious!",
  "Sorry, I'm busy grinding my gears.",
]

import commands from './commands/'

const directMsg = async (msg, devMode) => {
  try {
    if (devMode) {
      if (msg.content.match(/^_\!authme(\s|$)/)) {
        const response = await query.init(msg, CONFIG).authMe()
        if (!response) {
          msg.channel.send('Got null response, server down?')
          return null
        }
        const { success, url, message } = response
        if (success) msg.channel.send(`>>> ${message}\n<${url}>`)
        else msg.channel.send(`>>> ${message}`)
      } else {
        const randomLine = answers[Math.floor(Math.random() * answers.length)]
        msg.channel.send(randomLine)
      }
    } else if (msg.content.match(/^\!authme(\s|$)/)) {
      const response = await query.init(msg, CONFIG).authMe()
      const { success, url, message } = response
      if (success) msg.channel.send(`>>> ${message}\n${url}`)
      else msg.channel.send(`>>> ${message}`)
    } else {
      const randomLine = answers[Math.floor(Math.random() * answers.length)]
      msg.channel.send(randomLine)
    }
  } catch (e) {
    console.log(e)
  }
}

const channelMsg = async (msg, devMode) => {
  const context = {
    bot,
    bootTime,
    CONFIG,
    query: query.init(msg, CONFIG),
    commands,
  }

  if (!devMode) events(msg, context)

  const COMMAND = 1
  const CONTENT = 3

  let commandRegex = new RegExp(`^\!(${Object.keys(commands).join('|')})($|\\s)(.*)$`, 'i')
  if (devMode) {
    commandRegex = new RegExp(`^_\!(${Object.keys(commands).join('|')})($|\\s)(.*)$`, 'i')
  }
  const regexMatch = msg.content.match(commandRegex)
  if (!regexMatch) return null
  const key = regexMatch[COMMAND].toLowerCase()
  const content = regexMatch[CONTENT]

  if (key) commands[key](msg, content, context)
}

const start = async () => {
  bot.on('ready', async () => {
    console.log('READY!')
    console.log('Logged in as %s', bot.user.tag)
    bot.user.setActivity('paint dry', { type: 'WATCHING' })
    app.use(cors())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    app.post('/bot', (req, res) => {
      console.log(req.body)
      if (req.body.get === 'botstatus') {
        return res.status(200).send(JSON.stringify(bot))
      }
      return res.status(200).send(JSON.stringify({ content: req.body }))
    })
    http.createServer(app).listen(4005, () => {
      console.log('Bot API up and running on port 4005')
    })
  })

  if (process.env.NODE_ENV !== 'production') {
    bot.on('message', async (msg) => {
      // ||========= TEST-STUFF GOES HERE ============||
      if (msg.author.id !== CONFIG.OWNERID) return null
      const { type } = msg.channel
      if (msg.author.bot) return null
      switch (type) {
        case 'dm':
          directMsg(msg, true)
          break
        case 'text':
          if ((msg.channel as TextChannel).name !== 'bot-tester') return null
          channelMsg(msg, true)
        default:
      }
      return null
      // ||===========================================||
    })
  } else {
    bot.on('message', async (msg) => {
      if (msg.author.bot) return null
      const { type } = msg.channel
      switch (type) {
        case 'dm':
          directMsg(msg, false)
          break
        case 'text':
          channelMsg(msg, false)
        default:
      }
      return null
    })
  }

  bot.login(CONFIG.BOTTOKEN)
  console.log('Connecting!')
}

start()
