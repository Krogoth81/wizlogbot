const { GraphQLClient } = require('graphql-request')

const config = require('./config.json')

const devUrl = 'http://localhost:4000/graphql'
const prodUrl = 'https://api.wizardry-logs.com/graphql'

const clientUrl = process.env.NODE_ENV === 'production' ? prodUrl : devUrl

const addRequestMutation = `
  mutation AddFeatureRequest($content: String) {
    addFeatureRequest(content: $content) {
      createdAt
      createdBy
      content
      resolvedAt
      comment
    }
  }
`

const searchQuery = `
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
  mutation GenerateInvite {
    generateInviteForUser {
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

const getRandomString = `
  query getRandomString {
    getRandomString
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
      let { searchInChannel } = await client.request(searchQuery, { channel, searchString, limit: 1})
      return searchInChannel
    } catch (e) {
      console.log(new Date(), "Errored during search query", e)
      return null
    }
  }


  const random = async () => {
    try {
      let { findRandomMessage } = await client.request(randomQuery)
      return findRandomMessage
    } catch (e) {
      console.log(new Date(), "Errored during random query", e)
      return null
    }
  }

  const authMe = async () => {
    try {
      let { generateInviteForUser } = await client.request(generateInvite)
      return generateInviteForUser
    } catch (e) {
      console.log(new Date(), "Errored during auth query", e)
      return null
    }
  }

  const getStatus = async () => {
    try {
      let { generateStatusReport } = await client.request(statusReportQuery)
      return generateStatusReport
    } catch (e) {
      console.log(new Date(), "Errored during getStatus query", e)
      return null
    }
  }

  const addRequest = async (content) => {
    try {
      let { addFeatureRequest } = await client.request(addRequestMutation, { content })
      return addFeatureRequest
    } catch (e) {
      console.log(new Date(), "Errored during addRequest mutation", e)
      return null
    }
  }

  const randomResponse = async (content) => {
    try {
      let { randomResponse } = await client.request(getRandomString, { content })
      return randomResponse
    } catch (e) {
      console.log(new Date(), "Errored during randomResponse mutation", e)
      return null
    }
  }



  return {
    search,
    random,
    authMe,
    getStatus,
    addRequest,
    randomResponse,
  }
}

module.exports = {
  init
}
