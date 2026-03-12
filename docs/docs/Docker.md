---
sidebar_position: 4
---

# Docker

Our TODO application is fully containerized using Docker, enabling a consistent and reproducible development and deployment environment. We use a monorepo structure where multiple services and shared modules are managed within a single repository.

## Monorepo Strategy

The project is structured to support efficient development across different services:

- **`backend`**: An Express server that handles the business logic and data persistence
- **`frontend`**: A React application built with Vite for the user interface
- **`shared`**: A common module containing TypeScript types and logic used by both the frontend and backend

The Docker configuration ensures that these components are built in the correct order, with the `shared` module being built first to satisfy dependencies in the other services.

## Multi-Stage Builds

We leverage multi-stage builds to optimize image size and ensure that only the necessary artifacts are included in the final production images.

### Backend Build Process

1.  **Builder Stage**:
    - Uses `node:20-alpine` as a base
    - Installs all monorepo dependencies using Yarn workspaces
    - Builds the `shared` module first
    - Compiles the backend TypeScript code into a production-ready `dist` folder
2.  **Production Stage**:
    - Uses a clean `node:20-alpine` image
    - Installs only production dependencies to keep the image lightweight
    - Copies the compiled `shared` and `backend` artifacts from the builder stage
    - Sets up the runtime environment, including the SQLite database location and port configuration

### Frontend Build Process

1.  **Builder Stage**:
    - Similar to the backend, it builds the `shared` module first.
    - Builds the React application into highly optimized static files.
2.  **Production Stage**:
    - Uses `nginx:stable-alpine` to serve the static content efficiently.
    - Employs an `entrypoint.sh` script to inject runtime environment variables (like `API_URL`) into the compiled JavaScript bundles, allowing the same image to be used across different environments without rebuilding.

## Shared Module Integration

The `shared` module is a critical part of our architecture, providing consistent types across the entire stack. In the Docker build:

- The builder stage copies the `shared` source and its `package.json`
- Yarn workspaces automatically handle the internal linking between services
- Building the `shared` module generates the distribution files that the frontend and backend depend on during their respective build steps

## Docker Compose

The `docker-compose.yml` file orchestrates the local development environment, defining how the services interact and what resources they require.

| Service    | Port Mapping | Purpose                                                                |
| :--------- | :----------- | :--------------------------------------------------------------------- |
| `frontend` | `8081:80`    | Serves the user interface and handles runtime configuration injection. |
| `backend`  | `3001:3000`  | Processes API requests and manages the SQLite database.                |

### Key Orchestration Features

- **Networking**: A bridge network named `todo-network` allows the frontend and backend to communicate securely
- **Volumes**: A persistent volume called `todo-db` is used by the backend to ensure that the SQLite database survives container restarts and updates
- **Environment Variables**: Docker Compose manages configuration like `API_URL` for the frontend and `CLIENT_ORIGIN` for the backend, ensuring the services are correctly wired together

To start the entire stack, use the following command from the root of the project:

```bash
docker compose up -d
```
