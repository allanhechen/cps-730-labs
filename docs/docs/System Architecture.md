---
sidebar_position: 7
---

# System Architecture Documentation

## 1 High-Level Architecture
- The Todo Application is a full-stack web application where every component runs inside its own Docker container, in an AWS EC2 server.  The architecture follows a three-layer structure: a React frontend that users interact with, a group of Express backend servers handling application logic, and SQLite databases storing the data. NGINX is a reverse proxy and load balancer, at the front of the process, that routers incoming requests to the correct place and balances traffic across backend servers.  

```
[ Browser ]
     ↕  HTTP  :8080
[ NGINX Reverse Proxy — :80 (container) ]
     ↙                ↓                ↘
[ Frontend :80 ]  [ backend1:3000 ]  [ backend2:3000 ]  [ backend3:3000 ]
(React SPA/Nginx)         ↓                  ↓                  ↓
              [ Shared Docker Volume: todo.db  +  sessions.db ]
```
### Architecture Breakdown
<summary>todo-network</summary>
All five services share a private network managed internally by Docker, which provides two services: network isolation and automatic DNS resolution:
    - First, by keeping containers isolated, they are not reachable from outside the network unless explicitly allowed. 
    - Second, containers can locate each other by service name rather than IP address. 
<summary>todo-db</summary>
All three backend servers read from and write to a single Docker volume which holds a database file for the application’s to-do data and a file for user sessions. This keeps everything in a shared location which means all replicas see the same data and sessions remain valid regardless of which backend handles a given request.

## 2 Tech Stack and Purpose 
| Layer | Technology | Details |
|:---|:---|:---|
| Frontend | React, Vite, TypeScript | The React app is compiled into plain HTML, CSS, and JavaScript at build time using Vite. Those static files are then served to the browser by a lightweight nginx instance running inside the frontend container. |
| Proxy/LB | NGINX (alpine) | Reverse proxy and round-robin load balancer. Single public entry point on port 8080. |
| Backend | Node.js 20, Express.js, TypeScript | REST API compiled from TypeScript. Three identical replicas for horizontal scaling (backend1, backend2, backend3). |
| Authorization | Passport.js, Google OAuth 2.0 | Session-based authentication. Users log in via Google; session stored in SQLite. |
| Persistence | SQLite | File-based relational database. Shared across replicas via Docker volume. |
| Container | Docker / Docker Compose | All services defined in a single `docker-compose.yml`. Multi-stage builds for lean images. |
| Hosting | AWS EC2 | Application deployed and running on an EC2 instance. Port 8080 exposed publicly. |

## 3 Data Model

- The application uses a single SQLite database (todo.db) with four tables. 
- A second database (sessions.db) stores OAuth session records and is managed automatically by express-session-sqlite.

```
users  (1) ──────────────────< (many)  todo_items
todo_items  (many) >────────────────< (many)  categories
                        [via todo_item_categories]
```
### Table Definitions
| Table | Columns | Notes |
|:---|:---|:---|
| `users` | id (varchar PK), email, name | Created automatically on first Google OAuth login. `id` is the Google profile ID. |
| `todo_items` | id (varchar 36 UUID), name, completed (bool), priority (int), utcDueDate, user_id (FK) | Core task table — all queries are scoped by `user_id`. |
| `categories` | id (integer PK auto), name (UNIQUE) | Global labels shared across all users. |
| `todo_item_categories` | id (integer PK auto), todoId (FK → todo_items), categoryId (FK → categories) | Join table for the many-to-many relationship between tasks and categories. |

## 4 Authentication Architecture
- Authentication uses the OAuth 2.0 Authorization Code flow through Google. 
- Passport.js manages the flow 
- Sessions are stored in SQLite, to support multiple backend replicas.

### OAuth Flow
1. User clicks 'Sign in with Google' on the frontend.
2. Browser navigates to GET /auth/google → NGINX forwards to a backend replica.
3. Passport.js redirects to Google's OAuth consent page.
4. After user consent, Google redirects to GET /auth/google/callback with an authorization code.
5. Backend exchanges the code for a user profile via Google API.
6. db.getOrCreateUser() is called — user is inserted into the users table if new.
7. Passport serialises the user.id into the session, stored in sessions.db.
8. A session cookie (httpOnly, sameSite: lax) is set in the browser response.
1. User clicks 'Sign in with Google' on the frontend.
2. Browser navigates to GET /auth/google → NGINX forwards to a backend replica.
3. Passport.js redirects to Google's OAuth consent page.
4. After user consent, Google redirects to GET /auth/google/callback with an authorization code.
5. Backend exchanges the code for a user profile via Google API.
6. db.getOrCreateUser() is called — user is inserted into the users table if new.
7. Passport serialises the user.id into the session, stored in sessions.db.
8. A session cookie (httpOnly, sameSite: lax) is set in the browser response.
9. Every API request after that sends along this cookie — and any replica can verify it by checking sessions.db.


