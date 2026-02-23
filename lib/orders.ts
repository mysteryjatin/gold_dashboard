import { getDb } from './mongodb'
import { ObjectId } from 'mongodb'

export interface OrderItem {
  id: string
  name: string
  description?: string
  price: string
  priceUSD: number
  type: 'main' | 'upsell'
}

export interface OrderCustomer {
  name: string
  email: string
  phone: string
  mt5UserId?: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface OrderRecord {
  id: string
  customer: OrderCustomer
  items: OrderItem[]
  totalUSD: number
  currency: string
  status: 'pending' | 'completed' | 'cancelled'
  paymentMethod?: string
  createdAt: string
}

interface OrderDoc {
  _id?: ObjectId
  id: string
  customer: OrderCustomer
  items: OrderItem[]
  totalUSD: number
  currency: string
  status: 'pending' | 'completed' | 'cancelled'
  paymentMethod?: string
  createdAt: Date
}

const ORDERS_COLLECTION = 'orders'

function docToRecord(doc: OrderDoc): OrderRecord {
  return {
    id: doc.id,
    customer: doc.customer,
    items: doc.items,
    totalUSD: doc.totalUSD,
    currency: doc.currency,
    status: doc.status,
    paymentMethod: doc.paymentMethod,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
  }
}

export async function getAllOrders(): Promise<OrderRecord[]> {
  const db = await getDb()
  const coll = db.collection<OrderDoc>(ORDERS_COLLECTION)
  const docs = await coll.find({}).sort({ createdAt: -1 }).toArray()
  return docs.map(docToRecord)
}

/** Fetch only the N most recent orders (e.g. for dashboard). Uses index, no full scan. */
export async function getRecentOrders(limit: number = 10): Promise<OrderRecord[]> {
  const db = await getDb()
  const coll = db.collection<OrderDoc>(ORDERS_COLLECTION)
  const docs = await coll
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
  return docs.map(docToRecord)
}

export async function getCompletedOrders(): Promise<OrderRecord[]> {
  const db = await getDb()
  const coll = db.collection<OrderDoc>(ORDERS_COLLECTION)
  const docs = await coll.find({ status: 'completed' }).sort({ createdAt: -1 }).toArray()
  return docs.map(docToRecord)
}

export async function getPendingOrders(): Promise<OrderRecord[]> {
  const db = await getDb()
  const coll = db.collection<OrderDoc>(ORDERS_COLLECTION)
  const docs = await coll.find({ status: 'pending' }).sort({ createdAt: -1 }).toArray()
  return docs.map(docToRecord)
}

export async function getPendingManualOrders(): Promise<OrderRecord[]> {
  const db = await getDb()
  const coll = db.collection<OrderDoc>(ORDERS_COLLECTION)
  const docs = await coll
    .find({ status: 'pending', paymentMethod: 'manual' })
    .sort({ createdAt: -1 })
    .toArray()
  return docs.map(docToRecord)
}

export async function getOrdersByDateRange(startDate: Date, endDate: Date): Promise<OrderRecord[]> {
  const db = await getDb()
  const coll = db.collection<OrderDoc>(ORDERS_COLLECTION)
  const docs = await coll
    .find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
      status: 'completed',
    })
    .sort({ createdAt: -1 })
    .toArray()
  return docs.map(docToRecord)
}

export type OrderStatus = 'pending' | 'completed' | 'cancelled'

/** Update order status by application id (e.g. order_xxx). Returns updated order or null. */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<OrderRecord | null> {
  if (!orderId || !['pending', 'completed', 'cancelled'].includes(status)) {
    return null
  }
  const db = await getDb()
  const coll = db.collection<OrderDoc>(ORDERS_COLLECTION)
  const result = await coll.findOneAndUpdate(
    { id: orderId },
    { $set: { status } },
    { returnDocument: 'after' }
  )
  if (!result) return null
  return docToRecord(result)
}

export interface ProductSalesStats {
  productName: string
  salesCount: number
  totalRevenue: number
}

