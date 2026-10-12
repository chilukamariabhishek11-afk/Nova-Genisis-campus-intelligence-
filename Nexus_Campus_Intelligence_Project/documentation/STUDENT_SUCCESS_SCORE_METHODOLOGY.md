# Student Success Score: Mathematical Formulation & Methodology Note

## 1. Executive Summary
The **Student Success Score** is a composite metric engineered to quantify a student's holistic performance, campus engagement, and career readiness. Unlike single-point indicators (such as CGPA alone), the Student Success Score integrates seven disconnected campus data streams to provide an actionable, predictive, and explainable 360-degree assessment.

---

## 2. Integrated Data Indicators & Categories

The model ingests data across **seven critical dimensions**:

| Data Category | Specific Raw Indicators Captured | Normalized Subscore Range |
| :--- | :--- | :--- |
| **Academic Mastery** | Cumulative CGPA (0–10), Internal test marks (0–100), Active backlogs (count), Semester SGPA progression | 0 – 100 |
| **Attendance Discipline** | Overall attendance percentage (0–100%), Subject-level attendance, Absence streaks | 0 – 100 |
| **LMS Engagement** | Weekly login frequency, Assignment completion percentage, Video watch hours, Discussion forum posts | 0 – 100 |
| **Placement Readiness** | Algorithmic coding benchmark score, Quantitative & logical aptitude score, Mock interview rating (1–10), Resume rating | 0 – 100 |
| **Practical Skills** | Technical assessment score, Soft-skills & communication index, Industry certifications count | 0 – 100 |
| **Feedback & Wellbeing** | Student satisfaction rating (1–5), Wellbeing mental health index (0–100), Faculty qualitative sentiment | 0 – 100 |
| **Curriculum Velocity** | Course-wise and module-wise syllabus completion percentages | 0 – 100 |

---

## 3. Mathematical Formula & Weight Distribution

The Student Success Score \(S \in [0, 100]\) is calculated as a constrained weighted sum of six normalized component sub-scores:

$$S = \sum_{k=1}^{6} W_k \cdot \text{SubScore}_k$$

Where the weights $W_k$ sum to $1.00$ ($100\%$):

$$\begin{aligned}
W_{\text{Academic}} &= 0.30 \quad (30\%) \\
W_{\text{Attendance}} &= 0.15 \quad (15\%) \\
W_{\text{LMS}} &= 0.15 \quad (15\%) \\
W_{\text{Placement}} &= 0.20 \quad (20\%) \\
W_{\text{Skills}} &= 0.10 \quad (10\%) \\
W_{\text{Wellbeing}} &= 0.10 \quad (10\%)
\end{aligned}$$

### Detailed Sub-Score Formulation:

1. **Academic Sub-Score ($W_1 = 30\%$)**:
   $$\text{SubScore}_{\text{Acad}} = \max\left(0, \min\left(100, \left( \frac{\text{CGPA}}{10} \times 100 \times 0.70 + \text{InternalMarks} \times 0.30 \right) - (\text{Backlogs} \times 15) \right)\right)$$
   *Rationale*: Active backlogs severely penalize university eligibility and recruitability, applying a strict -15 point deduction per pending subject.

2. **Attendance Sub-Score ($W_2 = 15\%$)**:
   $$\text{SubScore}_{\text{Att}} = \begin{cases} 
   \text{AttendancePct} & \text{if } \text{AttendancePct} \ge 75\% \\
   \max(0, \text{AttendancePct} \times 0.80) & \text{if } \text{AttendancePct} < 75\% \text{ (Detention Risk Penalty)}
   \end{cases}$$
   *Rationale*: Under university statutory regulations, attendance below 75% triggers exam detention, necessitating a non-linear downward penalty.

3. **LMS Engagement Sub-Score ($W_3 = 15\%$)**:
   $$\text{SubScore}_{\text{LMS}} = (\text{AssignmentCompletionPct} \times 0.65) + \left(\min\left(100, \frac{\text{WeeklyLogins}}{16} \times 100\right) \times 0.35\right)$$

