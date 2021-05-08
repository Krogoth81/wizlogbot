const commands = (msg, content, { commands }) => {
  let keys = Object.keys(commands)
  keys = keys.map((k) => `!${k}`)
  let reply = ''
  reply += 'Alle tilgjengelige kommandoer:\n'
  reply += `\`\`\`${keys.join('\n')}\`\`\``

  msg.channel.send(reply)
}

export default commands
