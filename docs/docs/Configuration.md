---
sidebar_position: 3
---

# Configuration

These are the environment variables that can be used to configure each service.

## Frontend

| Variable            | Description                             | Default Value           |
| :------------------ | :-------------------------------------- | :---------------------- |
| `VITE_API_BASE_URL` | The API endpoint of your backend server | `http://localhost:3000` |

## Backend

| Variable             | Description                                                   | Default Value           |
| :------------------- | :------------------------------------------------------------ | :---------------------- |
| `PORT`               | The port that the backend server will listen to               | `3000`                  |
| `SQLITE_DB_LOCATION` | The location to store the SQLite database                     | `"/etc/todos/todo.db"`  |
| `CLIENT_ORIGIN`      | The location of the frontend service used to set CORS headers | `http://localhost:5173` |
