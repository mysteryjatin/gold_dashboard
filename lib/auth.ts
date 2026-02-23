import { getDb, USERS_COLLECTION } from './mongodb'
import bcrypt from 'bcryptjs'
import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  email: string
  password: string
  name?: string
  createdAt: Date
  updatedAt: Date
}

/** When MongoDB is unreachable in development, allow login with this demo user. Set USE_OFFLINE_AUTH=true in .env */
const OFFLINE_DEMO_EMAIL = 'demo@goldenedge.ai'
const OFFLINE_DEMO_PASSWORD = 'demo123'
export const OFFLINE_DEMO_USER_ID = '000000000000000000000001'

export function getOfflineDemoUser(): User | null {
  if (process.env.NODE_ENV !== 'development' || process.env.USE_OFFLINE_AUTH !== 'true') {
    return null
  }
  return {
    _id: new ObjectId(OFFLINE_DEMO_USER_ID),
    email: OFFLINE_DEMO_EMAIL,
    password: '', // not used; login checks plain password when offline
    name: 'Demo User',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export function isOfflineDemoUserId(userId: string): boolean {
  return getOfflineDemoUser() !== null && userId === OFFLINE_DEMO_USER_ID
}

export function isOfflineDemoLogin(email: string, password: string): boolean {
  const demo = getOfflineDemoUser()
  if (!demo) return false
  return email.trim().toLowerCase() === demo.email.toLowerCase() && password === OFFLINE_DEMO_PASSWORD
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDb()
  const user = await db.collection<User>(USERS_COLLECTION).findOne({
    email: email.toLowerCase().trim(),
  })
  return user
}

export async function createUser(email: string, password: string, name?: string): Promise<User> {
  const db = await getDb()
  const hashedPassword = await bcrypt.hash(password, 10)
  
  const user: User = {
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    name: name || 'Girish Sharma!',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  const result = await db.collection<User>(USERS_COLLECTION).insertOne(user)
  return { ...user, _id: result.insertedId }
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function findUserById(userId: string): Promise<User | null> {
  const db = await getDb()
  try {
    const user = await db.collection<User>(USERS_COLLECTION).findOne({
      _id: new ObjectId(userId),
    })
    return user
  } catch (error) {
    return null
  }
}

export async function updateUserName(userId: string, name: string): Promise<User | null> {
  const db = await getDb()
  try {
    const result = await db.collection<User>(USERS_COLLECTION).findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: {
          name: name.trim(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    )
    return result || null
  } catch (error) {
    console.error('Error updating user name:', error)
    return null
  }
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
  const db = await getDb()
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    const result = await db.collection<User>(USERS_COLLECTION).updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    )
    return result.modifiedCount === 1
  } catch (error) {
    console.error('Error updating password:', error)
    return false
  }
}

/** Safe user record for admin list (no password). */
export interface UserListRecord {
  id: string
  email: string
  name: string
  createdAt: string
}

export async function getAllUsersForAdmin(): Promise<UserListRecord[]> {
  const db = await getDb()
  const cursor = db
    .collection<User>(USERS_COLLECTION)
    .find({}, { projection: { password: 0 } })
    .sort({ createdAt: -1 })
  const docs = await cursor.toArray()
  return docs.map((doc) => ({
    id: doc._id!.toString(),
    email: doc.email,
    name: doc.name ?? '',
    createdAt:
      doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
  }))
}
