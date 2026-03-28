import { getDb } from './mongodb'
import { ObjectId } from 'mongodb'
import { getProductSalesStats } from './orders'

export type ProductType = 'Gold' | 'Forex' | 'Other'
export type ProductStatus = 'active' | 'beta' | 'inactive'

/** Fixed list of the core EA bots – names must match order item names for sales aggregation. */
export const STATIC_BOT_NAMES = [
  'Gold Sniper EA Bot',
  'Forex Sniper EA Bot',
] as const

export const STATIC_BOTS: { id: string; name: string; type: ProductType; status: ProductStatus }[] = [
  { id: 'gold', name: STATIC_BOT_NAMES[0], type: 'Gold', status: 'active' },
  { id: 'forex', name: STATIC_BOT_NAMES[1], type: 'Forex', status: 'active' },
]

export interface BotWithSales {
  id: string
  name: string
  type: ProductType
  status: ProductStatus
  salesCount: number
  totalRevenue: number
}

export async function getBotsWithSales(): Promise<BotWithSales[]> {
  const sales = await getProductSalesStats([...STATIC_BOT_NAMES])
  const salesByName = new Map(sales.map((s) => [s.productName, s]))
  return STATIC_BOTS.map((bot) => {
    const s = salesByName.get(bot.name) ?? { salesCount: 0, totalRevenue: 0 }
    return {
      ...bot,
      salesCount: s.salesCount,
      totalRevenue: s.totalRevenue,
    }
  })
}

export interface ProductRecord {
  id: string
  name: string
  type: ProductType
  status: ProductStatus
  users: number
  profit: number
  winRate: string
  createdAt?: string
}

interface ProductDoc {
  _id?: ObjectId
  id: string
  name: string
  type: ProductType
  status: ProductStatus
  users: number
  profit: number
  winRate: string
  createdAt: Date
}

const PRODUCTS_COLLECTION = 'products'

function docToRecord(doc: ProductDoc): ProductRecord {
  return {
    id: doc.id,
    name: doc.name,
    type: doc.type,
    status: doc.status,
    users: doc.users,
    profit: doc.profit,
    winRate: doc.winRate,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : undefined,
  }
}

export async function getAllProducts(): Promise<ProductRecord[]> {
  const db = await getDb()
  const coll = db.collection<ProductDoc>(PRODUCTS_COLLECTION)
  const docs = await coll.find({}).sort({ createdAt: -1 }).toArray()
  return docs.map(docToRecord)
}

export async function createProduct(input: Omit<ProductRecord, 'id' | 'createdAt'>): Promise<ProductRecord> {
  const db = await getDb()
  const coll = db.collection<ProductDoc>(PRODUCTS_COLLECTION)
  const id = new ObjectId().toString()
  const doc: ProductDoc = {
    id,
    name: input.name,
    type: input.type,
    status: input.status,
    users: input.users,
    profit: input.profit,
    winRate: input.winRate,
    createdAt: new Date(),
  }
  await coll.insertOne(doc)
  return docToRecord(doc)
}
