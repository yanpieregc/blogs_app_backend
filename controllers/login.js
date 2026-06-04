import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Router } from 'express'
import User from '../models/user.js'
const loginRouter = Router()

loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body

  const user = await User.findOne({ username })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return res.status(401).json({ error: 'invalid username or password'})
  }

  const userForToken = {
    username: user.username,
    id: user._id
  }

  // el token expira en 60*60 segundos, que es una hora
  const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60*60 })

  res.status(200).send({ token, username: user.username, name: user.name })
})

export default loginRouter