
---

# 🧾 LUCT SYSTEM ACRONYM CHEAT SHEET

## 🎯 (FOR PRODUCTION UI & DEV CONSISTENCY)

---

# 🧠 1. CORE HIERARCHY TERMS

| Acronym | Full Meaning           | Internal Use               | UI Display (Production)                                               |
| ------- | ---------------------- | -------------------------- | --------------------------------------------------------------------- |
| FMG     | Faculty Managing Group | System top-level control   | **Faculty Management**                                                |
| PL      | Programme Leader       | Programme oversight        | **Programme Leader**                                                  |
| PRL     | Professional Lecturer  | Programme-level supervisor | **Senior Lecturer** *(or “Programme Supervisor” if you want clarity)* |
| YL      | Young Lecturer         | Assistant lecturer         | **Assistant Lecturer**                                                |

---

## ⚠️ Important Rule

* NEVER show: `FMG`, `PL`, `PRL`, `YL` in UI
* ALWAYS show readable titles

---

# 🏫 2. FACULTY ACRONYMS

| Acronym | Full Name                                         | UI Display                                 |
| ------- | ------------------------------------------------- | ------------------------------------------ |
| FICT    | Faculty of Information & Communication Technology | **Information & Communication Technology** |
| FBMG    | Faculty of Business & Management                  | **Business & Management**                  |
| FCMB    | Faculty of Communication, Media & Broadcasting    | **Communication, Media & Broadcasting**    |
| FDI     | Faculty of Design Innovation                      | **Design Innovation**                      |
| FCTH    | Faculty of Creativity in Tourism & Hospitality    | **Tourism & Hospitality**                  |
| FABE    | Faculty of Architecture & Built Environment       | **Architecture & Built Environment**       |

---

## ⚠️ UI Rule

* Backend: `FICT`
* UI: “Information & Communication Technology”

---

# 🎓 3. PROGRAMME / COURSE TERMS

| Term | Meaning                         | UI Usage       |
| ---- | ------------------------------- | -------------- |
| BIT  | Business Information Technology | Show full name |
| SE   | Software Engineering            | Show full name |
| IT   | Information Technology          | Show full name |
| IB   | International Business          | Show full name |
| HR   | Human Resource Management       | Show full name |
| PR   | Public Relations                | Show full name |
| JM   | Journalism & Media              | Show full name |

---

## ⚠️ Rule

* ❌ “SE 2A” alone
* ✅ “Software Engineering – Year 2 (Class A)”

---

# 🧑‍🏫 4. SYSTEM ROLE TERMS (USER-FACING)

| Internal Role | UI Label           | Description                    |
| ------------- | ------------------ | ------------------------------ |
| FMG           | Faculty Admin      | Oversees entire faculty        |
| PL            | Programme Leader   | Manages programmes             |
| PRL           | Senior Lecturer    | Supervises lecturers & reports |
| Lecturer      | Lecturer           | Teaches classes                |
| YL            | Assistant Lecturer | Supports teaching              |
| Student       | Student            | Attends classes                |

---

# 🧾 5. REPORTING TERMS

| Term           | UI Label             |
| -------------- | -------------------- |
| LectureSession | Lecture              |
| Report         | Lecture Report       |
| Attendance     | Attendance Record    |
| Rating         | Student Feedback     |
| Monitoring     | Performance Overview |

---

# 🏫 6. CLASS NAMING STANDARD

---

## ❌ Avoid:

* SE 2A
* IT 1B

---

## ✅ Use:

* Software Engineering – Year 2 (Class A)
* Information Technology – Year 1 (Class B)

---

## 🧠 Naming Formula:

```id="aqk1pq"
[Programme Name] – Year [X] (Class [A/B])
```

---

# 🧭 7. NAVIGATION LABEL RULES

| Screen              | UI Label             |
| ------------------- | -------------------- |
| FacultiesScreen     | Faculties            |
| ProgrammeListScreen | Programmes           |
| ClassesScreen       | Classes              |
| StaffListScreen     | Lecturers            |
| ReportsScreen       | Lecture Reports      |
| MonitoringScreen    | Performance Overview |
| RatingScreen        | Feedback             |
| AttendanceScreen    | Attendance           |

---

# ⚠️ 8. CRITICAL UX RULES

---

## 🚫 Never show:

* Codes (DSCSM, BSCSM, etc.)
* Internal hierarchy labels
* Raw database names

---

## ✅ Always show:

* Human-readable names
* Contextual labels
* Role-based simplified views

---

# 🧠 9. EXAMPLE TRANSFORMATION

---

## ❌ Backend View

```id="du1ccg"
Class: SE 2A
Faculty: FICT
Role: PRL
```

---

## ✅ UI View

```id="u38ak7"
Class: Software Engineering – Year 2 (Class A)
Faculty: Information & Communication Technology
Role: Senior Lecturer
```

---

# 🧩 FINAL RULE (NON-NEGOTIABLE)

> If a normal student cannot understand it instantly → it should not be in the UI.

---

## ✅ What this cheat sheet solves

* Prevents messy UI
* Keeps system professional
* Aligns backend with frontend
* Avoids confusion during development

---

