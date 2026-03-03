# Student Analysis xAPI - Frontend

**Repository:** https://github.com/WGP-Industries/Student-Analysis-xAPI-project

A React-based web application that allows students to record and review xAPI learning statements across two courses - COMP 3609 (Game Programming) and COMP 3610 (Big Data Analytics). An administrative interface provides users with full visibility into user activity, enrollments, and statement data.

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

---

## Overview

Students authenticate, select a course group, choose a verb describing their activity, and submit an xAPI statement that is stored locally and forwarded to a remote LRS (Learning Record Store). Admins can view all statements, manage enrollments, and monitor platform activity through a dedicated control panel.

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
  components/
    Home.jsx                # Student landing tab - course info, workflow, xAPI explainer
    StatementBuilder.jsx    # Form to compose and send an xAPI statement
    StatementsView.jsx      # Table of the current user's own statements
  store/
    store.js                # Redux store
    features/
      authSlice.js          # Auth state: user, isLoggedIn, isLoading, enrollments
  utils/
    constants.js            # COURSES, XAPI_VERBS
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

On every page load, `App.jsx` checks for a JWT in `localStorage` and calls `GET /api/user/me` to restore the user to Redux state before any route guard evaluates. The `isLoading` flag in `authSlice` is initialised to `true` and only set to `false` once this check completes. This prevents route guards from firing prematurely and redirecting authenticated users to `/login` on refresh.

Route guards are implemented as wrapper components in `App.jsx`:

- `ProtectedRoute` - waits for rehydration, then redirects to `/login` if unauthenticated
- `ProtectedAdmin` - waits for rehydration, then redirects non-admins away from `/admin`
- `PublicRoute` - redirects already-authenticated users away from `/login` to their landing page

---

## Student Interface

### Home Tab (`/dashboard`)

The default tab after login. Contains:

- A time-aware greeting using the student's username
- A plain-English explanation of the portal's purpose
- A numbered 3-step workflow (select group, choose verb, submit)
- Course cards for COMP 3609 and COMP 3610 showing enrolled group status, project description, and all available verbs as chips
- A background section explaining the Actor-Verb-Object structure of xAPI with a concrete example
- A call-to-action button that navigates directly to the Create Statement tab

### Create Statement Tab

1. Select a course (COMP 3609 or COMP 3610).
2. Select a group. Groups are fetched dynamically from `GET /api/courses/:courseCode/groups` and reflect whatever groups have been created by students or admins for that course. The selection is saved immediately to the backend as an enrollment and can be changed at any time.
3. Select a verb describing the activity performed. COMP 3609 verbs cover game development stages (Designed, Implemented, Animated, Integrated, Debugged, Modelled, Applied, Constructed, Tested, Optimised). COMP 3610 verbs cover data project milestones (Proposed, Collected, Cleaned, Analysed, Visualised, Evaluated, Built, Documented, Reviewed, Presented).
4. Optionally add a free-text description for additional context.
5. Submit. The statement is built client-side, sent to `POST /api/xapi`, stored in the database, and forwarded to the LRS.

### View Statements Tab

Displays all statements submitted by the current user. Filterable by course via tab buttons. Data is fetched from `GET /api/xapi/statements`.

---

## Admin Interface

All admin pages are nested under `/admin` and protected by a role check. Only users with `role: "admin"` can access them.

### Overview (`/admin`)

Displays aggregated platform statistics fetched from `GET /api/xapi/admin/stats`:

- Total users, statements, enrollments, and LRS-synced count
- Statement counts broken down by course, group, top verbs, and stage as horizontal bar charts
- Daily statement volume for the past 7 days as a bar chart

### Users (`/admin/users`)

Fetches all registered users from `GET /api/user/all`. Admins can promote or demote any user's role via `PATCH /api/user/:id/role` and delete accounts via `DELETE /api/user/:id`. An admin cannot act on their own account.

### Enrollments (`/admin/enrollments`)

Fetches all enrollments from `GET /api/enrollments`, filterable by course and group. Admins can edit a row inline to change group or project status, remove an enrollment, or manually enroll a student by email via a modal form. New groups can be created inline directly from the enrollment interface without leaving the page.

### Statements (`/admin/statements`)

Fetches all statements regardless of enrollment scope from `GET /api/xapi/admin/statements`. Filterable by course, group, verb text, and stage. Each row shows the stage and LRS sync status of the statement.

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

The following shapes reflect what the frontend receives from the API and stores in local state.

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
| `course`             | String | ObjectId ref to Course                    |
| `group`              | String | ObjectId ref to Group                     |
| `projectStatus`      | String | `not-started`, `in-progress`, `completed` |
| `projectStartedAt`   | String | ISO date, set on first join               |
| `projectCompletedAt` | String | ISO date, set when status is completed    |

### Statement

| Field            | Type    | Notes                              |
| ---------------- | ------- | ---------------------------------- |
| `user`           | String  | ObjectId ref to User               |
| `course`         | String  | ObjectId ref to Course             |
| `group`          | String  | ObjectId ref to Group              |
| `verb.uri`       | String  | Full verb URI                      |
| `verb.display`   | String  | Human-readable verb label          |
| `stage`          | String  | Stage of the activity              |
| `scenario`       | String  | Scenario context for the statement |
| `description`    | String  | Optional context                   |
| `rawStatement`   | Object  | Full xAPI statement JSON           |
| `lrsSynced`      | Boolean | True once LRS confirms receipt     |
| `lrsStatementId` | String  | ID returned by the LRS             |
