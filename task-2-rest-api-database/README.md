# SkillZeno Internship — Task 2: REST API & Database

A TypeScript REST API built with Node.js, Express and MongoDB. It provides validated CRUD operations for a task resource.

## Features

- Create, list, retrieve, update and delete tasks
- MongoDB persistence using Mongoose
- Request validation with Zod 4
- Pagination and filtering by status or priority
- Centralized error handling and consistent JSON responses
- Helmet security headers, CORS and API rate limiting
- Graceful shutdown and health-check endpoint
- Importable Postman collection with response assertions

## Requirements

- Node.js 20+
- npm
- MongoDB Atlas database or local MongoDB

## Setup

```bash
npm install
cp .env.example .env
```

Set `MONGODB_URI` in `.env`. For MongoDB Atlas, create a cluster and database user, allow your current IP in Network Access, and copy the Node.js connection string. Keep `.env` private and never commit credentials. URL-encode special characters in the password.

## Run

```bash
npm run dev
```

API base URL: `http://localhost:4000`

Health check:

```bash
curl http://localhost:4000/api/health
```

Production build:

```bash
npm run typecheck
npm run build
npm start
```

## API reference

Base URL: `http://localhost:4000/api`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check API status |
| POST | `/tasks` | Create a task |
| GET | `/tasks` | List tasks |
| GET | `/tasks/:id` | Get one task |
| PATCH | `/tasks/:id` | Partially update a task |
| PUT | `/tasks/:id` | Update supplied task fields |
| DELETE | `/tasks/:id` | Delete a task |

### Task fields

| Field | Type | Rules |
|---|---|---|
| `title` | string | Required on create, 3–120 characters |
| `description` | string | Optional, maximum 1000 characters |
| `status` | string | `pending`, `in_progress`, `completed` |
| `priority` | string | `low`, `medium`, `high` |
| `dueDate` | date/null | Optional ISO date string or null |

### Example requests

Create:

```bash
curl -X POST http://localhost:4000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Complete internship task","description":"Build REST API","status":"pending","priority":"high"}'
```

List and filter:

```bash
curl "http://localhost:4000/api/tasks?page=1&limit=10"
curl "http://localhost:4000/api/tasks?status=pending&priority=high"
```

Retrieve, update and delete: replace `TASK_ID` with the `_id` returned by create.

```bash
curl http://localhost:4000/api/tasks/TASK_ID

curl -X PATCH http://localhost:4000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

curl -X DELETE http://localhost:4000/api/tasks/TASK_ID
```

## Postman testing

1. Start the API.
2. Import `postman/SkillZeno-Task-2.postman_collection.json`.
3. Run Health check → Create task → Get all tasks → Get task by ID → Update task → Delete task.
4. The Create task request stores its generated MongoDB ID in the collection variable `taskId`.
5. Run the validation error request separately; it should return HTTP 400.

Expected statuses: create `201`; read/update/delete `200`; validation or malformed IDs `400`; missing task/route `404`.

## Project structure

```text
src/
├── config/          # Environment and database connection
├── controllers/     # CRUD controller logic
├── middleware/      # Validation, 404 and error handlers
├── models/          # Mongoose Task model
├── routes/          # REST route definitions
├── utils/           # Async route wrapper
├── validators/      # Zod request schemas
├── app.ts
└── server.ts
postman/
└── SkillZeno-Task-2.postman_collection.json
```

## Submission checklist

- [ ] Configure MongoDB connection in local `.env` (never commit it)
- [ ] Run `npm install`
- [ ] Run `npm run typecheck` and `npm run build`
- [ ] Run `npm audit` and review the result
- [ ] Verify health endpoint and all CRUD routes
- [ ] Capture Postman screenshots as internship evidence
- [ ] Submit this folder's GitHub URL and required evidence on SkillZeno
