# Replit.md

## Overview

This is a real-time Keno game application built with a full-stack architecture. The application allows users to participate in live Keno draws, place bets, and see results in real-time. It features a React frontend with modern UI components, an Express backend with WebSocket support, and uses PostgreSQL for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom Keno game theme colors
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Real-time Communication**: WebSocket connection for live game updates
- **Animation**: Framer Motion for smooth game animations
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Real-time Communication**: WebSocket Server (ws) for live game updates
- **API Design**: RESTful endpoints for game operations
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: TSX for TypeScript execution in development

### Data Layer
- **Database**: PostgreSQL (configured for use but currently using in-memory storage)
- **ORM**: Drizzle ORM with Zod schema validation
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Migrations**: Drizzle Kit for schema management

## Key Components

### Game Engine
- **Game State Management**: Centralized game state with drawing sequences
- **Timer System**: 60-second intervals between games with 30-second drawing periods
- **Number Generation**: Cryptographically secure random number generation
- **Payout System**: Configurable payout table based on matched numbers

### Real-time Features
- **Live Drawing**: WebSocket-based real-time number drawing animation
- **Game Synchronization**: All clients stay synchronized with current game state
- **Connection Recovery**: Automatic reconnection with exponential backoff

### User Interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Interactive Game Board**: 80-number grid with visual feedback
- **Animation System**: Smooth ball drawing animations with proper timing
- **Dashboard**: Real-time balance, bet history, and game statistics

## Data Flow

1. **Game Initialization**: Server creates new game with unique game number
2. **Player Interaction**: Users select numbers and place bets through the frontend
3. **Real-time Updates**: WebSocket broadcasts game state changes to all connected clients
4. **Drawing Process**: Server draws 20 random numbers over 30 seconds
5. **Result Calculation**: Server calculates winnings based on matched numbers
6. **State Persistence**: Game results and user balances are stored in database

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, TanStack Query
- **Backend**: Express.js, WebSocket Server
- **Database**: Drizzle ORM, PostgreSQL drivers
- **TypeScript**: Full TypeScript support across frontend and backend

### UI and Styling
- **Radix UI**: Comprehensive primitive component library
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library for smooth transitions
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Frontend build tool and development server
- **TSX**: TypeScript execution for development
- **ESBuild**: Production bundling for backend

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20
- **Development Server**: Concurrent frontend (Vite) and backend (TSX) processes
- **Hot Reload**: Vite HMR for frontend, TSX watch mode for backend
- **Database**: PostgreSQL 16 module in Replit environment

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Deployment**: Replit autoscale deployment target
- **Port Configuration**: Server runs on port 5000, mapped to external port 80

### Environment Configuration
- **Database URL**: Required environment variable for PostgreSQL connection
- **Session Configuration**: PostgreSQL-backed sessions for user authentication
- **WebSocket**: Same-origin WebSocket connection for real-time features

## Changelog
```
Changelog:
- June 16, 2025. Initial setup
- June 16, 2025. Implemented Ethiopian Birr betting system (20-5,000 Birr, 50x multiplier)
- June 16, 2025. Added secure admin-side betting engine with player-facing calculator
- June 16, 2025. Created dedicated admin dashboard at /admin and betting calculator at /betting
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```