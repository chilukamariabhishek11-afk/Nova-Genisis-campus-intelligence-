"""
Syllabus Completion & Curriculum Tracking Engine
Tracks detailed course progress, module/unit breakdown, pacing velocity,
and departmental curriculum health.
"""

from typing import Dict, Any, List
import json
import os

SYLLABUS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "syllabus_data.json")

DEFAULT_COURSES = [
    {
        "course_id": "CS301",
        "course_name": "Data Structures & Algorithms",
        "department": "Computer Science",
        "instructor": "Dr. Sunita Mehta",
        "semester": "5th Semester",
        "total_lectures_planned": 45,
        "lectures_completed": 36,
        "target_completion_date": "2026-11-20",
        "status": "On Track",
        "units": [
            {"unit_no": 1, "title": "Asymptotic Analysis & Linear Structures (Arrays, Stacks, Queues)", "modules": 5, "completed": 5, "status": "Completed"},
            {"unit_no": 2, "title": "Non-Linear Structures (Trees, AVL, B-Trees, Heaps)", "modules": 6, "completed": 6, "status": "Completed"},
            {"unit_no": 3, "title": "Graph Algorithms (BFS, DFS, Dijkstra, MST)", "modules": 5, "completed": 5, "status": "Completed"},
            {"unit_no": 4, "title": "Dynamic Programming & Greedy Algorithms", "modules": 5, "completed": 3, "status": "In Progress"},
            {"unit_no": 5, "title": "Advanced Algorithmic Paradigms & NP-Completeness", "modules": 4, "completed": 0, "status": "Pending"}
        ]
    },
    {
        "course_id": "CS302",
        "course_name": "Database Management Systems",
        "department": "Computer Science",
        "instructor": "Prof. Rajesh Verma",
        "semester": "5th Semester",
        "total_lectures_planned": 40,
        "lectures_completed": 28,
        "target_completion_date": "2026-11-25",
        "status": "On Track",
        "units": [
            {"unit_no": 1, "title": "Relational Model, ER Diagrams & Relational Algebra", "modules": 4, "completed": 4, "status": "Completed"},
            {"unit_no": 2, "title": "SQL Mastery & Advanced Query Optimization", "modules": 5, "completed": 5, "status": "Completed"},
            {"unit_no": 3, "title": "Normalization (1NF to BCNF) & Integrity Constraints", "modules": 4, "completed": 3, "status": "In Progress"},
            {"unit_no": 4, "title": "Transaction Management & ACID Concurrency Control", "modules": 4, "completed": 0, "status": "Pending"},
            {"unit_no": 5, "title": "Indexing (B+ Trees) & NoSQL Architectures", "modules": 3, "completed": 0, "status": "Pending"}
        ]
    },
    {
        "course_id": "CS303",
        "course_name": "Operating Systems & Virtualization",
        "department": "Computer Science",
        "instructor": "Dr. Anand Kulkarni",
        "semester": "5th Semester",
        "total_lectures_planned": 42,
        "lectures_completed": 29,
        "target_completion_date": "2026-11-22",
        "status": "On Track",
        "units": [
            {"unit_no": 1, "title": "Process Management, Threads & CPU Scheduling", "modules": 5, "completed": 5, "status": "Completed"},
            {"unit_no": 2, "title": "Process Synchronization, Semaphores & Deadlocks", "modules": 5, "completed": 5, "status": "Completed"},
            {"unit_no": 3, "title": "Memory Management, Paging & Virtual Memory", "modules": 4, "completed": 3, "status": "In Progress"},
            {"unit_no": 4, "title": "File Systems, Disk Scheduling & I/O Systems", "modules": 4, "completed": 0, "status": "Pending"},
            {"unit_no": 5, "title": "Containerization, Linux Kernel & Virtualization", "modules": 4, "completed": 0, "status": "Pending"}
        ]
    },
    {
        "course_id": "AI304",
        "course_name": "Machine Learning & Predictive Analytics",
        "department": "Data Science",
        "instructor": "Dr. Priyanka Nair",
        "semester": "5th Semester",
        "total_lectures_planned": 45,
        "lectures_completed": 38,
        "target_completion_date": "2026-11-15",
        "status": "Ahead of Schedule",
        "units": [
            {"unit_no": 1, "title": "Supervised Learning (Regression & Classification)", "modules": 5, "completed": 5, "status": "Completed"},
            {"unit_no": 2, "title": "Tree Models, Ensembles (Random Forest, XGBoost)", "modules": 5, "completed": 5, "status": "Completed"},
            {"unit_no": 3, "title": "Unsupervised Learning (Clustering, PCA, t-SNE)", "modules": 5, "completed": 5, "status": "Completed"},
            {"unit_no": 4, "title": "Neural Networks & Deep Learning Foundations", "modules": 5, "completed": 4, "status": "In Progress"},
            {"unit_no": 5, "title": "Model Evaluation, Explainability (SHAP) & Deployment", "modules": 4, "completed": 1, "status": "In Progress"}
        ]
    },
    {
        "course_id": "EC305",
        "course_name": "Computer Networks & Protocols",
        "department": "Electronics & Comm",
        "instructor": "Prof. Vikram Joshi",
        "semester": "5th Semester",
        "total_lectures_planned": 38,
        "lectures_completed": 19,
        "target_completion_date": "2026-11-18",
        "status": "Delayed (Needs Remedial)",
        "units": [
            {"unit_no": 1, "title": "Physical & Data Link Layers (Framing, Error Detection)", "modules": 4, "completed": 4, "status": "Completed"},
            {"unit_no": 2, "title": "Network Layer, Routing Algorithms & IPv4/IPv6", "modules": 5, "completed": 3, "status": "In Progress"},
            {"unit_no": 3, "title": "Transport Layer (TCP Congestion Control, UDP)", "modules": 5, "completed": 0, "status": "Pending"},
            {"unit_no": 4, "title": "Application Layer & Network Security Essentials", "modules": 4, "completed": 0, "status": "Pending"}
        ]
    },
    {
        "course_id": "TR306",
        "course_name": "Professional Aptitude & Corporate Communication",
        "department": "Training & Placement",
        "instructor": "Ms. Shalini Saxena",
        "semester": "5th Semester",
        "total_lectures_planned": 36,
        "lectures_completed": 28,
        "target_completion_date": "2026-11-10",
        "status": "On Track",
        "units": [
            {"unit_no": 1, "title": "Quantitative Aptitude & Speed Mathematics", "modules": 4, "completed": 4, "status": "Completed"},
            {"unit_no": 2, "title": "Logical Reasoning, Syllogisms & Critical Thinking", "modules": 4, "completed": 4, "status": "Completed"},
            {"unit_no": 3, "title": "Corporate Communication & Group Discussion Tactics", "modules": 4, "completed": 3, "status": "In Progress"},
            {"unit_no": 4, "title": "Behavioral STAR Interview Technique & Resume Crafting", "modules": 4, "completed": 1, "status": "In Progress"}
        ]
    }
]

