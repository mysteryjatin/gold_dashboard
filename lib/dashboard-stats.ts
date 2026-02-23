import { getDb, USERS_COLLECTION } from './mongodb'
import { getAllOrders, getCompletedOrders, getOrdersByDateRange } from './orders'
import { getAllRatings } from './ratings'

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

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const db = await getDb()
    
    // Get all orders
    const allOrders = await getAllOrders()
    console.log(`Found ${allOrders.length} total orders`)
    
    const completedOrders = await getCompletedOrders()
    console.log(`Found ${completedOrders.length} completed orders`)
    
    // Calculate total balance (sum of ALL orders - pending + completed)
    // This shows total revenue including pending orders
    const totalBalance = allOrders.reduce((sum, order) => sum + order.totalUSD, 0)
    console.log(`Total balance calculated: $${totalBalance}`)
    
    // Calculate monthly profit (ALL orders this month - pending + completed)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyOrders = allOrders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startOfMonth && orderDate <= now
    })
    console.log(`Found ${monthlyOrders.length} orders this month`)
    
    const monthlyProfit = monthlyOrders.reduce((sum, order) => sum + order.totalUSD, 0)
    const monthlyRevenue = monthlyProfit
    console.log(`Monthly profit calculated: $${monthlyProfit}`)
    
    // Count active bots (from ALL orders - count unique bot products)
    const allBotItems = allOrders
      .flatMap((order) => order.items)
      .filter((item) => {
        const name = item.name.toLowerCase()
        return name.includes('bot') || name.includes('ea') || name.includes('expert') || name.includes('trading')
      })
    
    const activeBots = new Set(allBotItems.map((item) => item.id)).size
    
    // If no bot items found by name, count unique products from all orders
    const uniqueProducts = activeBots === 0 
      ? new Set(allOrders.flatMap((order) => order.items.map((item) => item.id))).size
      : activeBots
    
    console.log(`Active bots/products: ${uniqueProducts}`)
    
    // Count total users (from users collection + unique customers from orders)
    const usersCollection = db.collection(USERS_COLLECTION)
    const userCount = await usersCollection.countDocuments()
    const uniqueCustomers = new Set(allOrders.map((order) => order.customer.email)).size
    const totalUsers = Math.max(userCount, uniqueCustomers)
    console.log(`Total users: ${totalUsers} (from collection: ${userCount}, unique customers: ${uniqueCustomers})`)
    
    // Get ratings stats
    const ratings = await getAllRatings()
    const totalRatings = ratings.length
    const averageRating =
      totalRatings > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings : 0
    
    // Order stats
    const totalOrders = allOrders.length
    const pendingOrders = allOrders.filter((o) => o.status === 'pending').length
    const completedOrdersCount = completedOrders.length
    
    const stats = {
      totalBalance: Math.round(totalBalance * 100) / 100,
      activeBots: uniqueProducts || 0,
      monthlyProfit: Math.round(monthlyProfit * 100) / 100,
      totalUsers,
      totalOrders,
      pendingOrders,
      completedOrders: completedOrdersCount,
      totalRatings,
      averageRating: Math.round(averageRating * 10) / 10,
      monthlyOrders: monthlyOrders.length,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
    }
    
    console.log('Final dashboard stats:', stats)
    return stats
  } catch (error) {
    console.error('Error calculating dashboard stats:', error)
    throw error
  }
}
