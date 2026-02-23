import { MongoClient, Db, MongoClientOptions } from 'mongodb'

const dbName = process.env.MONGODB_DB_NAME || 'goldenedge'

async function ensureIndexes(db: Db): Promise<void> {
  const orders = db.collection('orders')
  const ratings = db.collection('ratings')
  await Promise.all([
    orders.createIndex({ status: 1, createdAt: -1 }),
    orders.createIndex({ createdAt: -1 }),
    ratings.createIndex({ createdAt: -1 }),
  ])
}

function getUri(): string {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('Please set MONGODB_URI in .env')
  return uri
}

function getClientOptions(): MongoClientOptions {
  // Use longer timeouts for Atlas (e.g. cold start or slow network). Default 30s.
  const timeoutMs = Number(process.env.MONGODB_TIMEOUT_MS) || 30000
  const options: MongoClientOptions = {
    serverSelectionTimeoutMS: timeoutMs,
    connectTimeoutMS: timeoutMs,
  }
  // On some servers (older OpenSSL/Node), Atlas TLS can fail with "tlsv1 alert internal error".
  // Set MONGODB_TLS_ALLOW_INVALID_CERTIFICATES=true only as a last resort on the server.
  if (process.env.MONGODB_TLS_ALLOW_INVALID_CERTIFICATES === 'true') {
    options.tlsAllowInvalidCertificates = true
  }
  return options
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
  // eslint-disable-next-line no-var
  var _mongoIndexesPromise: Promise<void> | undefined
}

function getClientPromise(): Promise<MongoClient> {
  const uri = getUri()
  const options = getClientOptions()
  // Reuse a single connection in both dev and production so every API request
  // doesn't pay for a new MongoDB connection (especially slow to Atlas from a VPS).
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri, options).connect()
  }
  return global._mongoClientPromise
}

export async function getDb(): Promise<Db> {
  try {
    const client = await getClientPromise()
    const db = client.db(dbName)
    if (!global._mongoIndexesPromise) {
      global._mongoIndexesPromise = ensureIndexes(db)
    }
    await global._mongoIndexesPromise
    return db
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('timed out') || msg.includes('Server selection')) {
      const hint =
        ' Check MongoDB Atlas: Network Access → add your current IP (or 0.0.0.0/0 for testing), and ensure the cluster is running.'
      throw new Error(msg + hint)
    }
    throw err
  }
}

export const USERS_COLLECTION = 'users'
export const ORDERS_COLLECTION = 'orders'
export const RATINGS_COLLECTION = 'ratings'
export const CONTACTS_COLLECTION = 'contacts'
