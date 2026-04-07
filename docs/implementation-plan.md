# LimkoDigiCampus Implementation Plan

## Best Practical Scope

The assignment describes a broad system. To finish on time and still score well, the best scope is:

- fully implement authentication
- fully implement lecturer report submission
- fully implement PRL feedback
- implement student attendance and rating
- implement PL course assignment at a manageable level
- add search everywhere
- export reports as CSV or Excel if time allows

## Priority Features

### Must-have

- login and registration
- role-based navigation
- lecturer classes
- lecturer report form
- Firestore database integration
- PRL report review and feedback
- student rating
- attendance module

### Should-have

- dashboard statistics
- theme toggle
- push notifications
- report status badges

### Extra credit

- search on every module
- downloadable report export

## Suggested Firebase Rules Strategy

Start simple but role-aware. Do not overcomplicate rules before the app works.

### General idea

- authenticated users can read their own profile
- lecturers can create reports only for themselves
- students can create ratings as themselves
- PRL can update `prlFeedback`
- PL can manage courses

## Example UX Flow for Report Submission

1. Lecturer opens `Classes`
2. Selects a course card
3. Taps `Add Report`
4. Form auto-fills stored class data
5. Lecturer enters session-specific details
6. App validates required fields
7. Save report to Firestore
8. Success state appears
9. Reports list updates immediately

## Practical Naming Conventions

- use `camelCase` for fields
- keep Firestore collection names plural
- use clear role IDs like `lecturerId`, `principalLecturerId`

## Validation Rules

### Report form

- all required fields must be filled
- attendance present cannot exceed total registered
- date cannot be empty
- rating must be between 1 and 5

## Submission Readiness Checklist

- project runs on Expo without crashes
- Firebase config is working
- at least one account per role exists
- seed data exists for demo
- reports save and display
- PRL feedback saves
- search works
- GitHub repo is clean and documented

## Recommended Next Build Step

If you want to move from design into code, the first implementation target should be:

- Expo app shell
- authentication
- lecturer classes and report flow

That gives you the strongest visible progress fastest.
