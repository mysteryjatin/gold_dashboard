import { getDb, CONTACTS_COLLECTION } from './mongodb'
import { ObjectId } from 'mongodb'

export interface ContactRecord {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
}

interface ContactDoc {
  _id?: ObjectId
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: Date
}

function docToRecord(doc: ContactDoc): ContactRecord {
  return {
    id: doc.id,
    name: doc.name,
    email: doc.email,
    subject: doc.subject,
    message: doc.message,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
  }
}

export async function getAllContacts(): Promise<ContactRecord[]> {
  const db = await getDb()
  const coll = db.collection<ContactDoc>(CONTACTS_COLLECTION)
  const docs = await coll.find({}).sort({ createdAt: -1 }).toArray()
  return docs.map(docToRecord)
}
