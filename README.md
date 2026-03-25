# Tasks Management API

REST API for managing tasks with user authentication. Built with Express 5, TypeScript, Mongoose, and Bun.

## Setup

1. Install [Bun](https://bun.sh) and [Docker](https://www.docker.com/).

2. Clone the repo and install dependencies:

```bash
git clone <repo-url>
cd tasks-management
bun install
```

3. Copy the env file and edit as needed:

```bash
cp .env.example .env
```

4. Start MongoDB:

```bash
docker compose up -d
```

5. Run the server:

```bash
bun run dev
```

Server starts at `http://localhost:8080`.

## Testing

Make sure MongoDB is running, then:

```bash
bun test
```

Tests use a separate `tasks-management-test` database that gets dropped after each run.

## Endpoints

### Auth

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get a JWT token

### Tasks (requires `Authorization: Bearer <token>`)

- `GET /api/tasks` - List all tasks for the authenticated user
- `GET /api/tasks/:id` - Get a task by ID
- `POST /api/tasks` - Create a task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
