// A single serial FIFO that every job-originated Discord send goes through.
//
// Why this exists: Agenda hands us all jobs sharing a `nextRunAt` at once, so N
// predictions due at the same minute used to hit Discord simultaneously.
// Discord allows roughly 5 messages per 5 seconds per channel, and enough 429s
// in a row earns a Cloudflare ban for the whole host. discord.js already queues
// and retries internally, but that only hides the burst — it still backs up
// every other REST call the bot wants to make. Pacing here keeps us under the
// limit in the first place.
//
// Deliberately global rather than per-channel: the bot posts to a handful of
// channels, and one shared 1.2s cadence is far simpler than per-channel buckets
// while still being comfortably within the per-channel limit.

// 5 messages / 5s per channel is the binding limit; 1.2s leaves headroom.
const MIN_INTERVAL_MS = 1200
// Backstop against unbounded memory growth if Discord is down for a long time.
// Refused items are not lost — the prediction sweep re-queues them next pass.
const MAX_QUEUE = 500

interface QueuedTask {
  key: string
  run: () => Promise<void>
}

const queue: Array<QueuedTask> = []
// Keys currently queued or in flight, so the sweep can't enqueue a delivery the
// Agenda trigger already queued.
const pending = new Set<string>()
let draining = false

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const drain = async () => {
  if (draining) {
    return
  }
  draining = true
  try {
    while (queue.length > 0) {
      const task = queue.shift()
      try {
        await task.run()
      } catch (error) {
        // A single bad task must never stall the queue for everything behind it.
        console.error(new Date(), `sendQueue task "${task.key}" threw`, error)
      } finally {
        pending.delete(task.key)
      }
      if (queue.length > 0) {
        await sleep(MIN_INTERVAL_MS)
      }
    }
  } finally {
    draining = false
  }
}

/**
 * Queue a Discord send. Returns false if it was refused (already queued, or the
 * queue is full) — callers should treat that as "not delivered yet", not as an
 * error, since the sweep will come back for it.
 */
export const enqueueSend = (key: string, run: () => Promise<void>): boolean => {
  if (pending.has(key)) {
    return false
  }
  if (queue.length >= MAX_QUEUE) {
    console.error(new Date(), `sendQueue full (${MAX_QUEUE}), refusing "${key}"`)
    return false
  }
  pending.add(key)
  queue.push({ key, run })
  void drain()
  return true
}
