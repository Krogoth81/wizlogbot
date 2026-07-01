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
  deleted: boolean
  deletedAt?: Date | null
  deletedBy?: string | null
}
