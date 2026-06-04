import bcrypt from 'bcrypt'
import { Router } from 'express'
const usersRouter = Router()
import User from '../models/user.js'

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })
  res.json(users)
})

usersRouter.post('/', async (req, res) => {
  const { username, name, password } = req.body

  if (!password || password.length < 3) 
    return res.status(400).json({ error: "El password debe tener al menos 3 caracteres"})

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash
  })

  const savedUser = await user.save()
  res.status(201).json(savedUser)
})

export default usersRouter