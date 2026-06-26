const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const axios = require('axios')

const app = express()
const PORT = process.env.PORT || 3000
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'
const MAILER_URL = process.env.MAILER_URL || 'http://localhost:8080'

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ service: 'frontend-gateway', status: 'running' })
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'frontend' })
})

app.get('/api/users', async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/users/`)
    res.json(response.data)
  } catch (err) {
    res.status(502).json({ error: 'Backend unavailable', detail: err.message })
  }
})

app.post('/api/notify', async (req, res) => {
  try {
    const response = await axios.post(`${MAILER_URL}/api/send`, req.body)
    res.json(response.data)
  } catch (err) {
    res.status(502).json({ error: 'Mailer unavailable', detail: err.message })
  }
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`))
}

module.exports = app
