Alright. This is your **full Master Control Plan**—not a summary, not notes, but a **build-ready blueprint** a developer can follow without guessing.

---

# 🧠 LUCT ACADEMIC MONITORING SYSTEM

## 📘 MASTER CONTROL PLAN (BUILD SPECIFICATION)

---

# 🎯 1. CORE OBJECTIVE

Build a **mobile-first academic monitoring system** that:

* Tracks **lectures, attendance, and performance**
* Enables **structured reporting by lecturers**
* Provides **programme-level oversight (PRL, PL)**
* Gives **faculty-wide insights (FMG)**
* Maintains **clean UX like Google Classroom**
* Uses **clear navigation like Microsoft Teams**

---

# 🧭 2. SYSTEM VISION

This is NOT:

* a learning platform
* an assignment submission system

This IS:

> A **Lecture Reporting + Academic Monitoring System**

---

## 🧠 System Philosophy

* Data flows **UPWARD**
* Control flows **DOWNWARD**
* Visibility is **ROLE-BASED**

---

# 🎨 3. DESIGN & UX PRINCIPLES

---

## 🧩 UX Inspirations

* Google Classroom → simplicity
* Notion → structured navigation
* Trello → card-based UI

---

## 🚫 What to Avoid

* One long scrolling page
* Nested fake sections
* Showing hierarchy to students

---

## ✅ UI Behavior

* Each screen = one responsibility
* Navigation = switching spaces
* Cards = entry points

---

# 🏫 4. ACADEMIC STRUCTURE (INTERNAL ONLY)

```
FMG
 └── PL
      └── PRL
           └── Lecturers
                └── Students
```

⚠️ Only visible to:

* PRL
* PL
* FMG

NOT visible to students.

---

# 🏢 5. FACULTIES & PROGRAMMES

---

## 💻 FICT

* Software Engineering with Multimedia
* Business Information Technology
* Information Technology

---

## 📊 FBMG

* International Business
* Entrepreneurship
* Human Resource Management
* Business Management
* Retail Management
* Marketing

---

## 🎙️ FCMB

* Professional Communication
* Broadcasting & Journalism
* Television & Film Production
* Public Relations
* Journalism & Media

---

## 🎨 FDI

* Creative Advertising
* Graphic Design
* Fashion & Apparel Design

---

## 🏨 FCTH

* Tourism Management
* Hotel Management
* Events Management

---

## 🏗️ FABE

* Architectural Technology

---

# 👨‍🏫 6. LECTURER MASTER MAPPING

---

## 💻 FICT

**PLs**

* Kapela Morutwa
* Tsietsi Matjele

**PRLs**

* Mpotla Nthunya → Data Structures → SE 2A, SE 2B
* Khauhelo Mahlakeng → Database Systems → IT 2A, BIT 2A
* Batloung Hlabeli → Cyber Security → SE 3A, IT 3A
* Takura Bhile → Networking → IT 2B, BIT 2B

---

## 📊 FBMG

* Makatleho Mafura → Accounting → BM 2A
* Joalane Putsoa → Management → BM 1A
* Mamello Mahlomola → Strategy → IB 3A
* Likeleko Damane → Economics → IB 1A
* Motsabi Korotsoane → Ethics → HR 2A

---

## 🎙️ FCMB

* Tsepiso Mncina → PR → PR 2A
* Teboho Mokonyana → Video → TV 1A
* Mpaki Molapo → Journalism → JM 1A
* Thapelo Lebona → Media Law

---

## 🏗️ FABE

* Mapallo Monoko → Interior Design
* Teboho Ntsaba → Construction

---

## 🎨 FDI / 🏨 FCTH

* Thapelo Sebotsa → UI/UX
* Maili Moorosi → Multimedia

---

# 🧾 7. CLASS STRUCTURE

Each class:

* belongs to a programme
* has:

  * lecturer
  * course
  * students

Example:

```
Class: SE 2A
Programme: Software Engineering
Lecturer: Mpotla Nthunya
Course: Data Structures
```

---

# 🧠 8. DATA MODEL (SIMPLIFIED)

---

## Users

* id
* name
* role
* facultyId
* programmeId

---

## Faculty

* id
* name

---

## Programme

* id
* name
* facultyId

---

## Class

* id
* name
* programmeId
* lecturerId

---

## Course

* id
* name
* programmeId

---

## Report

* lectureId
* lecturerId
* topic
* attendance
* outcomes

---

## Rating

* studentId
* lecturerId
* score

---

# 🔐 9. ROLE PERMISSIONS

---

## 🎓 Student

✔ View classes
✔ Submit rating
✔ View attendance

❌ No hierarchy
❌ No reports

---

## 👨‍🏫 Lecturer

✔ Submit report
✔ View classes
✔ View ratings

❌ No faculty-wide data

---

## 🧑‍💼 PRL

✔ View all programme data
✔ Review reports
✔ Give feedback

---

## 🧑‍🏫 PL

✔ Manage programmes
✔ Assign lecturers
✔ View summaries

---

## 🧠 FMG

✔ Full system access
✔ View all faculties

---

# 🔄 10. SYSTEM WORKFLOW

---

## 📘 Lecture Flow

1. Lecturer opens class
2. Records attendance
3. Submits report
4. Students rate
5. PRL reviews
6. PL monitors
7. FMG analyzes

---

## 📊 Reporting Flow

```
Lecturer → Report → PRL → Feedback → PL → FMG
```

---

## 📉 Monitoring Flow

System calculates:

* attendance %
* report completion
* rating average

---

# 📱 11. SCREEN ARCHITECTURE

---

## Core Screens

* Login
* Home
* Faculties
* Programmes
* Classes
* Reports
* Attendance
* Ratings
* Monitoring

---

## Navigation Pattern

```
Home
 ├── Faculties
 │    └── Programmes
 │         └── Classes
 │              └── Reports
```

---

# ⚙️ 12. FUNCTIONAL FEATURES

* Search everywhere
* Export CSV/Excel
* Role dashboards
* Real-time filtering
* Report submission
* Attendance tracking
* Rating system

---

# 🧠 13. INTELLIGENT BEHAVIOR

---

## Scoped Login

Example:

Login as:

* Mpotla Nthunya

System shows:

* only his classes
* only his reports

---

## Auto Context Loading

PRL logs in → sees:

* their programme only

---

# ⚠️ 14. CRITICAL BUILD RULES

---

If you:

* mix roles → ❌ broken
* expose hierarchy to students → ❌ bad UX
* don’t map classes → ❌ unusable

---

If you:

* enforce scoped data ✔
* use real routing ✔
* structure screens ✔

→ system works correctly

---

# 🧩 FINAL STATEMENT

This system is:

* **Structured like Moodle**
* **Simple like Google Classroom**
* **Organized like Notion**
* **Navigable like Teams**

---

## 🧠 What a dev should now understand

After reading this, a developer should know:

* what to build
* how data flows
* how roles behave
* how screens connect
* how lecturers are mapped
* how the system behaves in real use

---
