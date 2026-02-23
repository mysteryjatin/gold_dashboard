# Authentication Setup

This dashboard uses MongoDB for authentication with JWT tokens stored in httpOnly cookies.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `dashboard` directory with the following variables:

```env
MONGODB_URI=mongodb+srv://goldenedgeaidomain_db_user:Goldenedge%402026@goldenedge.txink0o.mongodb.net/
MONGODB_DB_NAME=goldenedge
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Important:** Change the `JWT_SECRET` to a strong random string in production!

### 3. Seed Initial User

Run the seed script to create the initial admin user:

```bash
npm run seed
```

This will create a user with:
- Email: `info@goldenedge.ai`
- Password: `Goldenedge@2026`

### 4. Start the Development Server

```bash
npm run dev
```

## API Endpoints

### POST `/api/auth/login`
Login endpoint that accepts email and password, returns a JWT token in an httpOnly cookie.

**Request:**
```json
{
  "email": "info@goldenedge.ai",
  "password": "Goldenedge@2026"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "email": "info@goldenedge.ai"
  }
}
```

### GET `/api/auth/check`
Check if the current user is authenticated.

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "email": "info@goldenedge.ai"
  }
}
```

### POST `/api/auth/logout`
Logout endpoint that clears the authentication cookie.

## Security Features

- Passwords are hashed using bcrypt with 10 rounds
- JWT tokens are stored in httpOnly cookies (not accessible via JavaScript)
- Tokens expire after 7 days
- Secure flag is enabled in production mode
