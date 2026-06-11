import { test, after, beforeEach } from 'node:test'
import mongoose from 'mongoose'
import app from '../app.js'
import supertest from 'supertest'
import assert from 'node:assert'
import Blog from '../models/blog.js'
import User from '../models/user.js'
import helper from '../utils/test_helper.js'

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  await api.post('/api/users').send({
    username: 'chavoi',
    name: 'chav',
    password: '24680'
  })

  const blogObjects = helper.initialBlogs
    .map(blog => Blog(blog))

  const promiseArray = blogObjects.map(blog => blog.save())

  await Promise.all(promiseArray)
})


test('blogs are returned as json', async () => {
  console.log('entered test')
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('identifier is idn not _id', async () => {
  const response = await api.get('/api/blogs')
  response.body.forEach(b => {
    assert(b.id)
    assert.strictEqual(b._id, undefined)
  })
})

test('create a new blog', async () => {

  const token = await helper.getValidToken(api)

  const newBlog = {
    title: "pipipi",
    author: "chavo del pocho",
    url: "https://pipipi.pi",
    likes: 90
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogs = await helper.blogsInDb()
  assert.strictEqual(blogs.length, helper.initialBlogs.length + 1)
})

test('if not likes, default 0', async () => {

  const token = await helper.getValidToken(api)

  const newBlog = {
    title: "ajio ajio ajio",
    author: "goofy",
    url: "https://ajioajio.ajio"
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  
  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd[blogsAtEnd.length - 1].likes, 0)
})

test('if title or url is empty, response with 400 bad request', async () => {

  const loginResponse = await api
    .post('/api/login')
    .send({
      username: "chavoi",
      password: "24680"
    })

  const token = loginResponse.body.token
  const user = helper.initialUsers

  const newBlog = {
    author: "goofy",
    url: "https://ajioajio.ajio",
    likes: 100
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const blogs = await helper.blogsInDb()
  assert.strictEqual(blogs.length, helper.initialBlogs.length)
})

test('delete one blog only its creator', async () => {

  const token = await helper.getValidToken(api)

  const newBlog = {
    title: "pipipi",
    author: "chavo del pocho",
    url: "https://pipipi.pi",
    likes: 70
  }

  const blogCreated = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtStart = await helper.blogsInDb()
  assert.strictEqual(blogsAtStart.length, helper.initialBlogs.length + 1)

  await api
    .delete(`/api/blogs/${blogCreated.body.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)

  const title = blogsAtEnd.map(b => b.title)
  assert(!title.includes(blogCreated.body.title))
})

test('updating likes of one blog only its creator', async () => {

  const token = await helper.getValidToken(api)

  const newBlog = {
    title: "pipipi",
    author: "chavo del pocho",
    url: "https://pipipi.pi",
    likes: 70
  }

  const blogCreated = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtStart = await helper.blogsInDb()
  assert.strictEqual(blogsAtStart.length, helper.initialBlogs.length + 1)

  const updateBlog = {
    likes: 2999
  }

  await api
    .put(`/api/blogs/${blogCreated.body.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send(updateBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)

  assert.strictEqual(blogsAtEnd.find(b => b.id === blogCreated.body.id).likes, updateBlog.likes)
})


after(async () => {
  await mongoose.connection.close()
})