4. **Placement Readiness Sub-Score ($W_4 = 20\%$)**:
   $$\text{SubScore}_{\text{Plc}} = (\text{CodingScore} \times 0.35) + (\text{AptitudeScore} \times 0.35) + (\text{MockInterviewRating} \times 10 \times 0.30)$$

5. **Practical Skills Sub-Score ($W_5 = 10\%$)**:
   $$\text{SubScore}_{\text{Skills}} = (\text{TechnicalScore} \times 0.60) + (\text{SoftSkillsScore} \times 0.40)$$

6. **Feedback & Wellbeing Sub-Score ($W_6 = 10\%$)**:
   $$\text{SubScore}_{\text{Wellbeing}} = (\text{WellbeingIndex} \times 0.60) + (\text{SatisfactionScore} \times 20 \times 0.40)$$

---

## 4. At-Risk Identification Logic

Rather than a single simplistic flag, the platform computes **Dual Risk Flags**:

### A. Academic Risk Tier
- **High Risk**: Active backlogs $\ge 2$ OR CGPA $< 6.0$ OR Attendance $< 70\%$.
- **Moderate Risk**: Active backlog $= 1$ OR CGPA between $6.0 - 7.0$ OR Attendance between $70\% - 75\%$ OR Assignment Completion $< 65\%$.
- **Low / On Track**: CGPA $\ge 7.0$ AND 0 Backlogs AND Attendance $\ge 75\%$.

### B. Placement Risk Tier
- **Critical Risk**: Placement Sub-score $< 55.0$ OR Coding Benchmark $< 45$ OR Aptitude $< 45$.
- **Moderate Risk**: Placement Sub-score between $55.0 - 72.0$ OR Coding Benchmark between $45 - 60$.
- **Placement Ready**: Placement Sub-score $\ge 72.0$ AND Mock Rating $\ge 6.5/10$.

### C. Compound Dual-Risk Classification
- When a student simultaneously triggers **High Academic Risk** AND **Critical Placement Risk**, they are classified as **Dual-Risk**, alerting faculty and administration for urgent multi-stakeholder triage.

---

## 5. Strategic Student Segmentation (Bonus Feature)

Students are mapped into four distinct operational quadrants:

1. **Quadrant I — High Academics, Low Placement Readiness**
   - *Profile*: CGPA $\ge 7.5$, Placement Sub-score $< 62.0$.
   - *Action*: Hands-on DSA algorithmic sprints, live behavioral mock interviews.
2. **Quadrant II — Placement Ready, Academic Risk**
   - *Profile*: Placement Sub-score $\ge 75.0$, CGPA $< 6.8$ OR Backlogs $> 0$ OR Attendance $< 75\%$.
   - *Action*: Academic remediation, lecture attendance catch-up to prevent exam debarment.
3. **Quadrant III — Consistent High Achievers (Exemplars)**
   - *Profile*: Success Score $\ge 80.0$, Low Academic & Low Placement Risk.
   - *Action*: Nominated as peer leads, entered into marquee recruitment drives.
4. **Quadrant IV — Dual-Risk / Critical Support Required**
   - *Profile*: High Academic Risk AND Critical Placement Risk.
   - *Action*: Mandatory 1-on-1 counseling, faculty mentor assignment, remedial backlog tracks.

---

## 6. Explainable AI Score Attribution (SHAP-Style Attribution)

To eliminate the opacity of black-box algorithms, each student's score displays exact positive and negative drivers relative to the cohort mean ($\mu = 72.8$):

$$\Delta_k = W_k \times (\text{SubScore}_k - \text{BenchmarkMean}_k)$$

This outputs a transparent waterfall breakdown:
- e.g., `+7.4 pts Coding Mastery`
- e.g., `+4.1 pts High Lecture Attendance`
- e.g., `-9.0 pts Active Backlog Deduction`
- e.g., `-5.2 pts Unsubmitted LMS Coursework`

