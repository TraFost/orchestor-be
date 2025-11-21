# Hono + Supabase Backend API

This is a Hono-based backend API application designed for user authentication and identity management (IAM), built with TypeScript and running on Node.js. It integrates Supabase for authentication services while using a separate PostgreSQL database for custom application data.

## Built With

- **Node.js** - Runtime environment
- **PNPM** - Package manager
- **TypeScript** - Type-safe JavaScript
- **Hono** - Lightweight web framework
- **Supabase** - Authentication and backend services
- **Drizzle ORM** - Type-safe SQL queries for PostgreSQL
- **Zod** - Schema validation
- **Vitest** - Testing framework
- **Biome** - Code formatting and linting
- **Sentry** - Error tracking and monitoring

## Architecture Overview

### Framework & Server

- **Framework**: Hono (adapted for Node.js via `@hono/node-server`)
- **Server**: Runs on port 3000
- **Entry Point**: `src/server.ts` serves the Hono app and displays routes for debugging

### Core Structure

- **App Core** (`src/app.ts`): Sets up the Hono app with base path `/api`, applies global middlewares, and mounts routes
- **Routes**:
  - `/auth`: Handles sign-up, sign-in, provider-based auth (Google/Apple), and token refresh
  - `/user`: Protected endpoints for user identity management
- **Middlewares**:
  - Auth middleware: Verifies user sessions using Supabase
  - Error handling, Swagger UI for API docs, and Zod validation for request bodies
- **Database Layer**:
  - Uses Supabase's managed PostgreSQL database
  - Data operations via Supabase client API

## Data Flow

Data flows through the app in a hybrid manner, leveraging Supabase for auth and a separate Postgres for app-specific storage.

### Request Flow

1. **Ingress**: All requests hit `/api/*` endpoints
2. **Middlewares**: Logging, CORS, CSRF, security headers, and timing run first

### Authentication Flow

- User sends credentials via POST to `/auth/*` endpoints
- Zod validates request body
- **Supabase Auth Call**: App calls Supabase's auth API (e.g., `signUp()`, `signInWithPassword()`)
  - Supabase handles user creation/verification and session management
  - Returns user object and session tokens
- **Local DB Sync**: For sign-up, user details are inserted into local Postgres `users` table
- **Response**: Sets secure HTTP-only cookies for tokens, returns user data as JSON

### Protected Routes Flow

- Auth middleware extracts tokens from cookies
- Calls `supabase.auth.getUser()` to verify session
- If invalid, attempts refresh with `refresh_token`
- Sets user context for route handlers
- Handlers can query local Postgres for additional data

### Data Storage

- **Supabase Auth**: Manages core user authentication in `auth.users` table
- **User Information**: Stores additional user data in `user_information` table (references `auth.users.id`)
- User data is combined from both tables for complete user profiles

## Why Separate Postgres with Supabase?

Supabase provides a managed PostgreSQL database, but this app uses a separate instance for custom application data while relying on Supabase only for authentication.

### Reasons for Separation

- **Separation of Concerns**: Supabase's Postgres is optimized for built-in services. A separate DB allows full control over custom schemas and migrations.
- **Flexibility**: Enables complex queries, custom tables, and integration with other tools without Supabase limitations.
- **Development Benefits**: Use local Postgres for testing while leveraging Supabase's auth in staging/production.
- **Scalability**: Auth is stateless and managed by Supabase, while app data scales independently.

### Architecture Benefits

- **Auth Offloading**: Supabase handles secure authentication without reinventing the wheel.
- **Control**: Full management of backups, indexing, and performance for app data.
- **Cost Efficiency**: Avoids Supabase's DB costs/limits for heavy custom data usage.

### Considerations

- **Duplication**: User data exists in both systems, requiring careful sync management.
- **Complexity**: Managing two database connections and ensuring data consistency.

### Hackathon Setup: Using Supabase as Full Database

This app now uses Supabase as the **only database** for both auth and app data. This eliminates the need to host/manage a separate DB.

#### Benefits for Hackathon

- **Simplicity**: One platform for auth + database. No separate DB setup/hosting.
- **Speed**: Get started faster; focus on features, not infrastructure.
- **Managed**: Supabase handles backups, scaling, and maintenance.
- **Integration**: Seamless auth + DB in one place.

#### Setup Steps

1. Create a Supabase project
2. Run the SQL to create the `users` table (see Supabase Setup above)
3. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE` in `.env`
4. Deploy your Hono server (e.g., to Vercel) with the same env vars

This setup reduces hosting to just your Hono server, with Supabase handling everything else.

## Getting Started

### Prerequisites

- Node.js
- PNPM
- Supabase account

### Installation

```bash
pnpm install
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in required environment variables:

#### Supabase

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE`: Supabase service role key
- `PORT`: Port for the server (default: 3000)

### Supabase Setup

1. Create a project in Supabase
2. In Supabase Dashboard → SQL Editor, create the user_information table:
   ```sql
   CREATE TABLE user_information (
     id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     fullname TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```
3. Enable Row Level Security (RLS) if needed for your use case

### Running the Application

```bash
# Development
pnpm dev

# Build
pnpm build

# Production
pnpm start
```

### API Documentation

See `FRONTEND_AUTH_INTEGRATION.md` for detailed frontend integration guide.

## Project Structure

```
src/
├── app.ts                 # Main Hono app setup
├── server.ts              # Server entry point
├── config/
│   └── env.ts            # Environment validation
├── libs/
│   └── supabase/
│       └── client.ts     # Supabase client
├── middlewares/          # Hono middlewares
├── routes/               # API routes
│   ├── auth.routes.ts
│   └── user.routes.ts
```
