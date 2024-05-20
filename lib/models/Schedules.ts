import { mongoClient } from 'lib/services/mongodb/db'

export const getDefaultReminderMessage = () => {
  return 'This is a reminder! (Could not find a custom message for this channel)'
}

export const getReminderMessageByChannelId = async (channelId: string) => {
  const mongo = await mongoClient()

  const res = await mongo.ReminderConfigs.findOne({ channelId })

  if (!res) {
    return getDefaultReminderMessage()
  }

  return res.message
}

interface SetReminderProps {
  channelId: string
  message: string
  createdBy: string
}

export const setReminderMessagebyChannelId = async ({ channelId, createdBy, message }: SetReminderProps) => {
  const mongo = await mongoClient()
  const res = await mongo.ReminderConfigs.updateOne(
    { channelId },
    { $set: { channelId, message, createdBy, createdAt: new Date() } },
    { upsert: true },
  )
  return res.upsertedId
}
