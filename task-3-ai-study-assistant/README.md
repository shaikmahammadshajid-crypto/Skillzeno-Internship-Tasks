# StudyPilot AI — Skillzeno Internship Task 3

A full-stack AI study assistant built with React, TypeScript, Vite, Node.js, and Express.

## Features
- Ask study questions, summarize notes, generate quizzes, and get study plans.
- Responsive interface with task modes, example prompts, loading feedback, and clear error messages.
- Backend validation, request-size limits, and basic per-IP rate limiting.
- API key is stored only on the server in `.env`; it is never sent to the browser.
- Supports the OpenAI API by default, with configurable model/base URL for compatible providers.

## Requirements
- Node.js 20 or later
- An API key for the provider you configure (OpenAI by default)

## Setup

```bash
# 1. Install backend dependencies
cd server
npm install
cp .env.example .env
# Edit server/.env and add your API key

# 2. Start the API (from server/)
npm run dev
```

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

## Environment variables

Create `server/.env` from `server/.env.example`.

- `PORT`: API port (default `4000`)
- `CLIENT_ORIGIN`: allowed frontend origin (default `http://localhost:5173`)
- `AI_API_KEY`: secret API key. Keep it private.
- `AI_BASE_URL`: optional API-compatible base URL. Leave blank for the OpenAI default.
- `AI_MODEL`: model identifier available to your provider (default `gpt-4o-mini`)

Do not commit `.env`. The repository includes `.gitignore` rules for secrets.

## API

`POST /api/assistant`

```json
{
  "mode": "ask",
  "prompt": "Explain photosynthesis simply"
}
```

Supported `mode` values: `ask`, `summarize`, `quiz`, `plan`.

`GET /api/health` returns basic server status without exposing secrets.

## GitHub submission

Create a **public** repository named exactly:

`Skillzeno-Internship-Tasks`

Then from the project root:

```bash
git init
git add .
git commit -m "Build StudyPilot AI for Skillzeno Task 3"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/Skillzeno-Internship-Tasks.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username.

## Security notes
- Never put `AI_API_KEY` in client code, Vite variables, or public repositories.
- Do not share screenshots showing `.env` or provider dashboards with secrets.
- For production, add authentication, durable distributed rate limiting, usage quotas, monitoring, and HTTPS.
- The included in-memory rate limiter is a basic demo safeguard, not a substitute for production abuse protection.

## Task 3 requirements covered
- Useful AI feature: study Q&A, summarization, quizzes, and study plans.
- User-friendly prompt interface and generated responses.
- Loading, error, empty-response, and input-validation states.
- Server-side API credentials and documentation.
