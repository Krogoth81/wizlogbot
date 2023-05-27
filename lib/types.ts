import Discord, { Message } from 'discord.js'
import { config } from 'lib/config'
import { commands } from 'lib/commands'

export interface MessageContext {
  bot: Discord.Client<boolean>
  config: typeof config
  commands: typeof commands
}

export type MessageResolver = (msg: Message<boolean>, content?: string, context?: MessageContext) => Promise<void>
