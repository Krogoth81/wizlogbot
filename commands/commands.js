module.exports = (msg, content, { commands }) => {
    let keys = Object.keys(commands)
    keys = keys.map(k => `!${k}`)
    let reply = ``
    reply += `Tilgjengelige kommandoer:\n`
    reply += `\`\`\`${keys.join('\n')}\`\`\``

    msg.channel.send(reply)
}
