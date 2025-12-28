# Tether

## Overview

Tether is a professional networking mobile-first web application styled as a "Tinder for professionals." Users create profiles with skills and interests, then swipe through other users to connect. Mutual swipes create matches, enabling real-time messaging. The app features a dark mode futuristic/cyberpunk design aesthetic with glassmorphic elements and neon accents.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom cyberpunk theme, CSS variables for theming
- **UI Components**: shadcn/ui component library (New York style)
- **Animations**: Framer Motion for swipe gestures and page transitions
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **Session Management**: express-session with PostgreSQL session store (connect-pg-simple)
- **API Design**: RESTful JSON API with `/api` prefix
- **Authentication**: Simple session-based auth with SHA-256 password hashing

### Data Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for validation
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit with `db:push` command

### Database Schema
Four main tables:
- **users**: Profile data (username, password hash, name, headline, bio, skills array, lookingFor array, avatar URL)
- **swipes**: Records user swipe actions (swiper, swipee, direction)
- **matches**: Created when two users mutually swipe right
- **messages**: Chat messages between matched users

### Project Structure
```
├── client/           # React frontend
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route pages
│       ├── hooks/        # Custom React hooks
│       └── lib/          # Utilities and query client
├── server/           # Express backend
│   ├── routes.ts     # API endpoints
│   ├── storage.ts    # Database operations
│   └── db.ts         # Database connection
├── shared/           # Shared code
│   └── schema.ts     # Drizzle schema definitions
└── migrations/       # Database migrations
```

### Path Aliases
- `@/*` → `./client/src/*`
- `@shared/*` → `./shared/*`
- `@assets/*` → `./attached_assets/*`

## External Dependencies

### Database
- **PostgreSQL**: Primary database, requires `DATABASE_URL` environment variable

### Key NPM Packages
- **drizzle-orm** / **drizzle-kit**: Database ORM and migration tooling
- **@tanstack/react-query**: Server state management
- **framer-motion**: Animation library for swipe gestures
- **express-session** / **connect-pg-simple**: Session management with PostgreSQL storage
- **shadcn/ui components**: Full Radix UI primitive library

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Session encryption key (has fallback for development)

### Design System
The app follows a custom cyberpunk design system defined in `design_guidelines.md`:
- Dark backgrounds (slate-950)
- Cyan (#00f0ff) and purple (#bc13fe) accent colors
- Glassmorphic card effects with backdrop blur
- Glowing effects on interactive elements