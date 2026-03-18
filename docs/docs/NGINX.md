---
sidebar_position: 6
---

# NGINX Documentation

## 1 What is NGINX and why Use It?
- NGINX is a high-performance web server and reverse proxy. In this application, it acts as the public entry point so that every request from a browser first hits NGINX, which then decides which internal service should handle it.
- NGINX was chosen for this application due to its single port exposure, reverse proxying and load balancing: 
    - Since only one host port (8080) is exposed to the public, only one needs to be open; the frontend and all three backends remain internal and unreachable from outside the host.
    - Additionally, reverse proxying in NGINX works as requests are forwarded to the correct service (React frontend or Express backend) based on the URL path, hiding internal topology from clients. 
    - The third reason why NGINX was chosen is because it distributes API traffic evenly across three backend replicas using a round-robin algorithm, enabling horizontal scaling without any changes to the application code.

## 2 NGINX in the Docker Stack
### Dockerfile ###

```js
FROM nginx:alpine
COPY default.conf /etc/nginx/conf.d/default.conf
```
The official nginx:alpine base image is used and a custom configuration file replaces the default. 

### Docker Compose Entry ###

```yaml
nginx:
  build:
    context: ./nginx
    dockerfile: Dockerfile
  ports:
    - "8080:80"
  depends_on:
    - frontend
    - backend1
    - backend2
    - backend3
  networks:
    - todo-network
```

## 3 Configuration ##
### Upstream Block - Load Balancer ###

```nginx
upstream todo_backend {
    server backend1:3000;
    server backend2:3000;
    server backend3:3000;
}
```

The upstream block is a list of available backend servers. When a request comes in, NGINX uses round-robin and works through the list in order: first request goes to backend1, second to backend2, third to backend3, then it starts over. The server names are resolved by Docker's internal DNS to the container’s IP address on the shared todo-network bridge, so if a container restarts and gets a new IP, the name still works and the routing remains intact.

### Server Block - Routing Rules
```nginx
server {
    listen 80;

    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    }

    location /api/ {
        rewrite ^/api/(.*)$ /$1 break;
        proxy_pass http://todo_backend;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    }

    location /auth/ {
        proxy_pass http://todo_backend;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    }
}
```

### Routing Rules Explained ###

| URL Pattern | NGINX Action | Destination & Notes |
|:---|:---|:---|
| `/` | `proxy_pass` → frontend:80 | Serves the compiled React SPA static files. Handled by a second nginx instance inside the frontend container. |
| `/api/*` | Rewrite: strip `/api` → `proxy_pass` → todo_backend | API calls are load-balanced round-robin across backend1/2/3. The `/api` prefix is an NGINX-only concept — the Express routes never see it. |
| `/auth/*` | `proxy_pass` → todo_backend (no rewrite) | OAuth redirect URIs must match exactly. Forwarded unchanged so Google's callback URL (`/auth/google/callback`) arrives at Express unmodified. |

### Proxy Headers ###
All three location blocks set the same three proxy headers:
| Header | Purpose |
|:---|:---|
| `Host` | Passes the original request Host header to the upstream service — the backend knows the domain the client used. |
| `X-Real-IP` | Forwards the client's actual IP address, so the backend doesn't only see NGINX's container IP. |
| `X-Forwarded-For` | Appends the client IP to any existing forwarding chain. |


## 4 Inter-Service Communication Map ##

| From | To | Address | Purpose |
|:---|:---|:---|:---|
| Browser | NGINX | `ec2-host:8080` | Only externally accessible port |
| NGINX | frontend | `http://frontend:80` | Serve React SPA static assets |
| NGINX | backend1/2/3 | `http://backendN:3000` | API calls, round-robin load balanced |
| NGINX | backend1/2/3 | `http://backendN:3000` | Auth calls, forwarded unchanged |
| Backend | SQLite volume | `/app/data/*.db` | Read/write todo and session data |
| React (browser) | NGINX | `/api/*` | All API requests pass through NGINX |
| React (browser) | NGINX | `/auth/*` | OAuth login/logout flows |


## 5 Request Flow - End to End##
1. Browser sends GET http://ec2-host:8080/api/items with session cookie.
2. NGINX receives the request on port 80 (mapped from host 8080).
3. location /api/ matches → rewrite strips /api → path becomes /items.
4. proxy_pass forwards GET /items to the next server in the upstream pool (e.g. backend2:3000).
5. Express session middleware validates the session cookie against sessions.db on the shared volume.
6. requireAuth passes → getItems handler queries todo.db for the authenticated user's tasks.
7. JSON response travels back: backend2 → NGINX → browser.

