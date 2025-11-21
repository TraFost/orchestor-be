# Frontend Authentication Integration Guide

This guide explains how to integrate with the backend authentication endpoints for user sign-up, sign-in, and protected routes.

## Database Structure

User data is stored across two Supabase tables:

- **`auth.users`**: Core authentication data (managed by Supabase)
- **`user_information`**: Additional user fields like `fullname` (references `auth.users.id`)

The API automatically combines data from both tables for complete user profiles.

## Base URL

All API endpoints are prefixed with `/api`. For example: `https://unputrefiable-yu-unlibellous.ngrok-free.dev/api/auth/sign-up`

## Authentication Endpoints

### 1. User Sign Up

**Endpoint:** `POST /api/auth/sign-up`

**Request Body:**

```json
{
	"email": "user@example.com",
	"password": "password123",
	"fullname": "John Doe"
}
```

**Response (Success - 200):**

```json
{
	"id": "user-uuid",
	"email": "user@example.com",
	"fullname": "John Doe",
	"created_at": "2025-11-21T10:00:00Z",
	"updated_at": "2025-11-21T10:00:00Z"
}
```

**Response (Error - 400/500):**

```json
{
	"message": "Error message"
}
```

**Frontend Implementation:**

```javascript
const signUp = async (email, password, fullname) => {
	try {
		const response = await fetch("/api/auth/sign-up", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password, fullname }),
			credentials: "include", // Important: includes cookies
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message);
		}

		const user = await response.json();
		// User is now signed up and logged in (cookies set)
		return user;
	} catch (error) {
		console.error("Sign up failed:", error);
		throw error;
	}
};
```

### 2. User Sign In

**Endpoint:** `POST /api/auth/sign-in`

**Request Body:**

```json
{
	"email": "user@example.com",
	"password": "password123"
}
```

**Response (Success - 200):**

```json
{
	"id": "user-uuid",
	"email": "user@example.com",
	"created_at": "2025-11-21T10:00:00Z",
	"updated_at": "2025-11-21T10:00:00Z"
}
```

**Response (Error - 401):**

```json
{
	"message": "Invalid login credentials"
}
```

**Frontend Implementation:**

```javascript
const signIn = async (email, password) => {
	try {
		const response = await fetch("/api/auth/sign-in", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
			credentials: "include", // Important: includes cookies
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message);
		}

		const user = await response.json();
		// User is now logged in (cookies set)
		return user;
	} catch (error) {
		console.error("Sign in failed:", error);
		throw error;
	}
};
```

### 3. OAuth Sign In (Google/Apple)

**Endpoint:** `POST /api/auth/sign-in-with-provider`

**How It Works:**

1. Frontend initiates OAuth with Google (user logs in on Google's page).
2. Google returns an ID token (and optional access token) to the frontend.
3. Frontend sends these tokens to the backend for verification and session creation.

**Request Body:**

```json
{
	"provider": "google",
	"token": "oauth-id-token",
	"accessToken": "oauth-access-token" // optional
}
```

**Response (Success - 200):**

```json
{
	"id": "user-uuid",
	"email": "user@example.com",
	"created_at": "2025-11-21T10:00:00Z",
	"updated_at": "2025-11-21T10:00:00Z"
}
```

**Frontend Implementation:**

```javascript
const signInWithGoogle = async () => {
	try {
		// Step 1: Get ID token from Google OAuth (use Google's SDK or library)
		const googleToken = await getGoogleIdToken(); // Implement this function

		// Step 2: Send token to backend
		const response = await fetch("/api/auth/sign-in-with-provider", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				provider: "google",
				token: googleToken,
				accessToken: googleAccessToken, // if available
			}),
			credentials: "include",
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message);
		}

		const user = await response.json();
		return user; // User is now logged in
	} catch (error) {
		console.error("OAuth sign in failed:", error);
		throw error;
	}
};
```

## Protected Routes

### Accessing Protected Endpoints

All protected routes require the user to be authenticated. The backend automatically checks for valid cookies.

**Example Protected Route:** `GET /api/iam/`

**Frontend Implementation:**

```javascript
const getUserProfile = async () => {
	try {
		const response = await fetch("/api/iam/", {
			method: "GET",
			credentials: "include", // Important: sends cookies
		});

		if (!response.ok) {
			if (response.status === 401) {
				// User needs to sign in again
				redirectToLogin();
				return;
			}
			const error = await response.json();
			throw new Error(error.message);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Failed to get user profile:", error);
		throw error;
	}
};
```

## Authentication Flow

### Complete User Journey

```javascript
// 1. Sign Up
await signUp("user@example.com", "password123", "John Doe");

// 2. Now user is logged in and can access protected routes
const profile = await getUserProfile();

// 3. User stays logged in until token expires
// No manual token management needed - cookies handle it
```

### Handling Authentication State

```javascript
const checkAuthStatus = async () => {
	try {
		await getUserProfile();
		return true; // User is authenticated
	} catch (error) {
		return false; // User needs to sign in
	}
};

const logout = () => {
	// Clear any local state
	// Redirect to login page
	// Note: Server-side logout would require an endpoint
};
```

## Error Handling

### Common Error Codes

- **400**: Bad request (invalid data)
- **401**: Unauthorized (invalid credentials or expired token)
- **403**: Forbidden (no access)
- **500**: Server error

### Token Expiration

- Access tokens expire automatically
- When a request fails with 401, redirect user to sign in again
- No refresh token logic - keep it simple for hackathons

## Security Notes

- Always use `credentials: 'include'` in fetch requests
- Passwords must be at least 8 characters
- Tokens are stored in HTTP-only cookies (secure)
- All auth endpoints validate input using Zod schemas