/** Aggregate sales from completed orders by matching order item names to the given product names. */
export async function getProductSalesStats(
  productNames: string[]
): Promise<ProductSalesStats[]> {
  const orders = await getCompletedOrders()
  const nameSet = new Set(productNames.map((n) => n.trim().toLowerCase()))
  const byName = new Map<string, { salesCount: number; totalRevenue: number }>()
  for (const name of productNames) {
    byName.set(name, { salesCount: 0, totalRevenue: 0 })
  }

  for (const order of orders) {
    const orderContained = new Set<string>()
    for (const item of order.items) {
      const itemName = (item.name || '').trim()
      const key = productNames.find(
        (p) => p.trim().toLowerCase() === itemName.toLowerCase()
      )
      if (key) {
        const stats = byName.get(key)!
        stats.totalRevenue += item.priceUSD ?? 0
        orderContained.add(key)
      }
    }
    for (const key of Array.from(orderContained)) {
      byName.get(key)!.salesCount += 1
    }
  }

  return productNames.map((productName) => {
    const stats = byName.get(productName) ?? { salesCount: 0, totalRevenue: 0 }
    return {
      productName,
      salesCount: stats.salesCount,
      totalRevenue: stats.totalRevenue,
    }
  })
}

/** A customer who bought (from completed orders), aggregated by email. */
export interface CustomerWhoBought {
  email: string
  name: string
  firstOrderAt: string
  orderCount: number
  totalSpent: number
}

/** Unique customers from completed orders (people who bought the bot). */
export async function getCustomersWhoBought(): Promise<CustomerWhoBought[]> {
  const orders = await getCompletedOrders()
  const byEmail = new Map<
    string,
    { name: string; firstOrderAt: Date; orderCount: number; totalSpent: number }
  >()

  for (const order of orders) {
    const email = (order.customer?.email ?? '').trim().toLowerCase()
    if (!email) continue
    const createdAt = new Date(order.createdAt)
    const existing = byEmail.get(email)
    if (existing) {
      existing.orderCount += 1
      existing.totalSpent += order.totalUSD ?? 0
      if (createdAt < new Date(existing.firstOrderAt)) {
        existing.firstOrderAt = createdAt
      }
    } else {
      byEmail.set(email, {
        name: order.customer?.name ?? '',
        firstOrderAt: createdAt,
        orderCount: 1,
        totalSpent: order.totalUSD ?? 0,
      })
    }
  }

  const result: CustomerWhoBought[] = []
  for (const [email, data] of Array.from(byEmail.entries())) {
    result.push({
      email,
      name: data.name,
      firstOrderAt:
        data.firstOrderAt instanceof Date
          ? data.firstOrderAt.toISOString()
          : String(data.firstOrderAt),
      orderCount: data.orderCount,
      totalSpent: data.totalSpent,
    })
  }
  result.sort((a, b) => new Date(b.firstOrderAt).getTime() - new Date(a.firstOrderAt).getTime())
  return result
}

/** A transaction row derived from an order (revenue in). */
export interface TransactionRecord {
  id: string
  type: 'sale'
  amount: number
  method: string
  status: 'pending' | 'completed' | 'cancelled'
  date: string
  customerName?: string
  customerEmail?: string
}

/** Transaction stats from orders. */
export interface TransactionStats {
  totalIn: number
  pendingAmount: number
  completedCount: number
  pendingCount: number
}

/** All orders as transactions (newest first), plus aggregated stats. */
export async function getTransactionsFromOrders(): Promise<{
  transactions: TransactionRecord[]
  stats: TransactionStats
}> {
  const orders = await getAllOrders()
  const transactions: TransactionRecord[] = orders.map((o) => ({
    id: o.id,
    type: 'sale',
    amount: o.totalUSD ?? 0,
    method: o.paymentMethod ?? '—',
    status: o.status,
    date: o.createdAt,
    customerName: o.customer?.name,
    customerEmail: o.customer?.email,
  }))

  let totalIn = 0
  let pendingAmount = 0
  let completedCount = 0
  let pendingCount = 0
  for (const o of orders) {
    const amt = o.totalUSD ?? 0
    if (o.status === 'completed') {
      totalIn += amt
      completedCount += 1
    } else if (o.status === 'pending') {
      pendingAmount += amt
      pendingCount += 1
    }
  }

  return {
    transactions,
    stats: {
      totalIn,
      pendingAmount,
      completedCount,
      pendingCount,
    },
  }
}
