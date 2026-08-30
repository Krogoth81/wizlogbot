import Agenda from 'agenda'
import { config } from 'lib/config'
import { backfillDeliveryFields } from 'lib/models/Predictions'
import { sweepDuePredictions } from 'lib/services/predictions/delivery'
import { mongoDbConnectionString } from '../mongodb/client'
import { setAgendaDefinitions } from './agendaDefinitions'
import { ScheduleTypes } from './types'

// How often overdue-but-unposted predictions are re-checked. The scheduled job
// is the fast path; this is the backstop.
const SWEEP_INTERVAL = '15 minutes'

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
  // Was 10 minutes, which meant a job created just after a tick could fire up
  // to 10 minutes late. One minute keeps triggers punctual; the query is a
  // single indexed lookup.
  agendaClient.processEvery('1 minute')
  agendaClient.on('fail', (error, job) => {
    console.error(new Date(), `Agenda job "${job.attrs.name}" failed`, error)
  })

  return agendaClient
}

/**
 * Starts job processing. Must only be called once the Discord client is ready —
 * jobs post to Discord, and Agenda begins processing overdue work immediately.
 */
export const startScheduler = async () => {
  const agenda = await initAgenda()

  // Safe to run every boot; it stops matching once the fields exist.
  await backfillDeliveryFields()

  await agenda.start()
  await agenda.every(SWEEP_INTERVAL, ScheduleTypes.PREDICTION_SWEEP)

  // Drain anything that came due while the bot was down, without waiting for
  // the first scheduled sweep.
  await sweepDuePredictions()

  console.log(new Date(), 'Scheduler started')
  return agenda
}
