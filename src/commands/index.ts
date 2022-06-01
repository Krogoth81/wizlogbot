import {MessageResolver} from '../types/types'
import {alcoholic} from './alkis'
import {createQuiz} from './createQuiz'
import {featureRequest} from './featureRequest'
import {lastQuiz} from './lastQuiz'
import {ping} from './ping'
import {randomComplaint} from './randomComplaint'
import {randomLog} from './randomLog'
import {searchLogs} from './searchLogs'
import {setTopic} from './setTopic'
import {status} from './status'
import {whiners} from './whiners'

interface Command {
  key: string
  run: MessageResolver
}

export const commands: Array<Command> = [
  {key: 'alkis', run: alcoholic},
  {key: 'createquiz', run: createQuiz},
  {key: 'featurerequest', run: featureRequest},
  {key: 'lastquiz', run: lastQuiz},
  {key: 'ping', run: ping},
  {key: 'randomklage', run: randomComplaint},
  {key: 'randomlog', run: randomLog},
  {key: 'searchlogs', run: searchLogs},
  {key: 'settopic', run: setTopic},
  {key: 'status', run: status},
  {key: 'whiners', run: whiners},
]
