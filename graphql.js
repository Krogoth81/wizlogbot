const { GraphQLClient } = require('graphql-request')

const config = require('./config.json')

const devUrl = 'http://localhost:4000/graphql'
const prodUrl = 'https://api.wizardry-logs.com/graphql'

const clientUrl = process.env.NODE_ENV === 'production' ? prodUrl : devUrl

const client = new GraphQLClient(clientUrl, {
  headers: {
    Authorization: config.graphqlToken
  },
})

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
  mutation GenerateInvite($discordId: String!, $nick: String) {
    generateInviteForUser(discordId: $discordId, nick: $nick) {
      message
      url
      success
    }
  }
`


const search = async (channel, searchString) => {
  try {
    let { searchInChannel } = await client.request(query, {channel, searchString, limit: 1})
    let item = searchInChannel.count > 0 ? searchInChannel.items[0] : null
    return item
  } catch (e) {
    console.log(new Date(), "An error occured. Noooo!\n", e)
  }
}


const random = async () => {
  try {
    let { findRandomMessage } = await client.request(randomQuery)
    return findRandomMessage
  } catch (e) {
    console.log(new Date(), "Oopsie", e)
  }
}

const auth = async (discordId, nick) => {
  try {
    let { generateInviteForUser } = await client.request(generateInvite, { discordId, nick })
    return generateInviteForUser
  } catch (e) {
    console.log(new Date(), "Error error!", e)
  }
}

module.exports = {
  search,
  random,
  auth
}
