"""
Scoring & Analytics Engine
1. Multi-Indicator Student Success Score (0 - 100)
2. Dual Risk Model: Academic Risk & Placement Risk
3. Student Segmentation (4 Key Strategic Quadrants + Sub-segments)
4. Explainable Score & Driver Attribution (SHAP-style Feature Impact)
"""

from typing import Dict, Any, List, Tuple

class ScoringEngine:
    # Indicator Category Weights (Sum to 1.0)
    WEIGHTS = {
        "academic": 0.30,       # 30% CGPA, marks, backlog penalty
        "attendance": 0.15,     # 15% Strict attendance discipline (<75% penalty)
        "lms": 0.15,            # 15% Assignment completion & weekly platform usage
        "placement": 0.20,      # 20% Aptitude, coding assessment, mock interview
        "skills": 0.10,         # 10% Technical & soft-skill readiness
        "feedback_wellbeing": 0.10  # 10% Wellbeing index, student satisfaction
    }

    # Baseline Cohort Benchmark for Explainability (Pre-computed mean across standard cohorts)
    BENCHMARK = {
        "academic_subscore": 74.0,
        "attendance_subscore": 78.5,
        "lms_subscore": 72.0,
        "placement_subscore": 68.5,
        "skills_subscore": 70.0,
        "wellbeing_subscore": 73.0,
        "overall_success_score": 72.8
    }

    @classmethod
    def calculate_student_metrics(cls, student: Dict[str, Any]) -> Dict[str, Any]:
        """Calculates normalized sub-scores, unified success score, risk status, segmentation, and explainability."""
        acad = student["academic"]
        att = student["attendance"]
        lms = student["lms"]
        plc = student["placement"]
        sk = student["skills"]
        fb = student["feedback"]

        # 1. Academic Subscore (0 - 100)
        # Normalized CGPA (0-10 -> 0-100) minus 15 points per active backlog
        cgpa_norm = (acad["cgpa"] / 10.0) * 100.0
        backlog_penalty = acad["active_backlogs"] * 15.0
        academic_subscore = max(0.0, min(100.0, (cgpa_norm * 0.7 + acad["internal_marks_avg"] * 0.3) - backlog_penalty))

        # 2. Attendance Subscore (0 - 100)
        # If below 75%, steep penalty kicks in because of university detention risk
        raw_att = att["overall_pct"]
        if raw_att < 75.0:
            att_subscore = max(0.0, raw_att * 0.8) # severe detention penalty
        else:
            att_subscore = min(100.0, raw_att)

        # 3. LMS Subscore (0 - 100)
        # 60% assignment completion rate + 40% weekly login activity (capped at 16 logins/week)
        login_score = min(100.0, (lms["weekly_logins"] / 16.0) * 100.0)
        lms_subscore = (lms["assignment_completion_pct"] * 0.65) + (login_score * 0.35)

        # 4. Placement Subscore (0 - 100)
        # 35% coding benchmark + 35% aptitude test + 30% mock interview rating (out of 10 -> *10)
        mock_norm = min(100.0, plc["mock_interview_rating"] * 10.0)
        placement_subscore = (plc["coding_score"] * 0.35) + (plc["aptitude_score"] * 0.35) + (mock_norm * 0.30)

        # 5. Skills Subscore (0 - 100)
        # 60% technical assessments + 40% soft skills & communication
        skills_subscore = (sk["technical_score"] * 0.6) + (sk["soft_skills_score"] * 0.4)

        # 6. Feedback & Wellbeing Subscore (0 - 100)
        # 60% wellbeing mental health index + 40% satisfaction (1-5 -> *20)
        satisfaction_norm = fb["student_satisfaction"] * 20.0
        wellbeing_subscore = (fb["wellbeing_index"] * 0.6) + (satisfaction_norm * 0.4)

        # Overall Student Success Score (Weighted sum)
        overall_score = (
            academic_subscore * cls.WEIGHTS["academic"] +
            att_subscore * cls.WEIGHTS["attendance"] +
            lms_subscore * cls.WEIGHTS["lms"] +
            placement_subscore * cls.WEIGHTS["placement"] +
            skills_subscore * cls.WEIGHTS["skills"] +
            wellbeing_subscore * cls.WEIGHTS["feedback_wellbeing"]
        )
        overall_score = round(max(0.0, min(100.0, overall_score)), 1)

        # --- RISK EVALUATION ---
        # Academic Risk
        if acad["active_backlogs"] >= 2 or acad["cgpa"] < 6.0 or att["overall_pct"] < 70.0:
            academic_risk = "High"
            academic_risk_label = "Critical Academic Risk"
        elif acad["active_backlogs"] == 1 or acad["cgpa"] < 7.0 or att["overall_pct"] < 75.0 or lms["assignment_completion_pct"] < 65.0:
            academic_risk = "Moderate"
            academic_risk_label = "Moderate Academic Attention"
        else:
            academic_risk = "Low"
            academic_risk_label = "Academically Sound"

        # Placement Risk
        if placement_subscore < 55.0 or plc["coding_score"] < 45 or plc["aptitude_score"] < 45:
            placement_risk = "Critical"
            placement_risk_label = "High Placement Risk"
        elif placement_subscore < 72.0 or plc["coding_score"] < 60 or plc["mock_interview_rating"] < 6.0:
            placement_risk = "Moderate"
            placement_risk_label = "Developing Readiness"
        else:
            placement_risk = "Low"
            placement_risk_label = "Placement Ready"

        # Overall Risk Tier
        if academic_risk == "High" and placement_risk == "Critical":
            overall_risk = "Dual-Risk"
            risk_color = "red"
        elif academic_risk == "High" or placement_risk == "Critical":
            overall_risk = "High Risk"
            risk_color = "orange"
        elif academic_risk == "Moderate" or placement_risk == "Moderate":
            overall_risk = "Moderate Risk"
            risk_color = "yellow"
        else:
            overall_risk = "Safe / Thriving"
            risk_color = "green"

        # --- BONUS: STUDENT SEGMENTATION ---
        # Classify student into meaningful strategic cohorts
        if acad["cgpa"] >= 7.5 and placement_subscore < 62.0:
            segment = "High Academics - Low Placement Readiness"
            segment_desc = "High CGPA and theory marks, but lagging in coding benchmarks and interview readiness."
            segment_id = "SEG_ACAD_STAR_PLC_LAG"
            segment_badge = "Academic Star / Placement Drag"
        elif placement_subscore >= 75.0 and (acad["cgpa"] < 6.8 or acad["active_backlogs"] > 0 or att["overall_pct"] < 75.0):
            segment = "Placement Ready - Academic Risk"
            segment_desc = "Excellent technical coding & interview skills, but low attendance or pending backlogs jeopardize eligibility."
            segment_id = "SEG_PLC_READY_ACAD_RISK"
            segment_badge = "Hacker Portfolio / Academic Risk"
        elif overall_score >= 80.0 and academic_risk == "Low" and placement_risk == "Low":
            segment = "Consistent High Achievers"
            segment_desc = "Exemplary performance across academia, placement benchmarks, and active campus engagement."
            segment_id = "SEG_HIGH_ACHIEVERS"
            segment_badge = "Consistent High Achiever"
        elif academic_risk == "High" and placement_risk == "Critical":
            segment = "Dual-Risk / Critical Support"
            segment_desc = "Struggling in coursework, attendance debarment warning, and low placement benchmarks."
            segment_id = "SEG_CRITICAL_DUAL_RISK"
            segment_badge = "Critical Support Required"
        else:
            segment = "Developing All-Rounders"
            segment_desc = "Balanced medium performance with steady progress, but needs targeted refinement to achieve honors."
            segment_id = "SEG_DEVELOPING"
            segment_badge = "Developing All-Rounder"

        # --- BONUS: EXPLAINABLE SCORE & DRIVER ATTRIBUTION (SHAP style) ---
        drivers = cls._calculate_explainable_drivers(
            academic_subscore, att_subscore, lms_subscore,
            placement_subscore, skills_subscore, wellbeing_subscore,
            student
        )

        subscores = {
            "academic": round(academic_subscore, 1),
            "attendance": round(att_subscore, 1),
            "lms": round(lms_subscore, 1),
            "placement": round(placement_subscore, 1),
            "skills": round(skills_subscore, 1),
            "wellbeing": round(wellbeing_subscore, 1)
        }

        return {
            "success_score": overall_score,
            "subscores": subscores,
            "risks": {
                "academic_risk": academic_risk,
                "academic_risk_label": academic_risk_label,
                "placement_risk": placement_risk,
                "placement_risk_label": placement_risk_label,
                "overall_risk": overall_risk,
                "risk_color": risk_color
            },
            "segmentation": {
                "segment_name": segment,
                "segment_id": segment_id,
                "segment_badge": segment_badge,
                "description": segment_desc
            },
            "explainability": drivers
        }

    @classmethod
    def _calculate_explainable_drivers(
        cls,
        acad_sub: float, att_sub: float, lms_sub: float,
        plc_sub: float, sk_sub: float, wb_sub: float,
        student: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculates exact mathematical point contribution of each factor relative to cohort benchmark."""
        # Weighted point differences relative to cohort benchmark
        diffs = [
            {
                "dimension": "Academic Performance",
                "category": "academic",
                "delta": round((acad_sub - cls.BENCHMARK["academic_subscore"]) * cls.WEIGHTS["academic"], 1),
                "metric_value": f"CGPA: {student['academic']['cgpa']} (Backlogs: {student['academic']['active_backlogs']})",
                "impact": "Positive" if acad_sub >= cls.BENCHMARK["academic_subscore"] else "Negative"
            },
            {
                "dimension": "Class Attendance",
                "category": "attendance",
                "delta": round((att_sub - cls.BENCHMARK["attendance_subscore"]) * cls.WEIGHTS["attendance"], 1),
                "metric_value": f"{student['attendance']['overall_pct']}% Overall",
                "impact": "Positive" if att_sub >= cls.BENCHMARK["attendance_subscore"] else "Negative"
            },
            {
                "dimension": "LMS & Assignments",
                "category": "lms",
                "delta": round((lms_sub - cls.BENCHMARK["lms_subscore"]) * cls.WEIGHTS["lms"], 1),
                "metric_value": f"{student['lms']['assignment_completion_pct']}% Completed ({student['lms']['weekly_logins']} Logins/wk)",
                "impact": "Positive" if lms_sub >= cls.BENCHMARK["lms_subscore"] else "Negative"
            },
            {
                "dimension": "Placement & Coding",
                "category": "placement",
                "delta": round((plc_sub - cls.BENCHMARK["placement_subscore"]) * cls.WEIGHTS["placement"], 1),
                "metric_value": f"Code: {student['placement']['coding_score']}/100, Aptitude: {student['placement']['aptitude_score']}/100",
                "impact": "Positive" if plc_sub >= cls.BENCHMARK["placement_subscore"] else "Negative"
            },
            {
                "dimension": "Technical & Soft Skills",
                "category": "skills",
                "delta": round((sk_sub - cls.BENCHMARK["skills_subscore"]) * cls.WEIGHTS["skills"], 1),
                "metric_value": f"Tech: {student['skills']['technical_score']}/100, Soft: {student['skills']['soft_skills_score']}/100",
                "impact": "Positive" if sk_sub >= cls.BENCHMARK["skills_subscore"] else "Negative"
            },
            {
                "dimension": "Wellbeing & Campus Life",
                "category": "wellbeing",
                "delta": round((wb_sub - cls.BENCHMARK["wellbeing_subscore"]) * cls.WEIGHTS["feedback_wellbeing"], 1),
                "metric_value": f"Wellbeing Index: {student['feedback']['wellbeing_index']}/100",
                "impact": "Positive" if wb_sub >= cls.BENCHMARK["wellbeing_subscore"] else "Negative"
            }
        ]

        # Sort positive drivers (highest boost first)
        positive_drivers = sorted([d for d in diffs if d["delta"] > 0], key=lambda x: x["delta"], reverse=True)
        # Sort negative drags (most negative impact first)
        negative_drags = sorted([d for d in diffs if d["delta"] < 0], key=lambda x: x["delta"])

        primary_positive = positive_drivers[0] if positive_drivers else {
            "dimension": "Baseline Equilibrium", "delta": 0.0, "impact": "Neutral", "metric_value": "Consistent"
        }
        primary_negative = negative_drags[0] if negative_drags else {
            "dimension": "No Severe Deficits", "delta": 0.0, "impact": "Neutral", "metric_value": "Within Norms"
        }

        return {
            "cohort_benchmark_score": cls.BENCHMARK["overall_success_score"],
            "all_attributions": diffs,
            "top_positive_driver": primary_positive,
            "top_negative_drag": primary_negative,
            "positive_drivers_count": len(positive_drivers),
            "negative_drags_count": len(negative_drags)
        }

