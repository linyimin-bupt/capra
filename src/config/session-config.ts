import session from 'express-session'
const fileStore = require('session-file-store')(session)

export const sessionConfig = {
  store: new fileStore(),
  cookie: {
    maxAge: 3600 * 24 * 30 * 6,
  },
  httpOnly         : true,
  secret           : 'xiaoju-bot-web',
  resave           : true,
  saveUninitialized: true,
}
