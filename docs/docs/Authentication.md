---
sidebar_position: 5
---

# Authentication

This application uses **Google OAuth 2.0** via [Passport.js](https://www.passportjs.org/) to authenticate users. Sessions are persisted in SQLite so they survive server restarts.

## Flow Overview

```
Browser                  Frontend              Backend               Google
  |                          |                    |                     |
  |----navigate to app------>|                    |                     |
  |                          |--GET /auth/user--->|                     |
  |                          |<-- 401 ------------|                     |
  |                          |                    |                     |
  |<---show login button-----|                    |                     |
  |                          |                    |                     |
  |---click "Login with Google" (redirect to /auth/google)------------->|
  |                                               |-- redirect to Google OAuth consent
  |<----------------------------------------------|                     |
  |---user signs in---------------------------------------------------->|
  |                          |                    |<-- callback w/ code-|
  |                          |                    |                     |
  |                          |      getOrCreateUser() in SQLite users   |
  |                          |                    |                     |
  |                          |      serialize user.id into session      |
  |                          |<-- redirect to CLIENT_ORIGIN ------------|
  |                          |---GET /auth/user-->|                     |
  |                          |<--{id, name, email}|                     |
  |<-- render app -----------|                    |                     |
```

## Endpoints

| Method | Path | Description |
|:-------|:-----|:------------|
| `GET` | `/auth/google` | Initiates the Google OAuth login, requesting `profile` and `email` scopes |
| `GET` | `/auth/google/callback` | OAuth redirect target; creates or retrieves the user, then redirects to the frontend |
| `GET` | `/auth/user` | Returns the currently authenticated user (`{ id, email, name }`), or `401` if not logged in |
| `GET` | `/auth/logout` | Destroys the session and returns `{ success: true }` |

All other API routes (`/items`, `/categories`, etc.) require an active session and return `401` if the request is unauthenticated.

## Session Storage

Sessions are stored in a SQLite database (separate from the todo database) using `express-session-sqlite`. This allows sessions to persist across server restarts and across all backend instances when using the nginx load-balanced setup.

| Setting | Value |
|:--------|:------|
| TTL | 24 hours |
| Cleanup interval | Every 5 minutes |
| Default session DB path | `/app/data/sessions.db` (override with `SESSION_DB_LOCATION`) |

## User Persistence

On first login, a new row is inserted into the `users` table with the Google profile `id`, `email`, and `name`. On subsequent logins the existing row is returned. See [Entities](./Entities.md#user) for more details.

## Required Environment Variables

| Variable | Description |
|:---------|:------------|
| `GOOGLE_CLIENT_ID` | OAuth client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret from Google Cloud Console |
| `SESSION_SECRET` | Secret used to sign session cookies |
| `BACKEND_URL` | Full public URL of the backend, used to build the OAuth callback URL (`http://localhost:8080/auth/google/callback`) |

See [Configuration](./Configuration.md) for all environment variables.
