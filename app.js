import express from 'express'
const app = express()
import mongoose from 'mongoose'
import cors from 'cors'
import blogsRouter from './controllers/blogs.js'
import usersRouter from './controllers/users.js'
import loginRouter from './controllers/login.js'
import testingRouter from './controllers/testing.js'
import logger from './utils/logger.js'
import config from './utils/config.js'
import middleware from './utils/middleware.js'

mongoose.set('strictQuery', false)

mongoose.connect(config.MONGODB_URI)
  .then(() => logger.info('connect to MongoDB'))
  .catch(error => logger.error('error connecting MongoDB', error.message))

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())
app.use(middleware.tokenExtractor)
app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)
app.use('/api/blogs', blogsRouter)

if (process.env.NODE_ENV === 'test') {
  app.use('/api/testing', testingRouter)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

export default app