class SyllabusEngine:
    _courses: List[Dict[str, Any]] = []

    @classmethod
    def load(cls) -> List[Dict[str, Any]]:
        if os.path.exists(SYLLABUS_FILE):
            try:
                with open(SYLLABUS_FILE, "r", encoding="utf-8") as f:
                    cls._courses = json.load(f)
                    return cls._courses
            except Exception:
                pass
        cls._courses = DEFAULT_COURSES
        cls.save()
        return cls._courses

    @classmethod
    def save(cls):
        os.makedirs(os.path.dirname(SYLLABUS_FILE), exist_ok=True)
        with open(SYLLABUS_FILE, "w", encoding="utf-8") as f:
            json.dump(cls._courses, f, indent=2)

    @classmethod
    def get_all(cls) -> List[Dict[str, Any]]:
        if not cls._courses:
            cls.load()
        # Compute dynamic progress percentage for each course
        for c in cls._courses:
            total_mods = sum(u["modules"] for u in c["units"])
            comp_mods = sum(u["completed"] for u in c["units"])
            c["total_modules"] = total_mods
            c["completed_modules"] = comp_mods
            c["completion_pct"] = round((comp_mods / total_mods) * 100, 1) if total_mods > 0 else 0
            c["lecture_pct"] = round((c["lectures_completed"] / c["total_lectures_planned"]) * 100, 1)
        return cls._courses

    @classmethod
    def get_summary(cls) -> Dict[str, Any]:
        courses = cls.get_all()
        avg_completion = round(sum(c["completion_pct"] for c in courses) / len(courses), 1)
        total_units = sum(len(c["units"]) for c in courses)
        completed_units = sum(len([u for u in c["units"] if u["status"] == "Completed"]) for c in courses)
        
        # Department rollup
        dept_map = {}
        for c in courses:
            dept = c["department"]
            if dept not in dept_map:
                dept_map[dept] = []
            dept_map[dept].append(c["completion_pct"])
            
        dept_summary = {
            k: round(sum(v) / len(v), 1) for k, v in dept_map.items()
        }

        delayed_courses = [c["course_name"] for c in courses if "Delayed" in c["status"]]

        return {
            "overall_campus_syllabus_pct": avg_completion,
            "total_courses": len(courses),
            "total_units": total_units,
            "completed_units": completed_units,
            "in_progress_units": total_units - completed_units,
            "department_completion": dept_summary,
            "delayed_courses_count": len(delayed_courses),
            "delayed_courses": delayed_courses,
            "health_status": "Healthy (Target Achievable)" if avg_completion >= 70 else "At Risk"
        }

    @classmethod
    def update_unit_progress(cls, course_id: str, unit_no: int, completed_modules: int, status: str) -> Dict[str, Any]:
        courses = cls.get_all()
        for c in courses:
            if c["course_id"] == course_id:
                for u in c["units"]:
                    if u["unit_no"] == unit_no:
                        u["completed"] = min(u["modules"], max(0, completed_modules))
                        u["status"] = status
                        cls.save()
                        return {"success": True, "course": c}
        return {"success": False, "error": "Course or unit not found"}

