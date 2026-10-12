"""
Data Engine: Multi-Source Student Data Integration & Synthesis
Integrates 7 data categories:
1. Academic (CGPA, marks, backlogs, subject breakdown)
2. Attendance (Overall %, subject attendance, absence risk)
3. LMS (Weekly login frequency, assignment completion rate, resource usage)
4. Engagement (Hackathons, clubs, certifications, campus events)
5. Placement (Aptitude score, coding benchmark, mock interviews, resume)
6. Skills (Technical assessment, soft-skill rating, domain track)
7. Feedback (Student satisfaction, faculty qualitative sentiment, wellbeing index)
"""

import json
import os
import random
from typing import Dict, List, Any, Optional

DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "students_unified.json")

def generate_default_students() -> List[Dict[str, Any]]:
    """Generates a rich, realistic synthetic dataset of 60 students representing diverse campus archetypes."""
    random.seed(42)  # Deterministic seed for reproducible baseline
    
    first_names = [
        "Rahul", "Priya", "Amit", "Sneha", "Aditya", "Ananya", "Rohan", "Kavya",
        "Vikram", "Pooja", "Arjun", "Neha", "Karthik", "Riya", "Varun", "Meera",
        "Siddharth", "Ishita", "Gaurav", "Divya", "Akash", "Tanvi", "Nikhil", "Shreya",
        "Harsh", "Simran", "Manish", "Deepika", "Kunal", "Swati", "Abhishek", "Ritika",
        "Suraj", "Nandini", "Pranav", "Aakanksha", "Saurabh", "Juhi", "Mayank", "Bhavna",
        "Chirag", "Alka", "Tarun", "Komal", "Yash", "Monika", "Sachin", "Pallavi",
        "Mohit", "Priyanka", "Deepak", "Asha", "Chetan", "Jyoti", "Rajesh", "Rashmi",
        "Sameer", "Geeta", "Hemant", "Sunita"
    ]
    
    last_names = [
        "Sharma", "Patel", "Verma", "Reddy", "Iyer", "Nair", "Gupta", "Singh",
        "Chatterjee", "Deshmukh", "Kulkarni", "Choudhury", "Joshi", "Menon", "Agarwal",
        "Rao", "Mishra", "Saxena", "Bhatia", "Malhotra", "Kapoor", "Pandey", "Mehta"
    ]
    
    departments = ["Computer Science", "Information Technology", "Electronics & Comm", "Data Science"]
    specializations = ["Full-Stack Development", "AI & Machine Learning", "Cloud & DevOps", "Cyber Security", "Data Engineering"]
    
    students = []
    
    # Archetype presets to guarantee meaningful segmentation
    # 0: Rahul Sharma (Benchmark Student Profile - High Performer)
    # 1: Priya Verma (High Academic, Low Placement - needs placement prep)
    # 2: Amit Patel (Placement Ready, Academic Risk - needs attendance/backlog remedy)
    # 3: Sneha Reddy (Dual Risk - urgent faculty intervention)
    
    archetypes = [
        # 0: Rahul Sharma (CSE, High Achiever)
        {
            "name": "Rahul Sharma",
            "email": "student@campus.edu",  # Primary demo student
            "student_id": "STU2024001",
            "dept": "Computer Science",
            "year": "3rd Year",
            "cgpa": 8.85,
            "backlogs": 0,
            "attendance": 92.4,
            "lms_logins": 18,
            "assignment_pct": 96.0,
            "hackathons": 4,
            "clubs": 2,
            "certifications": 3,
            "events": 8,
            "aptitude": 88,
            "coding": 92,
            "mock_interview": 8.7,
            "resume_score": 90,
            "tech_skill": 91,
            "soft_skill": 84,
            "satisfaction": 4.6,
            "sentiment": "Highly motivated, proactive participant in algorithmic clubs",
            "wellbeing": 88,
            "specialization": "AI & Machine Learning"
        },
        # 1: Priya Verma (High Academic, Low Placement)
        {
            "name": "Priya Verma",
            "email": "priya.verma@campus.edu",
            "student_id": "STU2024002",
            "dept": "Computer Science",
            "year": "3rd Year",
            "cgpa": 8.92,
            "backlogs": 0,
            "attendance": 94.0,
            "lms_logins": 20,
            "assignment_pct": 98.0,
            "hackathons": 0,
            "clubs": 1,
            "certifications": 1,
            "events": 4,
            "aptitude": 62,
            "coding": 48,
            "mock_interview": 4.5,
            "resume_score": 60,
            "tech_skill": 68,
            "soft_skill": 52,
            "satisfaction": 3.8,
            "sentiment": "Excels in theory and assignments; exhibits severe interview anxiety and limited coding speed",
            "wellbeing": 74,
            "specialization": "Full-Stack Development"
        },
        # 2: Amit Patel (Placement Ready, Academic Risk)
        {
            "name": "Amit Patel",
            "email": "amit.patel@campus.edu",
            "student_id": "STU2024003",
            "dept": "Information Technology",
            "year": "3rd Year",
            "cgpa": 6.18,
            "backlogs": 2,
            "attendance": 68.2,
            "lms_logins": 8,
            "assignment_pct": 64.0,
            "hackathons": 5,
            "clubs": 2,
            "certifications": 4,
            "events": 10,
            "aptitude": 84,
            "coding": 94,
            "mock_interview": 8.9,
            "resume_score": 88,
            "tech_skill": 92,
            "soft_skill": 86,
            "satisfaction": 3.4,
            "sentiment": "Brilliant developer and hacker, but neglects classroom attendance and theoretical exams",
            "wellbeing": 70,
            "specialization": "Cloud & DevOps"
        },
        # 3: Sneha Reddy (Dual Risk - Critical Intervention)
        {
            "name": "Sneha Reddy",
            "email": "sneha.reddy@campus.edu",
            "student_id": "STU2024004",
            "dept": "Electronics & Comm",
            "year": "3rd Year",
            "cgpa": 5.42,
            "backlogs": 3,
            "attendance": 61.5,
            "lms_logins": 4,
            "assignment_pct": 45.0,
            "hackathons": 0,
            "clubs": 0,
            "certifications": 0,
            "events": 2,
            "aptitude": 42,
            "coding": 35,
            "mock_interview": 3.8,
            "resume_score": 42,
            "tech_skill": 40,
            "soft_skill": 46,
            "satisfaction": 2.2,
            "sentiment": "Critical academic disengagement observed. Needs urgent 1-on-1 counseling and remedial classes",
            "wellbeing": 48,
            "specialization": "Data Engineering"
        }
    ]
    
    for arc in archetypes:
        student = build_student_record(arc)
        students.append(student)
        
    # Generate remaining 56 students distributed across various archetypes
    for i in range(4, 60):
        first = first_names[i % len(first_names)]
        last = last_names[(i * 3) % len(last_names)]
        name = f"{first} {last}"
        email = f"{first.lower()}.{last.lower()}{i}@campus.edu"
        dept = departments[i % len(departments)]
        spec = specializations[i % len(specializations)]
        
        # Segment bias for variety
        cohort_type = i % 4
        if cohort_type == 0:  # High All-rounder
            cgpa = round(random.uniform(7.8, 9.6), 2)
            backlogs = 0
            attendance = round(random.uniform(82.0, 96.0), 1)
            lms_logins = random.randint(12, 22)
            assignment_pct = round(random.uniform(85.0, 99.0), 1)
            hackathons = random.randint(1, 4)
            clubs = random.randint(1, 3)
            certs = random.randint(2, 4)
            aptitude = random.randint(75, 95)
            coding = random.randint(72, 96)
            mock_interview = round(random.uniform(7.5, 9.4), 1)
            tech_skill = random.randint(75, 94)
            soft_skill = random.randint(74, 92)
            satisfaction = round(random.uniform(4.0, 4.9), 1)
            wellbeing = random.randint(75, 95)
            sentiment = "Consistent, steady performer with positive classroom involvement"
        elif cohort_type == 1:  # Academic Star, Placement Lag
            cgpa = round(random.uniform(7.6, 9.4), 2)
            backlogs = 0
            attendance = round(random.uniform(80.0, 95.0), 1)
            lms_logins = random.randint(14, 24)
            assignment_pct = round(random.uniform(88.0, 100.0), 1)
            hackathons = random.randint(0, 1)
            clubs = random.randint(0, 1)
            certs = random.randint(0, 2)
            aptitude = random.randint(50, 68)
            coding = random.randint(40, 60)
            mock_interview = round(random.uniform(4.5, 6.2), 1)
            tech_skill = random.randint(55, 70)
            soft_skill = random.randint(48, 65)
            satisfaction = round(random.uniform(3.2, 4.0), 1)
            wellbeing = random.randint(60, 78)
            sentiment = "High theoretical mastery; requires mock aptitude & interview training"
        elif cohort_type == 2:  # Practical Hacker, Academic Drag
            cgpa = round(random.uniform(6.0, 7.1), 2)
            backlogs = random.choice([1, 2])
            attendance = round(random.uniform(64.0, 74.0), 1)
            lms_logins = random.randint(6, 12)
            assignment_pct = round(random.uniform(55.0, 72.0), 1)
            hackathons = random.randint(3, 6)
            clubs = random.randint(1, 3)
            certs = random.randint(3, 5)
            aptitude = random.randint(78, 94)
            coding = random.randint(80, 96)
            mock_interview = round(random.uniform(7.8, 9.2), 1)
            tech_skill = random.randint(82, 95)
            soft_skill = random.randint(78, 90)
            satisfaction = round(random.uniform(3.0, 3.8), 1)
            wellbeing = random.randint(65, 80)
            sentiment = "Strong developer portfolio; low lecture attendance triggers exam debarment risk"
        else:  # Underperformer / Dual Risk
            cgpa = round(random.uniform(4.8, 6.4), 2)
            backlogs = random.choice([2, 3, 4])
            attendance = round(random.uniform(52.0, 69.5), 1)
            lms_logins = random.randint(3, 8)
            assignment_pct = round(random.uniform(35.0, 58.0), 1)
            hackathons = 0
            clubs = 0
            certs = random.choice([0, 1])
            aptitude = random.randint(35, 55)
            coding = random.randint(30, 52)
            mock_interview = round(random.uniform(3.2, 5.0), 1)
            tech_skill = random.randint(35, 55)
            soft_skill = random.randint(40, 58)
            satisfaction = round(random.uniform(2.0, 3.2), 1)
            wellbeing = random.randint(40, 62)
            sentiment = "Underperforming across multiple dimensions; requires integrated faculty mentor intervention"

        resume_score = int((aptitude * 0.4 + coding * 0.4 + tech_skill * 0.2) * 0.95)
        resume_score = max(35, min(98, resume_score))

        record = {
            "name": name,
            "email": email,
            "student_id": f"STU2024{i+1:03d}",
            "dept": dept,
            "year": "3rd Year",
            "cgpa": cgpa,
            "backlogs": backlogs,
            "attendance": attendance,
            "lms_logins": lms_logins,
            "assignment_pct": assignment_pct,
            "hackathons": hackathons,
            "clubs": clubs,
            "certifications": certs,
            "events": random.randint(2, 9),
            "aptitude": aptitude,
            "coding": coding,
            "mock_interview": mock_interview,
            "resume_score": resume_score,
            "tech_skill": tech_skill,
            "soft_skill": soft_skill,
            "satisfaction": satisfaction,
            "sentiment": sentiment,
            "wellbeing": wellbeing,
            "specialization": spec
        }
        students.append(build_student_record(record))
        
    return students

