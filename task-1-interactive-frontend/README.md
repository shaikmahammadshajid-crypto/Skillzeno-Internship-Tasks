# TaskFlow — Interactive Frontend Application

**SkillZeno Full Stack Development Internship · Task 1**

TaskFlow is a responsive student productivity dashboard built with HTML, CSS, and vanilla JavaScript.

## Features
- Responsive desktop, tablet, and mobile layout
- Dashboard statistics for total, active, completed, and high-priority tasks
- Create and edit tasks with title validation, description, category, priority, due date, and status
- Complete/reopen and delete tasks (with confirmation)
- Live search, category and priority filters, plus Today/Upcoming/Completed navigation
- Browser localStorage persistence
- Dark mode, mobile navigation, accessible labels, empty states, and toast feedback

## Run locally
No dependencies or API keys are needed.

```bash
cd task-1-interactive-frontend
python3 -m http.server 8000
```

Open http://localhost:8000 in your browser. Alternatively, open `index.html` directly.

## Files
- `index.html` — page structure and task form
- `styles.css` — styling, responsive breakpoints, and dark theme
- `script.js` — task management, filtering, persistence, and UI interactions

## Manual test checklist
- [ ] Add a task and try submitting an empty title
- [ ] Edit and delete a task
- [ ] Complete and reopen a task
- [ ] Search task title and description
- [ ] Filter by category, priority, and status
- [ ] Navigate to Today, Upcoming, and Completed
- [ ] Refresh and verify tasks persist
- [ ] Toggle dark mode and refresh
- [ ] Test at mobile, tablet, and desktop widths

Before submission, test the app locally and record a short LinkedIn walkthrough as required by the internship instructions.
