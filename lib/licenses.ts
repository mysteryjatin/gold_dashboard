import { ObjectId } from 'mongodb'
import { getDb, LICENSES_COLLECTION } from './mongodb'

export type LicenseStatus = 'unused' | 'used'

export interface LicenseDoc {
  _id?: ObjectId
  licenseKey: string
  status: LicenseStatus
  activatedAccount: number
  activatedAt: Date | null
  activatedIp: string | null
  createdAt: Date
}

export interface LicenseListItem {
  id: string
  licenseKey: string
  status: LicenseStatus
  activatedAccount: number
  activatedAt: string | null
  activatedIp: string | null
  createdAt: string
}

const CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function randomSegment(len: number): string {
  let s = ''
  for (let i = 0; i < len; i++) {
    s += CHARSET[Math.floor(Math.random() * CHARSET.length)]
  }
  return s
}

/** Format: XXXX-XXXX-XXXX-XXXX (16 chars + 3 dashes) */
export function generateLicenseKey(): string {
  return `${randomSegment(4)}-${randomSegment(4)}-${randomSegment(4)}-${randomSegment(4)}`
}

export function normalizeLicenseKey(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '')
}

export async function createLicenseKeys(count: number): Promise<string[]> {
  if (count < 1 || count > 100) {
    throw new Error('Count must be between 1 and 100')
  }
  const db = await getDb()
  const col = db.collection<LicenseDoc>(LICENSES_COLLECTION)
  const keys: string[] = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    let key = generateLicenseKey()
    let attempts = 0
    while (attempts < 20) {
      try {
        await col.insertOne({
          licenseKey: key,
          status: 'unused',
          activatedAccount: 0,
          activatedAt: null,
          activatedIp: null,
          createdAt: now,
        })
        keys.push(key)
        break
      } catch {
        key = generateLicenseKey()
        attempts++
      }
    }
    if (attempts >= 20) {
      throw new Error('Could not generate a unique key; try again')
    }
  }
  return keys
}

export type ActivateResult =
  | { ok: true }
  | { ok: false; error: 'invalid_key' | 'not_found' | 'already_used' | 'server' }

export async function activateLicenseKey(
  rawKey: string,
  account: number,
  clientIp: string
): Promise<ActivateResult> {
  const licenseKey = normalizeLicenseKey(rawKey)
  if (licenseKey.length < 16) {
    return { ok: false, error: 'invalid_key' }
  }

  const db = await getDb()
  const col = db.collection<LicenseDoc>(LICENSES_COLLECTION)

  const upd = await col.updateOne(
    { licenseKey, status: 'unused' },
    {
      $set: {
        status: 'used',
        activatedAccount: account,
        activatedAt: new Date(),
        activatedIp: clientIp || '',
      },
    }
  )

  if (upd.modifiedCount === 1) {
    return { ok: true }
  }

  const existing = await col.findOne({ licenseKey })
  if (!existing) {
    return { ok: false, error: 'not_found' }
  }
  return { ok: false, error: 'already_used' }
}

export async function listLicenses(): Promise<LicenseListItem[]> {
  const db = await getDb()
  const col = db.collection<LicenseDoc>(LICENSES_COLLECTION)
  const docs = await col.find({}).sort({ createdAt: -1 }).limit(500).toArray()
  return docs.map((doc) => ({
    id: doc._id!.toString(),
    licenseKey: doc.licenseKey,
    status: doc.status,
    activatedAccount: doc.activatedAccount,
    activatedAt: doc.activatedAt ? doc.activatedAt.toISOString() : null,
    activatedIp: doc.activatedIp,
    createdAt:
      doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
  }))
}

export async function resetLicenseToUnused(id: string): Promise<boolean> {
  const db = await getDb()
  const col = db.collection<LicenseDoc>(LICENSES_COLLECTION)
  let oid: ObjectId
  try {
    oid = new ObjectId(id)
  } catch {
    return false
  }
  const r = await col.updateOne(
    { _id: oid },
    {
      $set: {
        status: 'unused',
        activatedAccount: 0,
        activatedAt: null,
        activatedIp: null,
      },
    }
  )
  return r.modifiedCount === 1
}
