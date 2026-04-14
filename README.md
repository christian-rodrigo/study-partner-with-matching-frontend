# Study Partner Frontend

A React + Vite frontend connected to your Spring Boot backend.

## Included pages

- Login / Register
- Discover users
- Open conversations and send messages
- Browse learning places
- View own profile
- Manage tutor courses

## Start

```bash
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api` requests to `http://localhost:8080`.

## Backend requirements

Start your Spring Boot backend on port `8080`.

Because your backend security config protects almost all endpoints, the frontend logs in first and sends the JWT token as:

```http
Authorization: Bearer <token>
```

## Notes about your current backend

1. There is no public `GET /api/courses` endpoint, so the tutor page only submits new course names.
2. There is no profile update endpoint yet, so the profile page is read-only.
3. Using the Vite proxy avoids browser CORS issues during development.
