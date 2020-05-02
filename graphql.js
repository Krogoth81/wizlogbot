const { GraphQLClient } = require('graphql-request')

const config = require('./config.json')

const devUrl = 'http://localhost:4000/graphql'
const prodUrl = 'https://api.wizardry-logs.com/graphql'

const clientUrl = process.env.NODE_ENV === 'production' ? prodUrl : devUrl


const query = `
  query Search($channel: String!, $searchString: String!, $limit: Int) {
    searchInChannel(channel: $channel, searchString: $searchString, limit: $limit) {
      count
      items {
        _id
        source
        type
        nick
        message
        date
        author
        createdAt
        channel
      }
    }
  }
`

const randomQuery = `
  query Random {
    findRandomMessage {
      count
      item {
        _id
        source
        type
        nick
        message
        date
        author
        createdAt
        channel
      }
    }
  }
`

const generateInvite = `
  mutation GenerateInvite($discordid: String!, $nick: String) {
    generateInviteForUser(discordid: $discordid, nick: $nick) {
      message
      url
      success
    }
  }
`

const statusReportQuery = `
  query StatusReport {
    generateStatusReport {
      totalCount
      users
      searchRequests
      randomRequests
      invites
      uptime
    }
  }
`

const init = (msg) => {
  const discordid = msg.author.id
  const nick = msg.author.username

  const client = new GraphQLClient(clientUrl, {
    headers: {
      botaccess: config.graphqlToken,
      discordid,
      nick,
    },
  })

  const search = async (channel, searchString) => {
    try {
      let { searchInChannel } = await client.request(query, { channel, searchString, limit: 1})
      let item = searchInChannel && searchInChannel.count > 0 ? searchInChannel.items[0] : null
      return item
    } catch (e) {
      console.log(new Date, "Errored during search query", e)
      return null
    }
  }


  const random = async () => {
    try {
      let { findRandomMessage } = await client.request(randomQuery)
      return findRandomMessage
    } catch (e) {
      console.log(new Date, "Errored during random query", e)
      return null
    }
  }

  const auth = async () => {
    try {
      let { generateInviteForUser } = await client.request(generateInvite)
      return generateInviteForUser
    } catch (e) {
      console.log(new Date, "Errored during auth query", e)
      return null
    }
  }

  const getStatus = async () => {
    try {
      let { generateStatusReport } = await client.request(statusReportQuery)
      return generateStatusReport
    } catch (e) {
      console.log(new Date, "Errored during getStatus query", e)
      return null
    }
  }



  return {
    search,
    random,
    auth,
    getStatus
  }
}

module.exports = {
  init
}
