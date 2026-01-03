# Tether - replit.md

## Overview

Tether is a social networking mobile application built with React Native and Expo, featuring a Tinder-style swipe interface for professional networking. Users can create profiles, swipe through potential connections, and establish matches when both parties express interest. The app follows a dark "Cyberpunk" theme with glassmorphism effects and supports iOS, Android, and web platforms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React Native with Expo SDK 54, using the new architecture (React 19.1)

**Navigation Structure:**
- Root Stack Navigator handles auth flow (Login/Register) vs main app
- Bottom Tab Navigator with 3 tabs: Deck (swipe interface), Matches, Profile
- Native stack navigation with transparent headers and blur effects

**State Management:**
- TanStack React Query for server state and API caching
- React Context (AuthContext) for authentication state
- Session tokens stored via `expo-secure-store` (native) or localStorage (web)

**UI/UX Patterns:**
- Dark mode only with Cyberpunk color palette (Slate-950 background, Cyan/Purple accents)
- Glassmorphism using `expo-blur` for tab bars, cards, and modals
- Gesture-based interactions using `react-native-gesture-handler` and `react-native-reanimated`
- Haptic feedback on key interactions

**Path Aliases:**
- `@/` → `./client/`
- `@shared/` → `./shared/`

### Backend Architecture

**Framework:** Express.js running on Node.js with TypeScript

**API Design:**
- RESTful endpoints under `/api/` prefix
- Token-based authentication (Bearer tokens in Authorization header)
- In-memory session storage (sessions Map)
- Simple password hashing (not production-grade)

**Key Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/deck` - Get unswiped users for the deck
- `POST /api/swipes` - Record a swipe action
- `GET /api/matches` - Get user's matches
- `PUT /api/users/me` - Update user profile

**Database Layer:**
- Drizzle ORM with PostgreSQL
- Schema defined in `shared/schema.ts`
- Storage interface pattern (`IStorage`) for database operations

### Data Model

**Users Table:**
- id (UUID primary key)
- username (unique)
- password (hashed)
- name, headline, bio, skills, avatarUrl
- createdAt timestamp

**Swipes Table:**
- id (UUID primary key)
- swiperId, swipeeId (foreign keys to users)
- direction (left/right)
- createdAt timestamp

**Matches Table:**
- id (UUID primary key)
- user1Id, user2Id (foreign keys to users)
- createdAt timestamp

### Build and Development

**Development:**
- Expo development server with Replit proxy configuration
- Separate server process for Express API
- Hot reloading enabled for both client and server

**Production Build:**
- Static web export via Expo
- Server bundled with esbuild
- Database migrations via Drizzle Kit (`db:push`)

## External Dependencies

### Database
- **PostgreSQL** - Primary database accessed via `DATABASE_URL` environment variable
- **Drizzle ORM** - Type-safe database queries and schema management

### Third-Party Libraries
- **TanStack React Query** - Server state management and caching
- **expo-secure-store** - Secure credential storage on native platforms
- **expo-blur** - Glassmorphism blur effects
- **expo-haptics** - Haptic feedback on native devices
- **react-native-reanimated** - Performant animations
- **react-native-gesture-handler** - Touch gesture handling
- **Zod** - Runtime type validation for API requests

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `EXPO_PUBLIC_DOMAIN` - API server domain for client requests
- `REPLIT_DEV_DOMAIN` - Development domain (Replit-specific)
- `REPLIT_DOMAINS` - Allowed CORS origins (Replit-specific)