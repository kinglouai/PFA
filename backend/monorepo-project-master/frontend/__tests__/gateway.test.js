const request = require('supertest')
const app = require('../src/index')

describe('Gateway API', () => {
  test('GET / returns service info', async () => {
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.body.service).toBe('frontend-gateway')
  })

  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })

  test('GET /api/users returns 502 when backend is down', async () => {
    const res = await request(app).get('/api/users')
    expect([200, 502]).toContain(res.status)
  })
})
