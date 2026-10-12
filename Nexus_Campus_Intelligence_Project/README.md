# Nexus Campus Intelligence
### Analytics & AI-Powered Student Success Platform

---

## 📌 Overview
**Nexus Campus Intelligence** is an enterprise-grade academic decision intelligence platform that integrates 7 disconnected campus data streams into a single unified 360° student view. It calculates an explainable **Student Success Score**, identifies dual risks (**Academic Risk** & **Placement Risk**), tracks **Curriculum & Syllabus Completion**, and provides **AI-powered individualized interventions**.

---

## 🚀 Quick Start (Running Locally)

### Prerequisites
- Python 3.10+ installed (`python --version`)

### 1. Install Dependencies
```bash
pip install fastapi uvicorn pandas scikit-learn
```

### 2. Launch the Application
Double-click `run.bat` OR run:
```bash
python server.py
```

### 3. Open in Browser
- **Local machine**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Teammates on the same Wi-Fi / Hotspot**: `http://<YOUR-IP>:8000` (e.g., `http://10.100.49.224:8000`)

---

## 🔑 Demo Login Credentials

The platform features role-based access with 1-click login buttons on the login screen:

| Role | Email | Password | What You See |
| :--- | :--- | :--- | :--- |
| **👨‍🎓 Student** | `student@campus.edu` | `student123` | Personal Success Score, Driver Waterfall, Competency Radar, Course Syllabus Progress, Personal AI Coach |
| **👩‍🏫 Faculty** | `faculty@campus.edu` | `faculty123` | Cohort KPIs, Risk Distribution, Roster with Filters & Search, 1-Click Interventions, Syllabus Unit Logger, Student Deep-Dive Modal |
| **🏛️ Admin** | `admin@campus.edu` | `admin123` | Institutional KPIs, Department Benchmarks, 4-Quadrant Segmentation Matrix, Campus Syllabus Health, 1-Click CSV Dataset Export |

---

## 📂 Project Structure
```
├── backend/
│   ├── app.py             # FastAPI REST endpoints & auth
│   ├── data_engine.py     # 7-source multi-dimensional student data synthesis
│   ├── scoring_engine.py  # Student Success Score, risk flags & explainability
│   ├── ai_advisor.py      # Individualized AI recommendations & chat assistant
│   └── syllabus_engine.py # Course & unit syllabus tracking engine
├── data/
│   ├── students_unified.json  # 60 unified student records across branches
│   └── syllabus_data.json     # Course-wise syllabus units and status
├── static/
│   ├── css/custom.css     # Premium styling, curved buttons & glassmorphism
│   └── js/
│       ├── app.js         # Frontend controller & role view switcher
│       ├── charts.js      # Chart.js gauges, radars, waterfalls & scatter plots
│       └── ai_chat.js     # Context-aware AI chat assistant
├── templates/
│   └── index.html         # Single-page application UI with modals
├── documentation/
│   ├── STUDENT_SUCCESS_SCORE_METHODOLOGY.md  # Detailed scoring formulas & weights
│   └── PRESENTATION_NOTES.md                 # 5 executive presentation slide notes
├── run.bat                # 1-click Windows launcher
└── server.py              # Uvicorn server runner
```

---

## 🎯 Key Features & Highlights

1. **7-Source Data Ingestion**: Unifies Academic, Attendance, LMS Activity, Campus Engagement, Placement Readiness, Practical Skills, and Student Wellbeing/Feedback.
2. **Explainable AI Scoring**: Displays exact positive point drivers and negative drag deductions relative to the cohort mean ($\mu = 72.8$).
3. **Dual-Risk Early Warning**: Flags both Academic Risk (detention/backlog) and Placement Risk (coding/interview anxiety).
4. **Curriculum & Syllabus Completion Tracker**: Real-time tracking of lecture delivery velocity and unit completion across departments.
5. **Strategic Student Segmentation**: Clusters students into 4 actionable quadrants for targeted bootcamps and faculty counseling.
6. **Data Export**: 1-click downloadable CSV dataset for offline analysis.
