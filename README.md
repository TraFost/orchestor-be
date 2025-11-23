# Orchestor Backend

![Orchestor Logo](public/assets/orchestor-logo.png)

A Hono + Supabase API for social media content orchestration, built by AgentBunnies for the IBM watsonx Orchestrate Agentic AI Hackathon 2025.

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
   - Provide your IBM Watsonx Orchestrate API key (`ORCH_API_KEY`)

   The app automatically handles IBM token refresh using your API key—no manual token management needed.

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

## License

MIT License © 2025 AgentBunnies. See LICENSE for details.
