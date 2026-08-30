import type { ObjectId } from 'mongodb'

export interface ReminderConfigs {
  channelId: string
  message: string
  updatedBy: string
  updatedAt: Date
}

export enum PredictionStateType {
  SUCCESS = 'SUCCESS',
  PARTIAL_SUCCESS = 'PARTIAL_SUCCESS',
  FAILURE = 'FAILURE',
  INDETERMINATE = 'INDETERMINATE',
  UNKNOWN = 'UNKNOWN',
}

export interface Prediction {
  _id: ObjectId
  createdByMessageId: string
  createdInChannelId: string
  createdInGuildId: string
  createdAt: Date
  createdBy: string
  content: string
  triggerDate: Date
  state: PredictionStateType
  updatedAt: Date
  messageUrl: string
  // Id of the bot's own confirmation reply, so an edit to the source message can
  // update that reply in place instead of posting a new one.
  replyMessageId?: string | null
  // --- Delivery tracking ---
  // The scheduled Agenda job is only a low-latency trigger; these three fields
  // are the source of truth for "has this prediction actually been posted?".
  // A periodic sweep re-delivers anything still unposted past its triggerDate,
  // which is what makes delivery survive crashes, downtime and send failures.
  postedAt?: Date | null
  postAttempts?: number
  // Set when delivery failed in a way that retrying can never fix (channel
  // deleted, bot kicked, permissions revoked). Excludes the doc from the sweep.
  postAbandonedReason?: string | null
  deleted: boolean
  deletedAt?: Date | null
  deletedBy?: string | null
}
