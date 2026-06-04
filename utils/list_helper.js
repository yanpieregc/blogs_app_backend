import _ from 'lodash'

const dummy = (blogs) => {
  return 1
}

const totalLikes =  (blogs) => {
  const likes = blogs.map(b => b.likes)
  const suma = likes.reduce((acc, val) => acc + val, 0)

  return blogs.length === 0
    ? 0
    : suma
}

const favoriteBlogs = (blogs) => {
  const likes = blogs.map(b => b.likes)
  const max = Math.max(...likes)
  const blogWithMostLikes = blogs.find(b => b.likes === max)

  return blogs.length === 0
    ? 0
    : {
        "title": blogWithMostLikes.title,
        "author": blogWithMostLikes.author,
        "likes": blogWithMostLikes.likes
      }
}

const mostBlogs = (blogs) => {
  const authors = blogs.map(b => b.author)
  const countAuthors = _.countBy(authors)
  const keys = _.keys(countAuthors)
  const values = _.values(countAuthors)
  const maxValue = _.maxBy(values)
  const maxKey = _.maxBy(keys, key => countAuthors[key])

  return blogs.length === 0
    ? 0
    : {
        "author": maxKey,
        "blogs": maxValue
      }
}

const mostLikes = (blogs) => {
  const newBlog = blogs.map(b => {
    return {[b.author]: b.likes}
  })
  
  const sumLikes = _.mergeWith({}, ...newBlog, (objValue, srcValue) => {
    if (_.isNumber(objValue)) {
      return objValue + srcValue;
    }
  })

  const keys = _.keys(sumLikes)
  const values = _.values(sumLikes)
  const maxValue = _.maxBy(values)
  const maxKey = _.maxBy(keys, key => sumLikes[key])

  return blogs.length === 0
    ? 0
    : {
        "author": maxKey,
        "likes": maxValue
      }
}

export default { dummy, totalLikes, favoriteBlogs, mostBlogs, mostLikes }
