"""
Nova Genisis Campus Intelligence — Main FastAPI Application
Enterprise-Grade Smart Campus Analytics & AI-Powered Student Success Platform
"""

import os
import io
import csv
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel

from backend.data_engine import DataStore
from backend.scoring_engine import ScoringEngine
from backend.ai_advisor import AIAdvisorEngine
from backend.syllabus_engine import SyllabusEngine

app = FastAPI(
    title="Nova Genisis Campus Intelligence",
    description="Analytics & AI-Powered Student Success Platform",
    version="2.0.0"
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static")
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")

# Mount static folder
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Ensure initial data is loaded
DataStore.load()
SyllabusEngine.load()

# --- Pydantic Schemas ---
class LoginRequest(BaseModel):
    email: str
    password: str

class SyllabusUpdateRequest(BaseModel):
    course_id: str
    unit_no: int
    completed_modules: int
    status: str

class AIChatRequest(BaseModel):
    query: str
    student_id: Optional[str] = None

class InterventionTriggerRequest(BaseModel):
    student_id: str
    action_type: str  # "email_notice", "schedule_counseling", "assign_mentor", "remedial_enrollment"
    notes: Optional[str] = ""

# --- Authentication Endpoint ---
@app.post("/api/auth/login")
def login(req: LoginRequest):
    email = req.email.strip().lower()
    pw = req.password.strip()

    # Admin Login
    if "admin" in email or email == "dean.office@campus.edu":
        return {
            "authenticated": True,
            "role": "admin",
            "user": {
                "name": "Dr. Arvind Verma",
                "email": email,
                "role": "admin",
                "role_title": "Dean of Academic Affairs & Institutional Analytics",
                "department": "Campus Administration",
                "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=AdminDean"
            }
        }
    
    # Faculty Login
    if "faculty" in email or "prof" in email or email == "faculty@campus.edu" or email == "prof.mehta@campus.edu":
        return {
            "authenticated": True,
            "role": "faculty",
            "user": {
                "name": "Dr. Sunita Mehta",
                "email": email,
                "role": "faculty",
                "role_title": "Associate Professor & Senior Academic Mentor",
                "department": "Computer Science & Engineering",
                "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=ProfMehta"
            }
        }

    # Student Login - Lookup in DB or default to Rahul Sharma
    student = None
    all_students = DataStore.get_all()
    for s in all_students:
        if s["email"].lower() == email or email == "student@campus.edu":
            student = s
            break

    if not student:
        # Default to first student if demo
        student = all_students[0]

    metrics = ScoringEngine.calculate_student_metrics(student)
    return {
        "authenticated": True,
        "role": "student",
        "user": {
            "student_id": student["student_id"],
            "name": student["name"],
            "email": student["email"],
            "role": "student",
            "role_title": f"{student['year']} Undergraduate — {student['department']}",
            "department": student["department"],
            "avatar": student["avatar"],
            "success_score": metrics["success_score"],
            "overall_risk": metrics["risks"]["overall_risk"]
        }
    }

# --- Student Analytics Endpoints ---
@app.get("/api/students")
def list_students(
    search: Optional[str] = None,
    risk: Optional[str] = None,
    segment: Optional[str] = None,
    department: Optional[str] = None
):
    students = DataStore.get_all()
    results = []

    for s in students:
        metrics = ScoringEngine.calculate_student_metrics(s)
        
        # Filtering
        if search:
            q = search.lower()
            if q not in s["name"].lower() and q not in s["student_id"].lower() and q not in s["department"].lower():
                continue

        if department and department != "All Departments":
            if s["department"] != department:
                continue

        if risk and risk != "All Risks":
            if risk == "Dual-Risk" and metrics["risks"]["overall_risk"] != "Dual-Risk":
                continue
            elif risk == "High Risk" and metrics["risks"]["overall_risk"] not in ["High Risk", "Dual-Risk"]:
                continue
            elif risk == "Moderate Risk" and metrics["risks"]["overall_risk"] != "Moderate Risk":
                continue
            elif risk == "Safe" and metrics["risks"]["overall_risk"] != "Safe / Thriving":
                continue

        if segment and segment != "All Segments":
            if segment not in metrics["segmentation"]["segment_name"]:
                continue

        results.append({
            "student_id": s["student_id"],
            "name": s["name"],
            "email": s["email"],
            "department": s["department"],
            "year": s["year"],
            "specialization": s["specialization"],
            "avatar": s["avatar"],
            "cgpa": s["academic"]["cgpa"],
            "backlogs": s["academic"]["active_backlogs"],
            "attendance_pct": s["attendance"]["overall_pct"],
            "coding_score": s["placement"]["coding_score"],
            "aptitude_score": s["placement"]["aptitude_score"],
            "success_score": metrics["success_score"],
            "academic_risk": metrics["risks"]["academic_risk"],
            "placement_risk": metrics["risks"]["placement_risk"],
            "overall_risk": metrics["risks"]["overall_risk"],
            "risk_color": metrics["risks"]["risk_color"],
            "segment_name": metrics["segmentation"]["segment_name"],
            "segment_badge": metrics["segmentation"]["segment_badge"],
            "top_positive_driver": metrics["explainability"]["top_positive_driver"]["dimension"],
            "top_negative_drag": metrics["explainability"]["top_negative_drag"]["dimension"]
        })

    # Sort by success score descending by default
    results.sort(key=lambda x: x["success_score"], reverse=True)
    return {"total": len(results), "students": results}

@app.get("/api/students/{student_id}")
def get_student_details(student_id: str):
    student = DataStore.get_by_id(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    metrics = ScoringEngine.calculate_student_metrics(student)
    interventions = AIAdvisorEngine.generate_student_interventions(student, metrics)

    return {
        "student": student,
        "metrics": metrics,
        "interventions": interventions
    }

@app.get("/api/students/{student_id}/interventions")
def get_student_interventions(student_id: str):
    student = DataStore.get_by_id(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    metrics = ScoringEngine.calculate_student_metrics(student)
    return AIAdvisorEngine.generate_student_interventions(student, metrics)

# --- Executive Campus Analytics & Segmentation ---
@app.get("/api/analytics/summary")
def get_campus_analytics_summary():
    students = DataStore.get_all()
    all_metrics = [ScoringEngine.calculate_student_metrics(s) for s in students]

    total = len(students)
    avg_score = round(sum(m["success_score"] for m in all_metrics) / total, 1)
    avg_cgpa = round(sum(s["academic"]["cgpa"] for s in students) / total, 2)
    avg_att = round(sum(s["attendance"]["overall_pct"] for s in students) / total, 1)
    avg_lms = round(sum(s["lms"]["assignment_completion_pct"] for s in students) / total, 1)

    # Risk counts
    dual_risk = len([m for m in all_metrics if m["risks"]["overall_risk"] == "Dual-Risk"])
    high_risk = len([m for m in all_metrics if m["risks"]["overall_risk"] in ["High Risk", "Dual-Risk"]])
    mod_risk = len([m for m in all_metrics if m["risks"]["overall_risk"] == "Moderate Risk"])
    safe = len([m for m in all_metrics if m["risks"]["overall_risk"] == "Safe / Thriving"])

    # Placement readiness
    plc_ready = len([m for m in all_metrics if m["risks"]["placement_risk"] == "Low"])
    plc_critical = len([m for m in all_metrics if m["risks"]["placement_risk"] == "Critical"])

    # Attendance detention risk (<75%)
    att_risk = len([s for s in students if s["attendance"]["overall_pct"] < 75.0])

    # Department benchmarks
    dept_map = {}
    for s, m in zip(students, all_metrics):
        d = s["department"]
        if d not in dept_map:
            dept_map[d] = {"scores": [], "cgpas": [], "att": [], "count": 0}
        dept_map[d]["scores"].append(m["success_score"])
        dept_map[d]["cgpas"].append(s["academic"]["cgpa"])
        dept_map[d]["att"].append(s["attendance"]["overall_pct"])
        dept_map[d]["count"] += 1

    dept_benchmarks = []
    for d, data in dept_map.items():
        dept_benchmarks.append({
            "department": d,
            "student_count": data["count"],
            "avg_success_score": round(sum(data["scores"]) / data["count"], 1),
            "avg_cgpa": round(sum(data["cgpas"]) / data["count"], 2),
            "avg_attendance": round(sum(data["att"]) / data["count"], 1)
        })

    return {
        "total_students": total,
        "avg_success_score": avg_score,
        "avg_cgpa": avg_cgpa,
        "avg_attendance_pct": avg_att,
        "avg_lms_completion_pct": avg_lms,
        "risk_breakdown": {
            "dual_risk": dual_risk,
            "high_risk": high_risk,
            "moderate_risk": mod_risk,
            "safe_thriving": safe,
            "at_risk_pct": round((high_risk / total) * 100, 1)
        },
        "placement_breakdown": {
            "placement_ready_count": plc_ready,
            "placement_ready_pct": round((plc_ready / total) * 100, 1),
            "critical_placement_risk": plc_critical
        },
        "attendance_detention_risk_count": att_risk,
        "department_benchmarks": dept_benchmarks
    }

@app.get("/api/analytics/segmentation")
def get_segmentation_analysis():
    students = DataStore.get_all()
    segments = {}

    for s in students:
        m = ScoringEngine.calculate_student_metrics(s)
        seg_name = m["segmentation"]["segment_name"]
        if seg_name not in segments:
            segments[seg_name] = {
                "name": seg_name,
                "badge": m["segmentation"]["segment_badge"],
                "description": m["segmentation"]["description"],
                "students": []
            }
        segments[seg_name]["students"].append({
            "student_id": s["student_id"],
            "name": s["name"],
            "cgpa": s["academic"]["cgpa"],
            "coding": s["placement"]["coding_score"],
            "score": m["success_score"],
            "department": s["department"]
        })

    results = []
    for k, v in segments.items():
        results.append({
            "segment_name": v["name"],
            "badge": v["badge"],
            "description": v["description"],
            "count": len(v["students"]),
            "pct": round((len(v["students"]) / len(students)) * 100, 1),
            "students": v["students"]
        })

    results.sort(key=lambda x: x["count"], reverse=True)
    return {"total_students": len(students), "segments": results}

# --- Syllabus Tracking Endpoints ---
@app.get("/api/syllabus")
def list_syllabus_courses():
    return {"courses": SyllabusEngine.get_all()}

@app.get("/api/syllabus/summary")
def get_syllabus_summary():
    return SyllabusEngine.get_summary()

@app.post("/api/syllabus/update")
def update_syllabus(req: SyllabusUpdateRequest):
    res = SyllabusEngine.update_unit_progress(
        req.course_id, req.unit_no, req.completed_modules, req.status
    )
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res.get("error", "Failed to update"))
    return res

# --- AI Chat Advisor ---
@app.post("/api/ai/chat")
def ai_chat(req: AIChatRequest):
    students = DataStore.get_all()
    # If student_id specified, ensure lookup
    if req.student_id:
        target_student = DataStore.get_by_id(req.student_id)
        if target_student:
            metrics = ScoringEngine.calculate_student_metrics(target_student)
            interventions = AIAdvisorEngine.generate_student_interventions(target_student, metrics)
            return {
                "query": req.query,
                "reply": (
                    f"### 🤖 AI Coach Analysis for {target_student['name']}\n\n"
                    f"- **Your Success Score**: `{metrics['success_score']}/100`\n"
                    f"- **Current Segment**: **{metrics['segmentation']['segment_name']}**\n"
                    f"- **Strongest Subject**: {max(target_student['academic']['subject_marks'].items(), key=lambda x: x[1])[0]} ({max(target_student['academic']['subject_marks'].values())}/100)\n"
                    f"- **Priority Focus**: {interventions['prioritized_interventions'][0]['title']}\n\n"
                    f"**Next Steps**:\n"
                    f"{interventions['prioritized_interventions'][0]['action_steps'][0]}\n\n"
                    f"*Target Impact*: {interventions['prioritized_interventions'][0]['expected_impact']}"
                )
            }

    # General campus query
    return AIAdvisorEngine.answer_query(
        req.query, students, ScoringEngine.calculate_student_metrics
    )

# --- Faculty Intervention Trigger Action ---
@app.post("/api/interventions/trigger")
def trigger_intervention(req: InterventionTriggerRequest):
    student = DataStore.get_by_id(req.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    action_titles = {
        "email_notice": "Official Academic & Attendance Advisory Notice Sent",
        "schedule_counseling": "1-on-1 Faculty Mentorship Session Scheduled",
        "assign_mentor": "Senior Peer Coding & Academic Mentor Assigned",
        "remedial_enrollment": "Enrolled in Special Remedial & Backlog Support Track"
    }

    title = action_titles.get(req.action_type, "Intervention Logged")

    return {
        "success": True,
        "student_id": req.student_id,
        "student_name": student["name"],
        "action_taken": title,
        "timestamp": "2026-10-13 10:30 AM",
        "status": "Dispatched to Student & Mentor"
    }

# --- CSV Export Endpoint ---
@app.get("/api/export/csv")
def export_csv():
    students = DataStore.get_all()
    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Student ID", "Name", "Email", "Department", "Year",
        "CGPA", "Active Backlogs", "Attendance %", "LMS Logins/Wk", "Assignment Completion %",
        "Hackathons", "Certifications", "Coding Score", "Aptitude Score", "Mock Interview",
        "Tech Skill Score", "Soft Skill Score", "Student Success Score",
        "Academic Risk", "Placement Risk", "Overall Risk", "Strategic Segment"
    ])

    for s in students:
        m = ScoringEngine.calculate_student_metrics(s)
        writer.writerow([
            s["student_id"], s["name"], s["email"], s["department"], s["year"],
            s["academic"]["cgpa"], s["academic"]["active_backlogs"], s["attendance"]["overall_pct"],
            s["lms"]["weekly_logins"], s["lms"]["assignment_completion_pct"],
            s["engagement"]["hackathons_participated"], s["engagement"]["certifications_count"],
            s["placement"]["coding_score"], s["placement"]["aptitude_score"], s["placement"]["mock_interview_rating"],
            s["skills"]["technical_score"], s["skills"]["soft_skills_score"],
            m["success_score"], m["risks"]["academic_risk"], m["risks"]["placement_risk"],
            m["risks"]["overall_risk"], m["segmentation"]["segment_name"]
        ])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=campus_student_success_dataset.csv"}
    )

# --- Root HTML Route ---
@app.get("/", response_class=HTMLResponse)
def serve_index():
    index_file = os.path.join(TEMPLATES_DIR, "index.html")
    if os.path.exists(index_file):
        with open(index_file, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse("<h1>Nexus Campus Intelligence: Loading UI...</h1>")

