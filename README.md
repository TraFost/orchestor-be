# Orchestor Backend

A Hono + Supabase API for social media content orchestration, built for the Lab-Lab Agentic AI Hackathon.

## Tech Stack

- Hono (server framework)
- Supabase (auth & database)
- TypeScript
- Zod (validation)
- Biome (linting)

## Features

- User authentication via Supabase
- Task preview with AI agent
- Post scheduling to multiple platforms
- Dashboard with summary, today, and recent posts

## Quick Start

1. Install dependencies: `pnpm install`

2. Set up environment variables:

   - Copy `.env.example` to `.env`
   - Fill in your Supabase URL and service role key

3. Set up Supabase project

4. Run dev server: `pnpm dev`

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/tasks/preview` - Generate post previews
- `POST /api/tasks/schedule` - Schedule posts
- `GET /api/tasks/schedule` - Get scheduled posts
- `GET /api/dashboard/summary` - Dashboard summary
- `GET /api/dashboard/today` - Today's posts
- `GET /api/dashboard/recent` - Recent posts

## Project Structure

```
src/
├── app.ts              # Main app
├── server.ts           # Server entry
├── routes/             # API routes
├── services/           # Business logic
├── types/              # TypeScript types
└── middlewares/        # Hono middlewares
```
