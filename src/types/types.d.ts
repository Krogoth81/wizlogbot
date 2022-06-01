import Discord, {Message} from 'discord.js'
import * as config from '../config'
import {commands} from '../commands'

export interface MessageContext {
  bot: Discord.Client<boolean>
  config: typeof config
  commands: typeof commands
}

export type MessageResolver = (
  msg: Message<boolean>,
  content?: string,
  context?: MessageContext
) => Promise<void>
