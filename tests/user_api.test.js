import { test, after, beforeEach } from 'node:test'
import mongoose from 'mongoose'
import app from '../app.js'
import supertest from 'supertest'
import assert from 'node:assert'
import User from '../models/user.js'
import helper from '../utils/test_helper.js'

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})

  const userObjects = helper.initialUsers
    .map(user => User(user))

  const promiseArray = userObjects.map(user => user.save())

  await Promise.all(promiseArray)
})


test('users are returned as json', async () => {
  console.log('entered test')
  await api
    .get('/api/users')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all users are returned', async () => {
  const response = await api.get('/api/users')
  assert.strictEqual(response.body.length, helper.initialUsers.length)
})

test('identifier is idn not _id', async () => {
  const response = await api.get('/api/users')
  response.body.forEach(u => {
    assert(u.id)
    assert.strictEqual(u._id, undefined)
  })
})

test('password wrong', async () => {
  const newUser = {
    username: "chavo",
    name: "chav",
    password: "1",
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(400)

  const users = await helper.usersInDb()
  assert.strictEqual(users.length, helper.initialUsers.length)
})

test('username wrong', async () => {
  const newUser = {
    username: "ch",
    name: "chav",
    password: "123456",
  }

  const response = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)

  const users = await helper.usersInDb()
  assert.strictEqual(users.length, helper.initialUsers.length)
})

test('create a new user', async () => {
  const newUser = {
    username: "rondamon",
    name: "ron damon",
    password: "123456",
  }

  const response = await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const users = await helper.usersInDb()
  assert.strictEqual(users.length, helper.initialUsers.length + 1)
})

after(async () => {
  await mongoose.connection.close()
})