def build_student_record(d: Dict[str, Any]) -> Dict[str, Any]:
    """Expands base parameters into full multi-source integrated profile with subject breakdowns."""
    cgpa = d["cgpa"]
    base_mark = int(cgpa * 9.5)
    
    # Subject breakdown
    subjects = {
        "Data Structures & Algorithms": min(98, max(40, base_mark + random.randint(-8, 8))),
        "Database Management Systems": min(98, max(40, base_mark + random.randint(-6, 9))),
        "Operating Systems": min(98, max(40, base_mark + random.randint(-9, 7))),
        "Machine Learning": min(98, max(40, base_mark + random.randint(-7, 10))),
        "Computer Networks": min(98, max(40, base_mark + random.randint(-8, 8))),
        "Discrete Mathematics": min(98, max(40, base_mark + random.randint(-12, 6)))
    }
    
    # Subject-wise attendance
    overall_att = d["attendance"]
    subject_attendance = {
        k: min(100.0, max(45.0, round(overall_att + random.uniform(-6.0, 5.0), 1)))
        for k in subjects.keys()
    }
    
    # Syllabus progress individual tracker
    syllabus_progress = {
        "Data Structures & Algorithms": {"completed_modules": 4, "total_modules": 5, "progress_pct": 80},
        "Database Management Systems": {"completed_modules": 3, "total_modules": 5, "progress_pct": 60},
        "Operating Systems": {"completed_modules": 3, "total_modules": 5, "progress_pct": 65},
        "Machine Learning": {"completed_modules": 4, "total_modules": 5, "progress_pct": 85},
        "Computer Networks": {"completed_modules": 2, "total_modules": 4, "progress_pct": 50},
        "Discrete Mathematics": {"completed_modules": 3, "total_modules": 4, "progress_pct": 75}
    }
    
    return {
        "student_id": d["student_id"],
        "name": d["name"],
        "email": d["email"],
        "department": d["dept"],
        "year": d["year"],
        "specialization": d["specialization"],
        "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={d['student_id']}",
        
        # 1. Academic Data
        "academic": {
            "cgpa": d["cgpa"],
            "internal_marks_avg": base_mark,
            "active_backlogs": d["backlogs"],
            "subject_marks": subjects,
            "academic_history": [
                {"semester": "Sem 1", "sgpa": round(max(5.0, d["cgpa"] - 0.4), 2)},
                {"semester": "Sem 2", "sgpa": round(max(5.2, d["cgpa"] - 0.2), 2)},
                {"semester": "Sem 3", "sgpa": round(max(5.0, d["cgpa"] + 0.1), 2)},
                {"semester": "Sem 4", "sgpa": round(max(5.1, d["cgpa"] - 0.1), 2)},
                {"semester": "Sem 5", "sgpa": d["cgpa"]}
            ]
        },
        
        # 2. Attendance Data
        "attendance": {
            "overall_pct": d["attendance"],
            "subject_attendance": subject_attendance,
            "classes_attended": int(d["attendance"] * 1.8),
            "classes_total": 180,
            "below_mandatory_threshold": d["attendance"] < 75.0,
            "absence_streak": random.randint(0, 3) if d["attendance"] > 75.0 else random.randint(3, 8)
        },
        
        # 3. LMS Activity Data
        "lms": {
            "weekly_logins": d["lms_logins"],
            "assignment_completion_pct": d["assignment_pct"],
            "assignments_submitted": int(d["assignment_pct"] * 0.2),
            "assignments_total": 20,
            "video_watch_hours": round(d["lms_logins"] * 1.8, 1),
            "forum_contributions": random.randint(1, 15) if d["assignment_pct"] > 75 else random.randint(0, 3),
            "last_active": "2 hours ago" if d["lms_logins"] > 10 else "4 days ago"
        },
        
        # 4. Engagement Data
        "engagement": {
            "hackathons_participated": d["hackathons"],
            "technical_clubs_count": d["clubs"],
            "certifications_count": d["certifications"],
            "campus_events_attended": d["events"],
            "club_roles": "Core Technical Lead" if d["clubs"] >= 2 and d["tech_skill"] > 80 else ("Member" if d["clubs"] > 0 else "None")
        },
        
        # 5. Placement Data
        "placement": {
            "aptitude_score": d["aptitude"],
            "coding_score": d["coding"],
            "mock_interview_rating": d["mock_interview"],
            "resume_score": d["resume_score"],
            "drive_eligibility": d["cgpa"] >= 6.5 and d["backlogs"] == 0 and d["attendance"] >= 75.0,
            "mock_interviews_taken": random.randint(2, 5) if d["mock_interview"] > 6 else random.randint(0, 2)
        },
        
        # 6. Skills Assessment
        "skills": {
            "technical_score": d["tech_skill"],
            "soft_skills_score": d["soft_skill"],
            "top_technical_skills": ["Python", "Algorithms", "SQL", "React"] if d["tech_skill"] > 75 else ["Basic C++", "HTML/CSS"],
            "skill_radar": {
                "Algorithms": min(100, d["coding"]),
                "System Design": min(100, int(d["tech_skill"] * 0.9)),
                "Communication": min(100, d["soft_skill"]),
                "Problem Solving": min(100, d["aptitude"]),
                "Database/SQL": min(100, subjects["Database Management Systems"]),
                "Domain Knowledge": min(100, int(cgpa * 10))
            }
        },
        
        # 7. Feedback & Wellbeing
        "feedback": {
            "student_satisfaction": d["satisfaction"],
            "faculty_remarks": d["sentiment"],
            "wellbeing_index": d["wellbeing"],
            "stress_level": "Low" if d["wellbeing"] > 75 else ("Moderate" if d["wellbeing"] > 55 else "High Concern"),
            "counseling_recommended": d["wellbeing"] < 60 or d["backlogs"] >= 2
        },
        
        # Syllabus Tracking Data per Student
        "syllabus": {
            "courses": syllabus_progress,
            "overall_completed_pct": round(sum(c["progress_pct"] for c in syllabus_progress.values()) / len(syllabus_progress), 1),
            "pending_modules_count": sum(c["total_modules"] - c["completed_modules"] for c in syllabus_progress.values())
        }
    }

class DataStore:
    """Manages reading and writing of unified student records."""
    _students: List[Dict[str, Any]] = []
    
    @classmethod
    def load(cls) -> List[Dict[str, Any]]:
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, "r", encoding="utf-8") as f:
                    cls._students = json.load(f)
                    return cls._students
            except Exception:
                pass
        
        # Fallback to generating default dataset
        cls._students = generate_default_students()
        cls.save()
        return cls._students

    @classmethod
    def save(cls):
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(cls._students, f, indent=2)

    @classmethod
    def get_all(cls) -> List[Dict[str, Any]]:
        if not cls._students:
            cls.load()
        return cls._students

    @classmethod
    def get_by_id(cls, student_id: str) -> Optional[Dict[str, Any]]:
        for s in cls.get_all():
            if s["student_id"] == student_id or s["email"].lower() == student_id.lower():
                return s
        return None

    @classmethod
    def update_student(cls, student_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        students = cls.get_all()
        for i, s in enumerate(students):
            if s["student_id"] == student_id:
                s.update(updates)
                students[i] = s
                cls.save()
                return s
        return None

