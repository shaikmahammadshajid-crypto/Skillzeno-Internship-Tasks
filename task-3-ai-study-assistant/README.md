# StudySpark AI — Task 3

An AI-powered study assistant that explains topics, creates quizzes, and summarizes notes.

## Features

- Explain, quiz, and summary modes
- Loading, error, empty-response, and input-validation states
- Secure server-side API integration: the browser sends requests only to `/api/study`; the API key stays in the server environment
- Responsive user interface and copy-answer control

## Run locally

1. Install Node.js 18+.
2. Run `npm install` in this folder.
3. Copy `.env.example` to `.env`, then set `OPENAI_API_KEY` in `.env`.
4. Run `npm start`, then visit `http://localhost:3000`.

Never commit `.env` or put an API key in client-side JavaScript. OpenAI recommends keeping API keys in server-side environment variables rather than browser code. See the [OpenAI API quickstart](https://platform.openai.com/docs/quickstart/make-your-first-api-request).

For simple GitHub uploads, the website files (`index.html`, `styles.css`, and `app.js`) are also available in this main folder.
