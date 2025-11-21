---
applyTo: "**"
---

# Orchestor Backend - AI Assistant Guidelines

This document provides comprehensive guidelines for AI assistants working on the Orchestor backend project, a Hono + Supabase API built for the Lab-Lab Agentic AI Hackathon.

## Project Overview

**Orchestor Backend** is a TypeScript API built with:

- **Hono**: Fast, lightweight web framework for Cloudflare Workers and Node.js
- **Supabase**: Open source Firebase alternative for database, authentication, and real-time features
- **TypeScript**: For type safety and better developer experience
- **Biome**: For fast linting and formatting
- **PNPM**: For efficient package management

## Tech Stack & Tools

### Core Dependencies

- `hono`: Web framework
- `@supabase/supabase-js`: Supabase client
- `zod`: Schema validation
- `http-status-codes`: HTTP status code constants

### Development Tools

- `tsx`: TypeScript execution and REPL
- `@biomejs/biome`: Linting and formatting
- `esbuild`: Fast bundler for production builds

### Development Scripts

- `pnpm dev`: Start development server with hot reload
- `pnpm build`: Build for production
- `pnpm start`: Run production build
- `pnpm lint`: Format code with Biome

## Code Structure & Architecture

### Directory Structure

```
src/
├── app.ts              # Main Hono app with routes and middleware
├── server.ts           # Server entry point
├── config/             # Configuration files
│   ├── env.ts         # Environment variables
│   └── cors.config.ts # CORS configuration
├── libs/               # External service integrations
│   └── supabase/
│       └── client.ts   # Supabase client setup
├── middlewares/        # Hono middleware functions
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   ├── swagger.middleware.ts
│   └── zod-validator.middleware.ts
├── routes/             # Route definitions
│   ├── auth.routes.ts
│   └── user.routes.ts
├── services/           # Business logic layer
│   ├── auth.service.ts
│   └── user.service.ts
└── types/              # TypeScript type definitions
    ├── common.type.ts
    ├── auth/
    │   ├── auth.type.ts
    │   └── auth.dto.ts
    └── user/
        └── user.type.ts
```

### Key Patterns

#### 1. Service Layer Pattern

- **Static Classes**: All services are static classes with static async methods
- **Single Responsibility**: Each service method handles one specific operation
- **Database Operations**: Services handle all Supabase database interactions
- **Error Handling**: Comprehensive try-catch with proper error responses

#### 2. API Response Pattern

```typescript
interface ApiResponse<T = unknown> {
	status: number; // HTTP status code
	data: T; // Response data or null
	message: string; // Human-readable message
}
```

#### 3. Route Organization

- Routes are organized by feature/domain (`auth`, `user`, etc.)
- Each route file exports a Hono instance with related endpoints
- Routes use middleware for validation, authentication, etc.

#### 4. Type Safety

- **Strict TypeScript**: `strict: true` with additional strict checks
- **Path Mapping**: `@/*` maps to `./src/*` for clean imports
- **Interface Segregation**: Types organized by domain in separate files
- **Zod Validation**: Runtime validation with Zod schemas

## Coding Standards

### Naming Conventions

