Alright, let’s build this like an actual product, not a sketchpad.
I’ll walk you **screen-by-screen**, showing:

* layout structure
* components
* user flow
* what data appears
* what actions exist

This is your **wireframe blueprint** a dev + designer can follow directly.

---

# 📱 0. GLOBAL DESIGN SYSTEM (APPLIES TO ALL SCREENS)

---

## 🧭 Navigation Style

* **Top:** Page title + search icon
* **Center:** Content (cards / lists)
* **Bottom:** Tab navigation

---

## 🔘 Bottom Tabs (Dynamic per role)

**Student**

* Home
* Classes
* Attendance
* Feedback

**Lecturer / PRL / PL**

* Home
* Classes
* Reports
* Monitoring

**FMG**

* Home
* Faculties
* Reports
* Monitoring

---

## 🧱 UI Components (Reusable)

* Card (main navigation unit)
* List item (compact info)
* Status badge (e.g. Submitted / Pending)
* Action button (“Open”, “View”, “Submit”)

---

# 🔐 1. LOGIN SCREEN

---

## 🧩 Layout

* Logo (top center)
* Title: *“LUCT Academic System”*
* Input:

  * Email
  * Password
* Button: **Login**
* Link: “Register (Students only)”

---

## ⚙️ Logic

* Detect role on login
* Route to correct dashboard

---

## 🔄 Flow

```id="loginflow"
Login → Role Detection → DashboardScreen (scoped)
```

---

# 🏠 2. HOME / DASHBOARD SCREEN

---

## 🎯 Purpose

Quick overview + shortcuts

---

## 🧩 Layout

### 🔝 Header

* “Welcome, [Name]”
* Role label (e.g. Lecturer)

---

### 📊 Summary Cards

* Classes Today
* Pending Reports
* Attendance Rate
* Feedback Score

---

### ⚡ Quick Actions

* Open Classes
* Open Reports
* Open Monitoring

---

## 👀 Role Differences

| Role     | What Changes               |
| -------- | -------------------------- |
| Student  | shows classes + attendance |
| Lecturer | shows reports + classes    |
| PRL      | shows programme stats      |
| FMG      | shows faculty stats        |

---

# 🏫 3. FACULTIES SCREEN (FMG ONLY)

---

## 🧩 Layout

Card list:

* Information & Communication Technology
* Business & Management
* Media & Broadcasting
* Design Innovation
* Tourism & Hospitality
* Architecture

---

## 🔘 Each Card

* Faculty name
* Number of programmes
* Button: **Open Faculty**

---

## 🔄 Flow

```id="facflow"
Faculties → FacultyDetailScreen
```

---

# 🏢 4. FACULTY DETAIL SCREEN

---

## 🧩 Layout

### 🔝 Header

* Faculty Name

---

### 📦 Sections

* Programmes (card list)
* Staff Overview
* Performance Summary

---

## 🔘 Actions

* Open Programme
* View Staff
* View Reports

---

# 🎓 5. PROGRAMME LIST SCREEN

---

## 🧩 Layout

List of programmes under faculty

Example:

* Software Engineering
* Business IT
* Information Technology

---

## 🔘 Each Item

* Programme Name
* Button: **Open Programme**

---

# 📘 6. PROGRAMME DETAIL SCREEN

---

## 🧩 Layout

### Sections:

* Classes
* Lecturers
* Courses
* Reports Summary

---

## 🔘 Actions

* Open Classes
* Open Lecturers
* View Reports

---

---

# 👨‍🏫 7. STAFF LIST SCREEN

---

## 🧩 Layout

List of lecturers (filtered by scope)

Each item:

* Name
* Role (Lecturer / Senior Lecturer)
* Button: **View Profile**

---

---

# 👤 8. STAFF DETAIL SCREEN

---

## 🧩 Layout

* Name
* Role
* Assigned Classes
* Courses

---

## 📊 Stats

* Reports submitted
* Average rating
* Attendance %

---

---

# 🏫 9. CLASSES SCREEN

---

## 🧩 Layout

Card list:

Example:

* Software Engineering – Year 2 (Class A)
* Information Technology – Year 1 (Class B)

---

## 🔘 Each Card

* Programme
* Lecturer
* Next Lecture Time

Buttons:

* Open Class
* Attendance
* Reports

---

---

# 📖 10. LECTURES SCREEN

---

## 🧩 Layout

List of lecture sessions:

* Date
* Time
* Venue

---

## 🔘 Actions

* Take Attendance
* Submit Report

---

---

# 📝 11. REPORT FORM SCREEN

---

## 🧩 Layout (Form)

Fields:

* Faculty
* Class
* Week
* Date
* Course
* Lecturer
* Attendance (present / total)
* Venue
* Time
* Topic
* Learning Outcomes
* Recommendations

---

## 🔘 Buttons

* Save Draft
* Submit Report

---

---

# 📊 12. REPORTS SCREEN

---

## 🧩 Layout

List of reports:

Each item:

* Class
* Date
* Status (Pending / Reviewed / Approved)

---

## 🔘 Actions

* View Report
* Review (PRL only)

---

---

# ✅ 13. ATTENDANCE SCREEN

---

## 🧩 Layout

* Class Name
* Student count

---

## Input

* Present
* Total

---

## Output

* Attendance %

---

---

# ⭐ 14. RATING / FEEDBACK SCREEN

---

## 🧩 Layout (Student Only)

* Lecturer name
* Rating (1–5 stars)
* Feedback text

---

## 🔘 Button

* Submit Feedback

---

---

# 📈 15. MONITORING SCREEN

---

## 🧩 Layout

### Metrics:

* Attendance %
* Report completion %
* Average rating

---

## 📊 Sections

* Per class
* Per lecturer
* Per programme

---

---

# 🧠 16. NAVIGATION FLOW (FULL)

```id="navflow"
Login
 → Dashboard
   → Faculties
     → Programmes
       → Classes
         → Lectures
           → Report
```

---

# 🔐 17. ROLE-BASED SCREEN ACCESS

---

## 🎓 Student

* Dashboard
* Classes
* Attendance
* Feedback

---

## 👨‍🏫 Lecturer

* Dashboard
* Classes
* Reports
* Attendance

---

## 🧑‍💼 PRL

* Everything in programme scope
* Reports review

---

## 🧑‍🏫 PL

* Programme management
* Course assignment

---

## 🧠 FMG

* All faculties
* Full monitoring

---

# ⚠️ FINAL UX RULES

---

## 🚫 DO NOT

* Combine screens into one
* Show hierarchy to students
* Use raw codes

---

## ✅ ALWAYS

* Use clean cards
* Use clear navigation
* Keep screens focused

---

# 🧩 FINAL RESULT

If built correctly, your app will feel like:

* navigating rooms (not scrolling pages)
* each click = deeper context
* each role = different world

---

## 🎯 What you now have

You now fully defined:

* UI structure
* navigation
* screen responsibilities
* user flows

---
