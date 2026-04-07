# LimkoDigiCampus App Design

## Product Goal

LimkoDigiCampus is a role-based mobile reporting and monitoring app for LUCT faculty operations. The core value of the system is helping lecturers submit lecture reports, while students, Principal Lecturers, and Program Leaders monitor academic activity from different perspectives.

This design keeps the assignment focused on:

- clear role-based modules
- strong Firebase data flow
- an Expo-friendly mobile UI
- features that directly match the marking criteria

## Core Roles

### Student

- Register and log in
- View enrolled classes
- View attendance status
- Monitor lecture activity
- Rate lecturer or class experience

### Lecturer

- Log in
- View assigned classes
- Record student attendance
- Submit lecture reports
- Monitor submitted reports
- View ratings

### Principal Lecturer (PRL)

- View all courses and lecturers under their stream
- Review lecturer reports
- Add feedback to reports
- Monitor reporting performance
- View class activity and ratings

### Program Leader (PL)

- Manage courses
- Assign lecturers to modules
- View reports reviewed by PRL
- Monitor faculty activity
- View classes, lecturers, and ratings

## Design Direction

The app should feel academic, structured, and modern rather than playful. A polished assignment UI is more likely to score well than an overly decorative one.

### Visual tone

- calm
- professional
- clean
- slightly premium

### UI principles

- use cards to group information
- keep primary actions obvious
- avoid overcrowded screens
- show only role-relevant features
- keep forms broken into smaller steps

## Theme System

### Color palette

Use a dark-neutral "Bunker" palette for a distinctive identity:

- `bunker-50`: `#f0f1f2`
- `bunker-100`: `#dadbdf`
- `bunker-200`: `#b8bac3`
- `bunker-300`: `#9a9daa`
- `bunker-400`: `#7f8393`
- `bunker-500`: `#686c7a`
- `bunker-600`: `#525561`
- `bunker-700`: `#3e414a`
- `bunker-800`: `#2c2d35`
- `bunker-900`: `#1a1c21`
- `bunker-950`: `#121317`

### Light mode

- background: `bunker-50`
- surface card: translucent white
- primary text: `bunker-900`
- secondary text: `bunker-500`
- border: `bunker-100`

### Dark mode

- background: `bunker-950`
- surface card: `rgba(44,45,53,0.72)`
- primary text: `bunker-50`
- secondary text: `bunker-300`
- border: `bunker-800`

### Accent colors

Use only a few accents so dashboards remain readable:

- success: `#2f9e44`
- warning: `#f08c00`
- error: `#e03131`
- info: `#1971c2`

## Typography

Recommended pairing for Expo:

- headings: `Poppins` or `Manrope`
- body: `Inter` or `Nunito Sans`

If you want to stay close to the previous concept, use a single clean family throughout for consistency.

## Navigation Architecture

### Shared app structure

- Auth stack
- Role-based app shell
- Bottom tabs for major sections
- Stack screens for details and forms

### Auth flow

1. Splash
2. Login
3. Register
4. Role selection during registration
5. Route user to role-specific dashboard

### Bottom tabs

The tabs should be role-aware rather than identical for every role.

#### Student tabs

- Home
- Classes
- Attendance
- Profile

#### Lecturer tabs

- Home
- Classes
- Reports
- Profile

#### PRL tabs

- Home
- Courses
- Reports
- Profile

#### PL tabs

- Home
- Courses
- Management
- Profile

## Screen Inventory

## Shared Screens

### Splash

- app logo
- short subtitle
- loading animation

### Login

- email
- password
- login button
- link to register

### Register

- full name
- email
- password
- confirm password
- role selector
- register button

### Profile

- name
- email
- role
- faculty or department
- theme toggle
- logout

## Student Screens

### Student Dashboard

- welcome header
- quick stats
- upcoming classes
- attendance summary
- recent lecturer ratings

### My Classes

- search bar
- enrolled class cards
- class details

### Attendance

- attendance percentage by course
- present vs absent indicators

### Rating

- list of lecturers or classes
- star rating input
- optional comment

## Lecturer Screens

### Lecturer Dashboard

- classes today
- report submission status
- average attendance
- quick action to add report

### Lecturer Classes

- search bar
- course name
- course code
- venue
- time
- buttons: `View`, `Take Attendance`, `Add Report`

### Take Attendance

- student list
- present/absent toggles
- save attendance button

### Reports List

- search bar
- submitted reports
- pending reports
- report status badges

### Report Form

Break the form into steps for better UX.

#### Step 1: Class details

- faculty name
- class name
- course name
- course code
- lecturer name

#### Step 2: Session details

- week of reporting
- date of lecture
- venue
- scheduled lecture time

#### Step 3: Attendance

- actual number of students present
- total registered students

The total registered students value should come from the class record if already stored. If it does not exist yet, allow the lecturer or PL to set it once and store it for future retrieval.

#### Step 4: Teaching details

- topic taught
- learning outcomes

#### Step 5: Reflection

- lecturer recommendations
- submit report

## PRL Screens

### PRL Dashboard

- total reports awaiting review
- reviewed reports
- flagged attendance issues
- stream overview

### Courses Under Stream

- list of assigned courses
- lecturer names
- course status

### Report Review

- report details
- attendance summary
- lecturer recommendations
- PRL feedback field
- approve or return status

## PL Screens

### PL Dashboard

- total lecturers
- active courses
- reports submitted this week
- low-compliance alerts

### Course Management

- add course
- assign lecturer
- set faculty and stream
- edit course metadata

### Lecturer Management

- lecturer list
- assigned modules
- reporting compliance

### Reports Overview

