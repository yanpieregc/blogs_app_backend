import Blog from '../models/blog.js'
import User from '../models/user.js'

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5
  }
]

const initialUsers = [
  {
    username: "yanpiere",
    name: "yanp",
    password: "123456"
  },
  {
    username: "root",
    name: "Superuser",
    password: "654321"
  }
]


const nonExistingId = async () => {
  const blog = new Blog({ 
    title: 'willremovethissoon',
    author: 'willremovethissoon',
    url: 'willremovethissoon',
    likes: 0
  })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const testUser = {
  username: "test",
  name: "Test User",
  password: "123456"
}

async function getValidToken(api) {
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: testUser.username,
      password: testUser.password
    })
  
  if (loginResponse.status !== 200) {
    throw new Error(`Login failed: ${loginResponse.body.error}`)
  }
  
  return loginResponse.body.token
}

export default { initialBlogs, initialUsers, nonExistingId, blogsInDb, usersInDb, getValidToken, testUser }