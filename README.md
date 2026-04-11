# Praxis — Frontend

**Frontend:** https://github.com/WGP-Industries/Student-Analysis-xAPI-project

**Backend:** https://github.com/WGP-Industries/INFO3604-Project-Backend

A React-based web application that allows students to record and review xAPI learning statements across two courses — COMP 3609 (Game Programming) and COMP 3610 (Big Data Analytics). An administrative interface provides full visibility into user activity, enrollments, statement data, and bulk import tooling.

---

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Application Roles](#application-roles)
- [Student Interface](#student-interface)
- [Admin Interface](#admin-interface)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Data Models](#data-models)

---

## Overview

Students authenticate, select a course group, choose a pedagogical stage, a course-specific project step, and a verb describing their activity, then submit an xAPI statement that is stored locally and forwarded to a remote LRS (Learning Record Store). Admins can view all statements, manage enrollments, bulk import students via CSV, and monitor platform activity through a dedicated control panel.

---

## Technology Stack

| Concern       | Library / Tool  |
| ------------- | --------------- |
| Framework     | React 18 (Vite) |
| Routing       | React Router v6 |
| State         | Redux Toolkit   |
| HTTP          | Axios           |
| Notifications | react-hot-toast |
| Styling       | Tailwind CSS    |

---

## Project Structure

```
src/
  configs/
    api.js                  # Axios instance with Bearer token interceptor
  hooks/
    useEnrollment.js        # Fetch, get, and join course enrollments
    useXAPI.js              # Build and send xAPI statements
  pages/
    Login.jsx               # Authentication (sign in / register)
    Dashboard.jsx           # Student dashboard (home, create, view tabs)
    admin/
      AdminLayout.jsx       # Sidebar shell for all admin pages
      AdminDashboard.jsx    # Overview stats and activity charts
      AdminUsers.jsx        # User management (role, delete)
      AdminEnrollments.jsx  # Enrollment management (enroll, edit, remove)
      AdminStatements.jsx   # All statements with filters
      AdminImport.jsx       # Bulk CSV import for groups and enrollments
  components/
    Home.jsx                # Student landing tab - course info, workflow, xAPI explainer
    StatementBuilder.jsx    # Form to compose and send an xAPI statement
    StatementsView.jsx      # Table of the current user's own statements
    ChangePassword.jsx      # Modal for changing the current user's password
  store/
    store.js                # Redux store
    features/
      authSlice.js          # Auth state: user, isLoggedIn, isLoading, enrollments
  utils/
    constants.js            # COURSES, STEPS, XAPI_VERBS
    xapi.js                 # buildStatement() utility
```

---

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- The backend API must be running and reachable

---

## Installation

```bash
git clone https://github.com/WGP-Industries/Student-Analysis-xAPI-project.git
cd Student-Analysis-xAPI-project
npm install
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000
```

Set `VITE_API_URL` to the base URL of the backend server. All API requests are prefixed with this value automatically by the Axios instance in `src/configs/api.js`.

---

## Running the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm run preview
```

---

## Application Roles

The application supports two roles, determined by the `role` field on the authenticated user object returned from the backend.

| Role      | Landing Page | Access                                       |
| --------- | ------------ | -------------------------------------------- |
| `student` | `/dashboard` | Home, Create Statement, View Statements      |
| `admin`   | `/admin`     | Full platform access via admin control panel |

Admins who navigate to `/dashboard` are automatically redirected to `/admin`. Students who attempt to access `/admin` are redirected to `/dashboard`. Unauthenticated users are redirected to `/login`. Users already logged in who navigate to `/login` are redirected to their appropriate landing page.

### Session Rehydration

On every page load, `App.jsx` checks for a JWT in `localStorage` and calls `GET /api/user/me` to restore the user to Redux state before any route guard evaluates. The `isLoading` flag in `authSlice` is initialised to `true` and only set to `false` once this check completes, preventing route guards from redirecting authenticated users to `/login` on refresh. A full-page spinner is shown during this window.

Route guards are implemented as wrapper components in `App.jsx`:

- `ProtectedRoute` — waits for rehydration, then redirects to `/login` if unauthenticated
- `ProtectedAdmin` — waits for rehydration, then redirects non-admins away from `/admin`
- `PublicRoute` — redirects already-authenticated users away from `/login` to their landing page

---

## Student Interface

### Home Tab

The default tab after login. Contains:

- A time-aware greeting using the student's username
- A plain-English explanation of the portal's purpose
- A numbered 3-step workflow (select group → choose stage, step and verb → submit)
- An explanation of xAPI as an IEEE specification/standard with an Actor-Verb-Object breakdown and a concrete example
- An explanation of the LRS as a database for storing and retrieving xAPI records
- Stage cards defining each of the five pedagogical stages
- Course cards for COMP 3609 and COMP 3610 showing enrolled group status, project description, course-specific project steps, and all available verbs as chips
- A call-to-action button that navigates directly to the Create Statement tab

### Create Statement Tab

1. Select a course (COMP 3609 or COMP 3610).
2. Select a group. Groups are fetched dynamically from `GET /api/courses/:courseCode/groups`. The selection is saved immediately to the backend as an enrollment.
3. Select a pedagogical stage (Planning, Exploration, Construction, Testing, Reflection).
4. Select a project step specific to the chosen course (e.g. Mechanics Implementation for COMP 3609, Data Preparation for COMP 3610).
5. Select a verb describing the activity performed. Each verb shows a plain-English description of what it represents.
6. Optionally add a free-text description for additional context.
7. Submit. The statement is built client-side, sent to `POST /api/xapi`, stored in the database, and forwarded to the LRS.

A live preview bar at the bottom of the form shows exactly what will be sent before submitting.

### View Statements Tab

Displays all statements submitted by the current user, including the project step column. Filterable by course via tab buttons. Data is fetched from `GET /api/xapi/statements`.

### Change Password

Available from the dashboard header. Opens a modal requiring the current password before accepting a new one. Calls `PATCH /api/user/me/password`.

---

## Admin Interface

All admin pages are nested under `/admin` and protected by a role check. Only users with `role: "admin"` can access them. Navigation is via a persistent left sidebar.

### Overview (`/admin`)

Displays aggregated platform statistics fetched from `GET /api/xapi/admin/stats`:

- Total users, statements, enrollments, and LRS-synced count
- Statement counts broken down by course, group, top verbs, and stage as horizontal bar charts
- Daily statement volume for the past 7 days as a bar chart

### Users (`/admin/users`)

Fetches all registered users from `GET /api/user/all`. Admins can promote or demote any user's role via `PATCH /api/user/:id/role` and delete accounts via `DELETE /api/user/:id`. An admin cannot act on their own account.

### Enrollments (`/admin/enrollments`)

Fetches all enrollments from `GET /api/enrollments`, filterable by course and group. Admins can edit a row inline to change group or project status, remove an enrollment, or manually enroll a student by email via a modal form. New groups can be created inline directly from the enrollment interface.

### Statements (`/admin/statements`)

Fetches all statements regardless of enrollment scope from `GET /api/xapi/admin/statements`. Filterable by course, group, verb text, and stage. Each row shows the stage, project step, and LRS sync status.

### Import (`/admin/import`)

Bulk data entry via CSV upload with drag-and-drop support.

**Groups import** — Upload a CSV with a single `name` column to create multiple groups for a course at once. Duplicate group names are skipped automatically.

**Enrollments import** — Upload a flexible CSV to create student accounts and enroll them in one or both courses simultaneously. Missing fields are derived automatically:

| Missing field | Derivation                |
| ------------- | ------------------------- |
| `email`       | `{username}@my.uwi.edu`   |
| `username`    | Part of email before `@`  |
| `password`    | Default `studentUWi@1234` |

The CSV can include `comp3609` and/or `comp3610` columns with group names. Groups are created automatically if they do not already exist. A skip/overwrite toggle controls behaviour for students already enrolled. A preview table is shown before confirming the import, and a results summary (enrolled, new accounts, skipped, failed) is shown after.

---

## State Management

Redux Toolkit is used with a single `auth` slice.

| Field         | Description                                               |
| ------------- | --------------------------------------------------------- |
| `user`        | Authenticated user object including `role`                |
| `isLoggedIn`  | Boolean                                                   |
| `isLoading`   | Starts `true`, set to `false` after rehydration completes |
| `enrollments` | Array of the current user's enrollment documents          |

The `selectIsAdmin` selector (`state.auth.user?.role === "admin"`) is used by route guards and the Dashboard redirect.

---

## API Integration

All requests go through `src/configs/api.js`, an Axios instance that automatically attaches the `Authorization: Bearer <token>` header from `localStorage` on every request. The base URL is set from the `VITE_API_URL` environment variable.

---

## Data Models

The following shapes reflect what the frontend receives from the API.

### Group

| Field    | Type   | Notes                               |
| -------- | ------ | ----------------------------------- |
| `_id`    | String | MongoDB ObjectId                    |
| `name`   | String | Display name, e.g. `Group A`        |
| `slug`   | String | URL-safe identifier, e.g. `group-a` |
| `course` | String | ObjectId ref to Course              |

### Enrollment

| Field                | Type   | Notes                                     |
| -------------------- | ------ | ----------------------------------------- |
| `user`               | String | ObjectId ref to User                      |
| `course`             | Object | Populated: courseCode, name, uri, project |
| `group`              | Object | Populated: name, slug                     |
| `projectStatus`      | String | `not-started`, `in-progress`, `completed` |
| `projectStartedAt`   | String | ISO date, set on first join               |
| `projectCompletedAt` | String | ISO date, set when status is completed    |

### Statement

| Field            | Type    | Notes                          |
| ---------------- | ------- | ------------------------------ |
| `user`           | Object  | Populated: username, email     |
| `course`         | Object  | Populated: courseCode, name    |
| `group`          | Object  | Populated: name, slug          |
| `verb.uri`       | String  | Full verb URI                  |
| `verb.display`   | String  | Human-readable verb label      |
| `stage`          | String  | Pedagogical stage              |
| `problemStep`    | String  | Course-specific project step   |
| `description`    | String  | Optional context               |
| `rawStatement`   | Object  | Full xAPI statement JSON       |
| `lrsSynced`      | Boolean | True once LRS confirms receipt |
| `lrsStatementId` | String  | ID returned by the LRS         |
