export const config = {
  dicordClientToken: process.env.BOTTOKEN,
  vinmonopolKey: process.env.VINMONOPOLKEY,
  ownerId: process.env.OWNERID,
  isProd: process.env.NODE_ENV === 'production',
  mongo: {
    user: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASSWORD,
  },
}