- **Files**: `kebab-case` (e.g., `auth.service.ts`, `user-profile.type.ts`)
- **Classes**: `PascalCase` (e.g., `AuthService`, `UserProfile`)
- **Methods**: `camelCase` (e.g., `signIn`, `getUserProfile`)
- **Interfaces**: `PascalCase` with descriptive names (e.g., `SignUpData`, `ApiResponse`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_LIMIT`)

### Import Organization

- **External libraries** first (hono, supabase, etc.)
- **Internal imports** second, grouped by type:
  - Types (`@/types/...`)
  - Services (`@/services/...`)
  - Middlewares (`@/middlewares/...`)
  - Utils/Config (`@/libs/...`, `@/config/...`)

### Code Style

- **Indentation**: 2 spaces (Biome configuration)
- **Line Width**: 120 characters maximum
- **Quotes**: Double quotes for strings
- **Semicolons**: Required
- **Trailing Commas**: Required in multi-line structures

## Service Implementation Guidelines

### Service Method Structure

```typescript
export class ExampleService {
	static async exampleMethod(
		params: ParamType
	): Promise<ApiResponse<ReturnType | null>> {
		try {
			// Input validation
			// Business logic
			// Database operations

			if (error) {
				console.error("Descriptive error message:", error);
				return {
					status: StatusCodes.ERROR_CODE,
					data: null,
					message: "User-friendly error message",
				};
			}

			return {
				status: StatusCodes.SUCCESS_CODE,
				data: result,
				message: "Success message",
			};
		} catch (error) {
			console.error("Method error:", error);
			return {
				status: StatusCodes.INTERNAL_SERVER_ERROR,
				data: null,
				message: "Generic error message",
			};
		}
	}
}
```

### Database Operations

- **Supabase Client**: Always use the configured client from `@/libs/supabase/client`
- **Error Handling**: Check for specific Supabase error codes (e.g., `PGRST116` for not found)
- **Data Transformation**: Transform raw database results to match application types
- **Security**: Use Row Level Security (RLS) policies in Supabase

### Authentication Flow

- **JWT Tokens**: Use Supabase auth for session management
- **User Profiles**: Separate auth users from application user profiles
- **Provider Auth**: Support OAuth providers (Google, etc.)
- **Session Data**: Return properly typed user objects with profile information

## Route Implementation Guidelines

### Route Structure

```typescript
import { Hono } from "hono";
import { z } from "zod";

import { ExampleService } from "@/services/example.service";
import authMiddleware from "@/middlewares/auth.middleware";

const exampleRoutes = new Hono().post(
	"/endpoint",
	authMiddleware,
	async (c) => {
		const body = c.req.valid("json");
		const result = await ExampleService.exampleMethod(body);

		return c.json(result, result.status);
	}
);

export default exampleRoutes;
```

### Middleware Usage

- **Authentication**: `authMiddleware` for protected routes
- **Validation**: `zod-validator` middleware for request validation
- **Error Handling**: `errorHandler` middleware for consistent error responses
- **CORS**: Configured globally in `app.ts`

## Type Definition Guidelines

### Interface Organization

- **DTOs**: Data Transfer Objects for API requests/responses
- **Types**: Core business logic types
- **Common Types**: Shared interfaces like `ApiResponse`

### Zod Schema Usage

- **Validation**: Use Zod for runtime type validation
- **Type Inference**: Use `z.infer<>` to create TypeScript types from schemas

## Error Handling

### HTTP Status Codes

- `200 OK`: Successful GET operations
- `201 Created`: Successful resource creation
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing/invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server errors

### Error Response Format

```typescript
{
    status: 400,
    data: null,
    message: "Validation failed"
}
```

## Development Workflow

### Local Development

1. **Install Dependencies**: `pnpm install`
2. **Environment Setup**: Configure `.env` with Supabase credentials
3. **Start Development**: `pnpm dev` (uses `tsx watch`)
4. **Code Changes**: Hot reload enabled
5. **Testing**: Manual testing via API calls or tools like Postman

### Code Quality

1. **Linting**: `pnpm lint` runs Biome formatting
2. **Type Checking**: TypeScript strict mode catches type errors
3. **Error Validation**: Check for runtime errors in development
4. **Consistent Patterns**: Follow established service/route patterns

### Deployment

1. **Build**: `pnpm build` creates optimized bundle
2. **Start**: `pnpm start` runs production server
3. **Environment**: Ensure production Supabase configuration

## Best Practices

### Performance

- **Efficient Queries**: Use Supabase select with specific fields
- **Pagination**: Implement pagination for large datasets
- **Caching**: Consider caching strategies for frequently accessed data

### Security

- **Input Validation**: Always validate user inputs with Zod
- **Authentication**: Require authentication for sensitive operations
- **Authorization**: Check user permissions appropriately
- **Data Sanitization**: Clean user inputs before database operations

### Maintainability

- **Modular Code**: Keep functions small and focused
- **Clear Naming**: Use descriptive names for variables and functions
- **Documentation**: Comment complex business logic
- **Type Safety**: Leverage TypeScript for better code reliability

### Testing

- **Manual Testing**: Test all endpoints manually during development
- **Error Scenarios**: Test error conditions and edge cases
- **Data Validation**: Ensure proper data transformation and validation

## Common Patterns & Examples

### Creating a New Service

1. Create service file in `src/services/`
2. Implement static class with async methods
3. Use proper error handling and ApiResponse pattern
4. Add corresponding types in `src/types/`

### Adding New Routes

1. Create route file in `src/routes/`
2. Use Hono instance with appropriate middleware
3. Connect to service methods
4. Register routes in `src/app.ts`

### Database Schema Changes

1. Update Supabase database schema
2. Update corresponding TypeScript types
3. Modify service methods to handle new fields
4. Update API endpoints if needed

Remember: This is a backend API focused on authentication, user management, and data operations. Keep implementations clean, type-safe, and consistent with the established patterns.
