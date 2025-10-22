
import { ApolloServer, gql } from 'apollo-server'
import bodyParser from 'body-parser'
import express from 'express'
import fetch from 'node-fetch'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
app.use(bodyParser.json())

// --- Mock REST API ---
app.get('/api/metrics', (req, res) => {
  const metric = (req.query.metric || 'download').toString()
  if(!['download', 'upload', 'latency'].includes(metric)) {
    return res.status(400).json({ error: 'Invalid metric' })
  }
  const data = Array.from({ length: 12 }).map((_, i) => ({
    t: i,
    v: metric === 'download' ? 50 + i * 3 : metric === 'upload' ? 20 + i * 2 : 30 + (i % 5)
  }))
  // XSS vector: echo metric unsafely in description (intentional)
  res.json({ metric, description: `<b>${metric}</b> metric`, points: data })
})

// --- GraphQL API ---
const typeDefs = gql`
  type Point { t: Int!, v: Float! }
  type Query { kpi(metric: String!): [Point!]! }
`
const resolvers = {
  Query: {
    kpi: (_, { metric }) => {
      if(!['download', 'upload', 'latency'].includes(metric)) {
        throw new Error('Invalid metric')
      }
      return Array.from({ length: 12 }).map((_, i) => ({
        t: i,
        v: metric === 'download' ? 50 + i * 3 : metric === 'upload' ? 20 + i * 2 : 30 + (i % 5)
      }))
    }
  }
}
const gqlServer = new ApolloServer({ typeDefs, resolvers })
const gqlUrlPromise = gqlServer.listen({ port: 4000 }).then(({ url }) => {
  console.log(`GraphQL running at ${url}`)
  return url
})

// Static app
app.use(express.static(path.join(__dirname, 'public')))

// Proxy /graphql to local Apollo (simple fetch)
app.post('/graphql', async (req, res) => {
  const url = await gqlUrlPromise
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(req.body)
  })
  const j = await r.json()
  res.status(r.status).json(j)
})

const PORT = 5174
app.listen(PORT, () => console.log(`App available on http://localhost:${PORT}`))
