import { getAllOrders, getCompletedOrders, getOrdersByDateRange } from './orders'

export interface AnalyticsStats {
  totalRevenue: number
  pageViews: number
  conversionRate: number
  activeSessions: number
  revenueTrend: number // percentage change
  pageViewsTrend: number // percentage change
  conversionRateTrend: number // percentage change
  activeSessionsTrend: string // description
}

export interface PerformanceDataPoint {
  date: string
  pnl: number
  equity: number
}

export interface DistributionData {
  name: string
  value: number
  color: string
}

export interface TopPerformingEA {
  name: string
  sales: number
  revenue: number
  winRate: string
}

export interface AnalyticsData {
  stats: AnalyticsStats
  performanceData: PerformanceDataPoint[]
  distributionData: DistributionData[]
  topPerformingEAs: TopPerformingEA[]
}

// Color mapping for products (you can customize these)
const PRODUCT_COLORS: Record<string, string> = {
  'Gold Sniper EA Bot': '#E6B566',
  'Crypto Sniper EA Bot': '#4B82FF',
  'Forex Sniper EA Bot': '#22C55E',
}

function getProductColor(productName: string): string {
  // Try exact match first
  if (PRODUCT_COLORS[productName]) {
    return PRODUCT_COLORS[productName]
  }
  
  // Try partial match
  const lowerName = productName.toLowerCase()
  if (lowerName.includes('gold')) return '#E6B566'
  if (lowerName.includes('crypto')) return '#4B82FF'
  if (lowerName.includes('forex')) return '#22C55E'
  
  // Default colors for other products
  const colors = ['#E6B566', '#4B82FF', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899']
  const hash = productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

function calculateWinRate(productName: string, totalSales: number): string {
  // Simulate win rate based on product name and sales
  // In a real scenario, this would come from trading data
  const baseRate = 60
  const nameHash = productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const variation = (nameHash % 15) - 7 // -7 to +7 variation
  const winRate = baseRate + variation + Math.min(totalSales / 10, 5) // Slight boost for popular products
  return `${Math.min(Math.max(Math.round(winRate), 50), 85)}%`
}

interface PageViewsResponse {
  pageViews?: number
  totalViews?: number
  views?: number
  current?: number
  // Support for different API response formats
  [key: string]: any
}

/**
 * Fetches page views from external digital marketing API
 * Falls back to estimated calculation if API is unavailable
 */
async function fetchPageViewsFromAPI(): Promise<{ current: number; lastMonth: number } | null> {
  const apiUrl = process.env.DIGITAL_MARKETING_API_URL
  const apiKey = process.env.DIGITAL_MARKETING_API_KEY
  
  if (!apiUrl) {
    console.log('DIGITAL_MARKETING_API_URL not configured, using fallback calculation')
    return null
  }

  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`
      // Also support API key in header
      headers['X-API-Key'] = apiKey
    }

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      // Fetch current month page views
      const currentMonthParams = new URLSearchParams({
        startDate: startOfMonth.toISOString(),
        endDate: now.toISOString(),
      })
      
      const currentResponse = await fetch(`${apiUrl}?${currentMonthParams.toString()}`, {
        method: 'GET',
        headers,
        signal: controller.signal,
      })

      if (!currentResponse.ok) {
        throw new Error(`API returned ${currentResponse.status}: ${currentResponse.statusText}`)
      }

      const currentData: PageViewsResponse = await currentResponse.json()
      
      // Fetch last month page views
      const lastMonthParams = new URLSearchParams({
        startDate: startOfLastMonth.toISOString(),
        endDate: endOfLastMonth.toISOString(),
      })
      
      const lastMonthResponse = await fetch(`${apiUrl}?${lastMonthParams.toString()}`, {
        method: 'GET',
        headers,
        signal: controller.signal,
      })

      const lastMonthData: PageViewsResponse = lastMonthResponse.ok 
        ? await lastMonthResponse.json()
        : { pageViews: 0 }

      clearTimeout(timeoutId)

      // Extract page views from response (support multiple formats)
      const currentViews = 
        currentData.pageViews ?? 
        currentData.totalViews ?? 
        currentData.views ?? 
        currentData.current ?? 
        currentData.count ??
        0

      const lastMonthViews = 
        lastMonthData.pageViews ?? 
        lastMonthData.totalViews ?? 
        lastMonthData.views ?? 
        lastMonthData.current ?? 
        lastMonthData.count ??
        0

      return {
        current: typeof currentViews === 'number' ? currentViews : parseInt(String(currentViews), 10) || 0,
        lastMonth: typeof lastMonthViews === 'number' ? lastMonthViews : parseInt(String(lastMonthViews), 10) || 0,
      }
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Page views API request timed out after 10 seconds')
    } else {
      console.error('Error fetching page views from digital marketing API:', error)
    }
    console.log('Falling back to estimated calculation')
    return null
  }
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get all orders
    const allOrders = await getAllOrders()
    const completedOrders = await getCompletedOrders()
    
    // Get orders for last 30 days
    const ordersLast30Days = await getOrdersByDateRange(thirtyDaysAgo, now)
    
    // Get orders for current month
    const ordersThisMonth = allOrders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startOfMonth && orderDate <= now
    })
    
    // Get orders for last month
    const ordersLastMonth = allOrders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startOfLastMonth && orderDate <= endOfLastMonth
    })

    // Calculate Total Revenue (from completed orders)
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalUSD, 0)
    const revenueThisMonth = ordersThisMonth
      .filter((o) => o.status === 'completed')
      .reduce((sum, order) => sum + order.totalUSD, 0)
    const revenueLastMonth = ordersLastMonth
      .filter((o) => o.status === 'completed')
      .reduce((sum, order) => sum + order.totalUSD, 0)
    const revenueTrend = revenueLastMonth > 0 
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 
      : 0

    // Fetch Page Views from external digital marketing API
    const apiPageViews = await fetchPageViewsFromAPI()
    
    let pageViews: number
    let pageViewsLastMonth: number
    
    if (apiPageViews) {
      // Use data from external API
      pageViews = apiPageViews.current
      pageViewsLastMonth = apiPageViews.lastMonth
    } else {
      // Fallback: estimate based on orders if API is unavailable
      const uniqueCustomers = new Set(allOrders.map((order) => order.customer.email)).size
      pageViews = uniqueCustomers * 3 + allOrders.length * 2 // Rough estimate
      pageViewsLastMonth = ordersLastMonth.length * 2 + new Set(ordersLastMonth.map((o) => o.customer.email)).size * 3
    }
    
    const pageViewsTrend = pageViewsLastMonth > 0 
      ? ((pageViews - pageViewsLastMonth) / pageViewsLastMonth) * 100 
      : 0

    // Calculate Conversion Rate (completed orders / total orders)
    const conversionRate = allOrders.length > 0 
      ? (completedOrders.length / allOrders.length) * 100 
      : 0
    const conversionRateLastMonth = ordersLastMonth.length > 0
      ? (ordersLastMonth.filter((o) => o.status === 'completed').length / ordersLastMonth.length) * 100
      : 0
    const conversionRateTrend = conversionRate - conversionRateLastMonth

    // Calculate Active Sessions (unique customers in last 30 days)
    const activeSessions = new Set(ordersLast30Days.map((order) => order.customer.email)).size

    // Calculate Performance Data (revenue over time - last 30 days, grouped by day)
    const performanceData: PerformanceDataPoint[] = []
    const dailyRevenue: Map<string, number> = new Map()

    // Group orders by day
    ordersLast30Days
      .filter((o) => o.status === 'completed')
      .forEach((order) => {
        const orderDate = new Date(order.createdAt)
        const dateKey = orderDate.toISOString().split('T')[0]
        const current = dailyRevenue.get(dateKey) || 0
        dailyRevenue.set(dateKey, current + order.totalUSD)
      })

    // Calculate revenue before the 30-day period (for baseline equity)
    const revenueBefore30Days = completedOrders
      .filter((order) => {
        const orderDate = new Date(order.createdAt)
        return orderDate < thirtyDaysAgo
      })
      .reduce((sum, order) => sum + order.totalUSD, 0)

    // Create data points for each day in last 30 days
    let cumulativeEquity = revenueBefore30Days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateKey = date.toISOString().split('T')[0]
      const dayRevenue = dailyRevenue.get(dateKey) || 0
      cumulativeEquity += dayRevenue // Add daily revenue to cumulative
      
      const month = date.toLocaleDateString('en-US', { month: 'short' })
      const day = date.getDate()
      performanceData.push({
        date: `${month} ${day}`,
        pnl: dayRevenue,
        equity: cumulativeEquity, // Show cumulative equity
      })
    }

    // Calculate Distribution Data (by product sales percentage)
    const productSales: Map<string, number> = new Map()
    completedOrders.forEach((order) => {
      order.items.forEach((item) => {
        const current = productSales.get(item.name) || 0
        productSales.set(item.name, current + 1)
      })
    })

    const totalSales = Array.from(productSales.values()).reduce((sum, count) => sum + count, 0)
    const distributionData: DistributionData[] = Array.from(productSales.entries())
      .map(([name, count]) => ({
        name,
        value: totalSales > 0 ? Math.round((count / totalSales) * 100) : 0,
        color: getProductColor(name),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6) // Top 6 products

    // Calculate Top Performing EAs (last 30 days)
    const productStats: Map<string, { sales: number; revenue: number }> = new Map()
    
    ordersLast30Days
      .filter((o) => o.status === 'completed')
      .forEach((order) => {
        order.items.forEach((item) => {
          const current = productStats.get(item.name) || { sales: 0, revenue: 0 }
          productStats.set(item.name, {
            sales: current.sales + 1,
            revenue: current.revenue + item.priceUSD,
          })
        })
      })

    const topPerformingEAs: TopPerformingEA[] = Array.from(productStats.entries())
      .map(([name, stats]) => ({
        name,
        sales: stats.sales,
        revenue: stats.revenue,
        winRate: calculateWinRate(name, stats.sales),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10) // Top 10 products

    return {
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        pageViews,
        conversionRate: Math.round(conversionRate * 10) / 10,
        activeSessions,
        revenueTrend: Math.round(revenueTrend * 10) / 10,
        pageViewsTrend: Math.round(pageViewsTrend * 10) / 10,
        conversionRateTrend: Math.round(conversionRateTrend * 10) / 10,
        activeSessionsTrend: 'This month',
      },
      performanceData,
      distributionData,
      topPerformingEAs,
    }
  } catch (error) {
    console.error('Error calculating analytics data:', error)
    throw error
  }
}