- view reports escalated or reviewed by PRL
- search and filter by lecturer, course, week, or status

## Reusable Components

Build a small reusable design system early.

### Foundation components

- `ScreenWrapper`
- `AppHeader`
- `Card`
- `PrimaryButton`
- `SecondaryButton`
- `TextInputField`
- `SelectField`
- `SearchBar`
- `EmptyState`
- `StatusBadge`
- `Loader`

### Dashboard components

- `StatCard`
- `UpcomingClassCard`
- `QuickActionTile`

### Form components

- `StepIndicator`
- `DatePickerField`
- `TimePickerField`
- `TextAreaField`

## Firestore Data Model

Use normalized collections so the app can scale beyond the assignment demo.

### `users`

```ts
{
  id: string,
  fullName: string,
  email: string,
  role: "student" | "lecturer" | "prl" | "pl",
  facultyId: string,
  streamId?: string,
  createdAt: Timestamp
}
```

### `faculties`

```ts
{
  id: string,
  name: string
}
```

### `courses`

```ts
{
  id: string,
  facultyId: string,
  streamId: string,
  courseName: string,
  courseCode: string,
  className: string,
  lecturerId: string,
  principalLecturerId?: string,
  totalRegisteredStudents: number,
  venue: string,
  scheduledLectureTime: string,
  createdAt: Timestamp
}
```

### `attendance`

```ts
{
  id: string,
  courseId: string,
  lectureDate: string,
  lecturerId: string,
  totalPresent: number,
  records: Array<{
    studentId: string,
    status: "present" | "absent"
  }>,
  createdAt: Timestamp
}
```

### `reports`

```ts
{
  id: string,
  facultyName: string,
  className: string,
  weekOfReporting: string,
  dateOfLecture: string,
  courseName: string,
  courseCode: string,
  lecturerId: string,
  lecturerName: string,
  courseId: string,
  actualStudentsPresent: number,
  totalRegisteredStudents: number,
  venue: string,
  scheduledLectureTime: string,
  topicTaught: string,
  learningOutcomes: string,
  lecturerRecommendations: string,
  prlFeedback?: string,
  reviewStatus: "submitted" | "reviewed" | "returned",
  submittedAt: Timestamp,
  reviewedAt?: Timestamp
}
```

### `ratings`

```ts
{
  id: string,
  studentId: string,
  courseId: string,
  lecturerId: string,
  rating: number,
  comment?: string,
  createdAt: Timestamp
}
```

## Role Permissions

### Student

- read own classes
- read own attendance
- create rating
- read limited report summaries if desired

### Lecturer

- read assigned courses
- create attendance
- create reports
- read own reports
- read their ratings summary

### PRL

- read courses in stream
- read reports in stream
- update report with feedback

### PL

- create and update courses
- assign lecturers
- read all reports for assigned faculty or stream

## Assignment-Ready Folder Structure

For Expo Router:

```txt
app/
  (auth)/
    login.tsx
    register.tsx
  (student)/
    home.tsx
    classes.tsx
    attendance.tsx
    profile.tsx
  (lecturer)/
    home.tsx
    classes.tsx
    reports.tsx
    report-form.tsx
    profile.tsx
  (prl)/
    home.tsx
    courses.tsx
    reports.tsx
    profile.tsx
  (pl)/
    home.tsx
    courses.tsx
    management.tsx
    profile.tsx
  _layout.tsx

src/
  components/
  constants/
  contexts/
  features/
  hooks/
  lib/
  services/
  store/
  types/
  utils/
```

For classic React Navigation, keep the same domain split inside `src/screens`.

## Search Functionality

This gives you extra credit and should be built into each major list screen.

### Search targets

- classes by name or course code
- reports by course, lecturer, week, or status
- lecturers by name
- courses by code or title

### Suggested implementation

- local search for small lists
- Firestore query plus client-side filtering for larger lists

## Excel Report Export

This is another strong extra-credit feature.

### Export options

- PL exports all reports
- PRL exports stream reports
- Lecturer exports own reports

### Data columns

- faculty
- class
- week
- lecture date
- course name
- course code
- lecturer
- attendance present
- total registered
- venue
- topic taught
- learning outcomes
- lecturer recommendations
- PRL feedback
- review status

In Expo, you can generate the data in JSON and convert it to worksheet format using an Excel library, or export CSV if Excel generation becomes too heavy for time.

## MVP Build Order

Build the app in this order so you always have a working version.

### Phase 1

- Expo app setup
- Tailwind NativeWind setup
- Firebase setup
- theme and auth context

### Phase 2

- login and register
- user profile persistence
- role-based routing

### Phase 3

- lecturer classes screen
- report form
- report submission to Firestore

### Phase 4

- student classes
- attendance display
- rating module

### Phase 5

- PRL report review and feedback
- PL course assignment and monitoring

### Phase 6

- search
- export
- notifications
- polishing

## What Will Score Well

To align with the marking rubric, prioritize these visibly:

### Frontend

- polished and consistent mobile UI
- intuitive navigation
- responsive forms
- loading and empty states

### Backend

- Firebase Auth
- Firestore reads and writes
- proper role-based data flow
- structured collections

### Code Quality

- reusable components
- typed models
- clean folder structure
- no duplicated business logic

## Recommended Demo Story

When presenting the app, use this flow:

1. Register or log in as Lecturer
2. View assigned classes
3. Take attendance
4. Submit a lecture report
5. Log in as PRL and add feedback
6. Log in as PL and show course assignment or monitoring
7. Log in as Student and rate lecturer

That sequence demonstrates nearly every required module in one clean walkthrough.
