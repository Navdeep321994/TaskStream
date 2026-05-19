# Realtime Workflow & Collaboration System

A full-stack workflow management system similar to a lightweight Jira/Trello board, built with React, Node.js, Express, MongoDB, and Socket.io.

## Features Implemented
1. **Authentication**: JWT-based login and registration with Bcrypt password hashing.
2. **Workflow Board**: Kanban-style board with `Backlog`, `In Progress`, `Review`, and `Done` stages.
3. **Drag & Drop**: Powered by `@dnd-kit/core` for moving tickets between stages.
4. **Realtime Updates**: Socket.io integration instantly broadcasts changes (creates, updates, deletes) to all connected clients.
5. **Activity Timeline**: Activity tracking logs who made what changes and displays them in a timeline on each ticket.
6. **Concurrent Update Handling**: Optimistic Concurrency Control using MongoDB's `__v` property to detect stale updates and prevent silent overwrites.
7. **Optimistic UI Updates**: UI updates instantly and gracefully reverts if the API fails.
8. **Search & Filters**: Search by title and filter by priority in real-time.
9. **Modern UI/UX**: Custom styling with dark mode, smooth gradients, micro-animations, and glassmorphism.

## Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://localhost:27017` or update `.env` with your URI)

## Setup Instructions

### 1. Clone & Environment
The project has two directories: `frontend` and `backend`.
Copy the `.env.example` to `backend/.env` and update the values if necessary.

### 2. Backend Setup
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Vite runs on http://localhost:5173
```

## Tech Stack
- **Frontend**: React (Vite), React Router, @dnd-kit (Core), Socket.io-client, Axios, date-fns.
- **Backend**: Node.js, Express, Mongoose, Socket.io, JsonWebToken, Bcrypt.

## Architecture & Edge Cases
- Clean separation of Frontend and Backend.
- Protected Routes & Token validation middleware.
- Error handling on backend using try-catch blocks and appropriate HTTP status codes (e.g. `409 Conflict` for concurrent update clashes).
- If two users try to update the same ticket at the same time, the backend will reject the second update with a `409` code, and the frontend will revert the UI state and show a warning message to the user.
