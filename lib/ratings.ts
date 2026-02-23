import { getDb } from './mongodb'
import { ObjectId } from 'mongodb'

export interface RatingRecord {
  id: string
  name: string
  email: string
  rating: number
  note?: string
  createdAt: string
}

interface RatingDoc {
  _id?: ObjectId
  id: string
  name: string
  email: string
  rating: number
  note?: string
  createdAt: Date
}

const RATINGS_COLLECTION = 'ratings'

function docToRecord(doc: RatingDoc): RatingRecord {
  return {
    id: doc.id,
    name: doc.name,
    email: doc.email,
    rating: doc.rating,
    note: doc.note,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
  }
}

export async function getAllRatings(): Promise<RatingRecord[]> {
  const db = await getDb()
  const coll = db.collection<RatingDoc>(RATINGS_COLLECTION)
  const docs = await coll.find({}).sort({ createdAt: -1 }).toArray()
  return docs.map(docToRecord)
}

export async function deleteRating(id: string): Promise<boolean> {
  if (!id || typeof id !== 'string') return false
  const db = await getDb()
  const coll = db.collection<RatingDoc>(RATINGS_COLLECTION)
  if (ObjectId.isValid(id) && id.length === 24) {
    const result = await coll.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount === 1
  }
  const result = await coll.deleteOne({ id })
  return result.deletedCount === 1
}
