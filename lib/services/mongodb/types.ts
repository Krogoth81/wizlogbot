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
}
