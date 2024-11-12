const express = require('express')
const cors = require('cors')
const app = express()

// Middleware
app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

// In-memory storage
let users = []
let exercises = []

// Create a new user
app.post('/api/users', (req, res) => {
  const { username } = req.body
  const user = {
    username,
    _id: (users.length + 1).toString()
  }
  users.push(user)
  res.json(user)
})

// Get list of all users
app.get('/api/users', (req, res) => {
  res.json(users)
})

// Add exercise to a user
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params
  const { description, duration, date } = req.body
  const user = users.find(u => u._id === _id)

  if (!user) return res.status(404).json({ error: 'User not found' })

  const exercise = {
    _id: user._id,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  }

  exercises.push(exercise)

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: user._id
  })
})

// Get exercise log for a user
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params
  const { from, to, limit } = req.query
  const user = users.find(u => u._id === _id)

  if (!user) return res.status(404).json({ error: 'User not found' })

  let userExercises = exercises.filter(e => e._id === _id)

  // Filter by date range if provided
  if (from) userExercises = userExercises.filter(e => new Date(e.date) >= new Date(from))
  if (to) userExercises = userExercises.filter(e => new Date(e.date) <= new Date(to))

  // Apply limit if provided
  if (limit) userExercises = userExercises.slice(0, limit)

  res.json({
    username: user.username,
    count: userExercises.length,
    _id: user._id,
    log: userExercises.map(({ description, duration, date }) => ({
      description,
      duration,
      date
    }))
  })
})

// Start server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
