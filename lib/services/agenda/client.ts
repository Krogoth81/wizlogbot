import Agenda from 'agenda'
import { mongoDbConnectionString } from '../mongodb/client'
import { setAgendaDefinitions } from './agendaDefinitions'
import { config } from 'lib/config'

let agendaClient: Agenda = null

export const initAgenda = async (): Promise<Agenda> => {
  if (agendaClient) {
    return agendaClient
  }
  agendaClient = new Agenda({
    db: {
      address: mongoDbConnectionString,
      collection: config.isProd ? 'agenda' : 'agendatests',
    },
  })
  setAgendaDefinitions(agendaClient)
  agendaClient.processEvery('10 minutes')

  return agendaClient
}
