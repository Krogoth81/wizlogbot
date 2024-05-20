import Agenda from 'agenda'
import { getClient } from './client'
import { config } from 'lib/config'
import { ReminderConfigs } from './types'

export const mongoClient = async () => {
  const client = await getClient()
  const db = client.db()
  return {
    ReminderConfigs: db.collection<ReminderConfigs>('reminderconfigs'),
    Agenda: db.collection<Agenda>(config.isProd ? 'agenda' : 'agendatests'),
  }
}
