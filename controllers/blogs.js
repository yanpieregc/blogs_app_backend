import jwt from 'jsonwebtoken'
import { Router } from 'express'
const blogsRouter = Router()
import Blog from '../models/blog.js'
import User from '../models/user.js'
import middleware from '../utils/middleware.js'


blogsRouter.get('/', async (req, res) => {
  const blog = await Blog.find({}).populate('user', { username: 1, name: 1 })
  res.json(blog)
})

blogsRouter.get('/:id', (req, res, next) => {
  Blog.findById(req.params.id)
    .then(blog => {
      if (blog) res.json(blog)
      else res.status(404).end()
    })
    .catch(error => next(error))
})

blogsRouter.post('/', middleware.userExtractor, async (req, res) => {
  const body = req.body
  const user = req.user

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user.id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  res.status(201).json(savedBlog)
})

blogsRouter.put('/:id', middleware.userExtractor, async (req, res) => {
  const user = req.user
  const { likes } = req.body

  const blog = await Blog.findById(req.params.id)

  if (!blog) {
    return res.status(404).json({ error: 'blog not found' })
  }

  if (blog.user.toString() !== user._id.toString()) {
    return res.status(403).json({ error: "forbidden" })
  } 

  blog.likes = likes
  const updateBlog = await blog.save()
  res.json(updateBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (req, res) => {
  const user = req.user
  const blog = await Blog.findById(req.params.id)

  if (!blog) {
    return res.status(404).json({ error: 'blog not found' })
  }

  if (blog.user.toString() !== user._id.toString()) {
    return res.status(403).json({ error: "forbidden" })
  } 

  await blog.deleteOne()
  res.status(204).end()
})

export default blogsRouter