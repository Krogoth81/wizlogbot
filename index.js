const express = require('express')
const http = require("http")
const app = express()
const fs = require("fs")
const Discord = require('discord.js')
const moment = require('moment-timezone')
const path = require('path')
const cors = require('cors')
const bodyparser = require('body-parser')
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
    if (msg.devMode) {
      if (msg.content.match(/^_\!authme(\s|$)/)) {
        let response = await query.init(msg).authMe()
        if (!response) {
          msg.channel.send('Got null response, server down?')
          return null
        }
        const { success, url, message } = response
        if (success) msg.channel.send(`>>> ${message}\n<${url}>`)
        else msg.channel.send(`>>> ${message}`)
      } else {
        let randomLine = answers[Math.floor(Math.random() * answers.length)]
        msg.channel.send(randomLine)
      }
    } else {

      if (msg.content.match(/^\!authme(\s|$)/)) {
        let response = await query.init(msg).authMe()
        const { success, url, message } = response
        if (success) msg.channel.send(`>>> ${message}\n${url}`)
        else msg.channel.send(`>>> ${message}`)
      } else {
        let randomLine = answers[Math.floor(Math.random() * answers.length)]
        msg.channel.send(randomLine)
      }
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

  if (!msg.devMode) events(msg, context)

  const COMMAND = 1
  const CONTENT = 3

  let commandRegex = new RegExp(`^\!(${Object.keys(commands).join('|')})($|\\s)(.*)$`, 'i')
  if (msg.devMode) commandRegex = new RegExp(`^_\!(${Object.keys(commands).join('|')})($|\\s)(.*)$`, 'i')

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
    bot.user.setActivity('paint dry', { type: 'WATCHING' })
    app.use(cors('*'))
    app.use(bodyparser.urlencoded({ extended: true }))
    app.use(bodyparser.json())
    app.post('/bot', (req, res) => {
      console.log(req.body)
      if (req.body.get === 'botstatus') {
        return res.status(200).send(JSON.stringify(bot))
      }
      return res.status(200).send(JSON.stringify({ content: req.body }))
    })
    http.createServer(app).listen(4005, () => {
      console.log("Bot API up and running on port 4005")
    })
  })

  if (process.env.NODE_ENV !== 'production') {
    bot.on('message', async (msg) => {
      // ||========= TEST-STUFF GOES HERE ============||
      if (msg.author.id !== CONFIG.ownerId) return null
      msg.devMode = true
      const type = msg.channel.type
      if (msg.author.bot) return null
      switch (type) {
        case 'dm':
        directMsg(msg)
        break
        case 'text':
        if (msg.channel.name !== 'bot-tester') return null
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
