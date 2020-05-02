const Discord = require('discord.js')
const moment = require('moment')
const CONFIG = require('./config.json') // Not included - make your own!
const requireDir = require('require-dir')
const query = require('./graphql')


const bot = new Discord.Client()
const bootTime = moment()

const answers = [
  "What do you want?",
  "I don't understand!",
  "Really now?",
  "\*whistles\*",
  "... I'm too old for this shit",
  "Could you repeat that?",
  "You're not making any sense",
  "Wow. I can't believe you said that!"
]


const directMsg = async (msg) => {
  try {
    if (msg.content.match(/^\!authme(\s|$)/)) {
      const { success, url, message } = await query.auth(msg.author.id, msg.author.username)
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




const commands = requireDir('commands')

const context = {
  bot,
  bootTime,
  CONFIG,
  query,
  commands
}

const channelMsg = async (msg) => {
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

  bot.on('ready', () => {
    console.log("READY!")
    console.log('Logged in as %s', bot.user.tag)
  })

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

  bot.login(CONFIG.botToken)
  console.log("Connecting!")

}


start()
