import { createUser, findUserByEmail } from '../lib/auth'

async function seedUser() {
  try {
    const email = 'info@goldenedge.ai'
    const password = 'Goldenedge@2026'

    // Check if user already exists
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      console.log('User already exists:', email)
      process.exit(0)
    }

    // Create user
    const user = await createUser(email, password, 'Girish Sharma!')
    console.log('User created successfully:', user.email, user.name)
    process.exit(0)
  } catch (error) {
    console.error('Error seeding user:', error)
    process.exit(1)
  }
}

seedUser()
