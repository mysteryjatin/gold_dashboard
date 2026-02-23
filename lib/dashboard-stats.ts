import { getDb, USERS_COLLECTION, ORDERS_COLLECTION, RATINGS_COLLECTION } from './mongodb'

export interface DashboardStats {
  totalBalance: number
  activeBots: number
  monthlyProfit: number
  totalUsers: number
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRatings: number
  averageRating: number
  monthlyOrders: number
  monthlyRevenue: number
}

interface OrderAggregationResult {
  orderTotals: { totalOrders: number; totalBalance: number }[]
  byStatus: { _id: string; count: number }[]
  monthly: { monthlyOrders: number; monthlyRevenue: number }[]
  uniqueCustomers: { count: number }[]
  botProducts: { n: number }[]
  allProducts: { n: number }[]
}

/** Compute dashboard stats using a single aggregation + small queries instead of loading all orders. */
export async function getDashboardStats(): Promise<DashboardStats> {
  const db = await getDb()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const ordersColl = db.collection(ORDERS_COLLECTION)

  const [orderResult, userCount, ratingsAgg] = await Promise.all([
    ordersColl
      .aggregate<OrderAggregationResult>([
        {
          $facet: {
            orderTotals: [
              {
                $group: {
                  _id: null,
                  totalOrders: { $sum: 1 },
                  totalBalance: { $sum: { $ifNull: ['$totalUSD', 0] } },
                },
              },
            ],
            byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
            monthly: [
              {
                $match: {
                  createdAt: { $gte: startOfMonth, $lte: now },
                },
              },
              {
                $group: {
                  _id: null,
                  monthlyOrders: { $sum: 1 },
                  monthlyRevenue: { $sum: { $ifNull: ['$totalUSD', 0] } },
                },
              },
            ],
            uniqueCustomers: [
              { $group: { _id: { $ifNull: ['$customer.email', ''] } } },
              { $count: 'count' } as { $count: string },
            ],
            botProducts: [
              { $unwind: '$items' },
              {
                $match: {
                  $or: [
                    { 'items.name': { $regex: /bot/i } },
                    { 'items.name': { $regex: /\bea\b/i } },
                    { 'items.name': { $regex: /expert/i } },
                    { 'items.name': { $regex: /trading/i } },
                  ],
                },
              },
              { $group: { _id: '$items.id' } },
              { $count: 'n' } as { $count: string },
            ],
            allProducts: [
              { $unwind: '$items' },
              { $group: { _id: '$items.id' } },
              { $count: 'n' } as { $count: string },
            ],
          },
        },
      ])
      .next(),
    db.collection(USERS_COLLECTION).countDocuments(),
    db
      .collection(RATINGS_COLLECTION)
      .aggregate<{ totalRatings: number; averageRating: number }>([
        {
          $group: {
            _id: null,
            totalRatings: { $sum: 1 },
            averageRating: { $avg: '$rating' },
          },
        },
      ])
      .next(),
  ])

  const facet = orderResult?.orderTotals?.[0]
  const byStatus = orderResult?.byStatus ?? []
  const monthly = orderResult?.monthly?.[0]
  const uniqueCustomers = orderResult?.uniqueCustomers?.[0]?.count ?? 0
  const botProducts = orderResult?.botProducts?.[0]?.n ?? 0
  const allProducts = orderResult?.allProducts?.[0]?.n ?? 0

  const totalOrders = facet?.totalOrders ?? 0
  const totalBalance = facet?.totalBalance ?? 0
  const pendingOrders = byStatus.find((s) => s._id === 'pending')?.count ?? 0
  const completedOrders = byStatus.find((s) => s._id === 'completed')?.count ?? 0
  const monthlyOrders = monthly?.monthlyOrders ?? 0
  const monthlyRevenue = monthly?.monthlyRevenue ?? 0
  const totalUsers = Math.max(userCount ?? 0, uniqueCustomers)
  const activeBots = botProducts > 0 ? botProducts : allProducts
  const totalRatings = ratingsAgg?.totalRatings ?? 0
  const averageRating = ratingsAgg?.averageRating ?? 0

  return {
    totalBalance: Math.round(totalBalance * 100) / 100,
    activeBots: activeBots || 0,
    monthlyProfit: Math.round(monthlyRevenue * 100) / 100,
    totalUsers,
    totalOrders,
    pendingOrders,
    completedOrders,
    totalRatings,
    averageRating: Math.round(averageRating * 10) / 10,
    monthlyOrders,
    monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
  }
}
