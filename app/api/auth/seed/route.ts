import { NextResponse } from 'next/server'
import { createUser, findUserByEmail } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const email = 'info@goldenedge.ai'
    const password = 'Goldenedge@2026'

    // Check if user already exists
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists', email: existingUser.email },
        { status: 200 }
      )
    }

    // Create user
    const user = await createUser(email, password, 'Girish Sharma!')
    return NextResponse.json(
      { message: 'User created successfully', email: user.email, name: user.name },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error seeding user:', error)
    return NextResponse.json(
      { error: 'Failed to seed user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
