# Tether - Professional Networking App

A React Native/Expo app for professional networking with swipe-based matching and messaging features.

## 📊 App Progress

### ✅ Completed Features

#### Backend (Server)
- ✅ Express server with full API routes
- ✅ Authentication system (register, login, logout, session management)
- ✅ User profile management (CRUD operations)
- ✅ Swiping system (left/right swipe on profiles)
- ✅ Matching algorithm (mutual right swipes create matches)
- ✅ Messaging system (send/receive messages in matches)
- ✅ Database schema with Drizzle ORM (PostgreSQL)
- ✅ CORS configuration
- ✅ Error handling and validation (Zod schemas)

#### Frontend (Client)
- ✅ React Native/Expo app with navigation
- ✅ Authentication screens (Login, Register)
- ✅ Deck screen with animated swipe cards
- ✅ Matches screen (list of connections)
- ✅ Chat screen (messaging interface)
- ✅ Profile screen (view/edit profile)
- ✅ Match modal (celebrates new matches)
- ✅ Theme system (dark mode)
- ✅ Error boundaries and fallbacks
- ✅ Secure token storage (Expo SecureStore)

#### Database
- ✅ Users table (username, password, profile info)
- ✅ Swipes table (track swipe history)
- ✅ Matches table (mutual connections)
- ✅ Messages table (chat messages)

### 🚧 Potential Enhancements (Not Implemented)
- Real-time messaging (WebSocket support exists but not fully integrated)
- Image upload for avatars
- Push notifications
- Advanced filtering/search
- Profile verification
- Analytics

## 🚀 How to Run

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (local or hosted)
- npm or yarn

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Database connection (required)
DATABASE_URL=postgresql://username:password@localhost:5432/tether_db

# Server port (optional, defaults to 5000)
PORT=5000

# For SSL connections (e.g., Supabase)
# DATABASE_SSL=true

# Client API URL (optional, defaults to http://localhost:5000)
# For local development, you can leave this unset
EXPO_PUBLIC_DOMAIN=http://localhost:5000
```

**For Supabase or other hosted PostgreSQL:**
```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname
DATABASE_SSL=true
EXPO_PUBLIC_DOMAIN=https://your-domain.com
```

### Step 3: Set Up Database

Push the database schema to your PostgreSQL database:

```bash
npm run db:push
```

This will create all necessary tables (users, swipes, matches, messages).

### Step 4: Start the Server

In one terminal, start the Express server:

```bash
npm run server:dev
```

The server will start on `http://localhost:5000` (or your configured PORT).

### Step 5: Start the Client

In another terminal, start the Expo client:

```bash
npm start
```

This will:
- Start the Expo development server
- Show a QR code for mobile testing
- Open web version at `http://localhost:8081` (or similar)

### Step 6: Run on Your Device

**For iOS Simulator:**
```bash
npm run ios
```

**For Android Emulator:**
```bash
npm run android
```

**For Web Browser:**
```bash
npm run web
```

**For Physical Device:**
1. Install Expo Go app on your phone
2. Scan the QR code from `npm start`
3. Make sure your phone and computer are on the same network

## 📱 Available Scripts

- `npm start` - Start Expo development server
- `npm run server:dev` - Start Express server in development mode
- `npm run server:build` - Build server for production
- `npm run server:prod` - Run production server build
- `npm run db:push` - Push database schema to PostgreSQL
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint
- `npm run check:types` - Type check with TypeScript

## 🔧 Configuration

### API URL Configuration

The client automatically detects the API URL based on `EXPO_PUBLIC_DOMAIN`:
- If unset, defaults to `http://localhost:5000`
- Supports full URLs: `http://localhost:5000` or `https://api.example.com`
- Supports port-only: `:5000` (assumes localhost)

### Database Configuration

The app uses Drizzle ORM with PostgreSQL. The database connection is configured in:
- `drizzle.config.ts` - Drizzle Kit configuration
- `server/db.ts` - Database connection pool

## 📁 Project Structure

```
tether/
├── client/              # React Native/Expo frontend
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation setup
│   ├── context/         # React contexts (Auth)
│   ├── hooks/           # Custom hooks
│   └── lib/             # Utilities
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── db.ts            # Database connection
│   ├── storage.ts       # Database operations
│   └── templates/       # HTML templates
├── shared/              # Shared code
│   └── schema.ts        # Database schema & Zod schemas
└── assets/              # Images and static assets
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running
- For Supabase, ensure `DATABASE_SSL=true` is set

### API Connection Issues
- Ensure server is running on the correct port
- Check `EXPO_PUBLIC_DOMAIN` matches server URL
- For mobile devices, use your computer's local IP (e.g., `http://192.168.1.100:5000`)

### Port Conflicts
- Change `PORT` in `.env` if 5000 is in use
- Update `EXPO_PUBLIC_DOMAIN` to match

### TypeScript Errors
- Run `npm run check:types` to see all type errors
- Ensure all dependencies are installed

## 📝 Notes

- The app uses a simple password hashing function (not production-ready). Consider using bcrypt for production.
- Sessions are stored in-memory (will be lost on server restart). Consider Redis for production.
- The app is configured for dark mode by default.
- WebSocket support exists in dependencies but real-time messaging is not fully implemented.

