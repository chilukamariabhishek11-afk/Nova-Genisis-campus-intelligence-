/**
 * Nexus Campus Intelligence — Main Client Application Logic
 * Manages role authentication, multi-portal UI rendering, interactive tables,
 * syllabus management, and modals.
 */

const App = {
  state: {
    currentUser: null,
    activeTab: 'overview',
    students: [],
    summary: null,
    segmentation: null,
    syllabus: [],
    syllabusSummary: null,
    selectedStudent: null,
    filters: {
      search: '',
      risk: 'All Risks',
      department: 'All Departments',
      segment: 'All Segments'
    }
  },

  async init() {
    // Check if user session stored in localStorage
    const saved = localStorage.getItem('nexus_auth_user');
    if (saved) {
      try {
        this.state.currentUser = JSON.parse(saved);
        this.renderApp();
        return;
      } catch (e) {
        localStorage.removeItem('nexus_auth_user');
      }
    }

    this.showLoginView();
  },

  // --- AUTHENTICATION ---
  fillDemo(email, pw) {
    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = pw;
  },

  async handleLogin(e) {
    if (e) e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errEl = document.getElementById('login-error');
    errEl.classList.add('hidden');

    if (!email || !password) {
      errEl.innerText = 'Please enter both email and password.';
      errEl.classList.remove('hidden');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.authenticated) {
        this.state.currentUser = data.user;
        this.state.currentUser.role = data.role;
        localStorage.setItem('nexus_auth_user', JSON.stringify(this.state.currentUser));
        this.renderApp();
      } else {
        errEl.innerText = 'Invalid credentials. Please use demo accounts provided below.';
        errEl.classList.remove('hidden');
      }
    } catch (err) {
      errEl.innerText = 'Error connecting to server. Please try again.';
      errEl.classList.remove('hidden');
    }
  },

  logout() {
    localStorage.removeItem('nexus_auth_user');
    this.state.currentUser = null;
    window.location.reload();
  },

  // --- VIEW SWITCHING ---
  showLoginView() {
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('app-section').classList.add('hidden');
  },

  async renderApp() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('app-section').classList.remove('hidden');

    const u = this.state.currentUser;
    // Set user header details
    document.getElementById('user-display-name').innerText = u.name;
    document.getElementById('user-display-title').innerText = u.role_title;
    document.getElementById('user-avatar').src = u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`;

    const badgeRole = document.getElementById('user-role-badge');
    badgeRole.innerText = u.role.toUpperCase();
    if (u.role === 'admin') badgeRole.className = 'badge-curved badge-purple uppercase';
    else if (u.role === 'faculty') badgeRole.className = 'badge-curved badge-info uppercase';
    else badgeRole.className = 'badge-curved badge-success uppercase';

    // Render portal based on role
    if (u.role === 'student') {
      await this.loadStudentPortal();
    } else if (u.role === 'faculty') {
      await this.loadFacultyPortal();
    } else {
      await this.loadAdminPortal();
    }
  },

  // ==========================================
  // 1. STUDENT PORTAL
  // ==========================================
  async loadStudentPortal() {
    const main = document.getElementById('portal-content');
    main.innerHTML = `<div class="p-8 text-center text-slate-500"><span class="animate-spin inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full"></span> Loading your personalized academic insights...</div>`;

    const studentId = this.state.currentUser.student_id || 'STU2024001';
    const res = await fetch(`/api/students/${studentId}`);
    const data = await res.json();
    const s = data.student;
    const m = data.metrics;
    const inv = data.interventions;

    // Render HTML
    main.innerHTML = `
      <div class="space-y-6">
        <!-- Hero Banner with Personal Score & Drivers -->
        <div class="glass-panel p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white relative overflow-hidden">
          <div class="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <!-- Left Info -->
            <div class="lg:col-span-7 space-y-3">
              <div class="flex items-center gap-3">
                <span class="badge-curved bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-xs">
                  ${s.department} • ${s.year}
                </span>
                <span class="badge-curved bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs">
                  ${m.segmentation.segment_badge}
                </span>
              </div>
              <h2 class="text-2xl lg:text-3xl font-extrabold tracking-tight">Welcome back, ${s.name}!</h2>
              <p class="text-indigo-200 text-sm leading-relaxed max-w-xl">
                ${inv.ai_executive_summary}
              </p>

              <!-- Quick stats pills -->
              <div class="flex flex-wrap gap-2 pt-2">
                <div class="bg-white/10 backdrop-blur-md rounded-xl px-3.5 py-2 text-xs border border-white/10">
                  <span class="text-indigo-300">CGPA:</span> <strong class="text-white ml-1">${s.academic.cgpa}</strong>
                </div>
                <div class="bg-white/10 backdrop-blur-md rounded-xl px-3.5 py-2 text-xs border border-white/10">
                  <span class="text-indigo-300">Attendance:</span> <strong class="text-white ml-1">${s.attendance.overall_pct}%</strong>
                </div>
                <div class="bg-white/10 backdrop-blur-md rounded-xl px-3.5 py-2 text-xs border border-white/10">
                  <span class="text-indigo-300">Coding Score:</span> <strong class="text-white ml-1">${s.placement.coding_score}/100</strong>
                </div>
                <div class="bg-white/10 backdrop-blur-md rounded-xl px-3.5 py-2 text-xs border border-white/10">
                  <span class="text-indigo-300">Active Backlogs:</span> <strong class="${s.academic.active_backlogs > 0 ? 'text-amber-300' : 'text-emerald-300'} ml-1">${s.academic.active_backlogs}</strong>
                </div>
              </div>
            </div>

            <!-- Right Gauge & Score -->
            <div class="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/10">
              <span class="text-xs font-semibold text-indigo-200 tracking-wider uppercase mb-1">Student Success Score</span>
              <div class="relative w-48 h-36 flex items-center justify-center">
                <canvas id="student-score-gauge"></canvas>
                <div class="absolute inset-0 flex flex-col items-center justify-center pt-6 pointer-events-none">
                  <span class="text-3xl font-black text-white">${m.success_score}</span>
                  <span class="text-[10px] text-indigo-300 font-medium">/ 100 PTS</span>
                </div>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <span class="w-2.5 h-2.5 rounded-full ${m.risks.risk_color === 'green' ? 'bg-emerald-400' : m.risks.risk_color === 'red' ? 'bg-rose-400' : 'bg-amber-400'}"></span>
                <span class="text-xs font-bold text-white">${m.risks.overall_risk}</span>
                <span class="text-xs text-indigo-300">• Campus Mean: 72.8</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2 Columns: Explainable Score Breakdown & Competency Radar -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Explainability Drivers (Waterfall / Breakdown) -->
          <div class="lg:col-span-7 glass-panel p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
                  <span>🎯 Explainable Score Attribution</span>
                  <span class="text-xs font-normal text-slate-500">(What's driving your score)</span>
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">Factor-by-factor breakdown against the campus cohort baseline.</p>
              </div>
              <span class="badge-curved badge-info text-xs">Explainable AI</span>
            </div>

            <div class="h-44 w-full">
              <canvas id="student-driver-bar"></canvas>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div class="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
                <div class="flex items-center justify-between text-xs font-bold text-emerald-800 mb-1">
                  <span>🏆 Primary Positive Driver</span>
                  <span class="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">+${m.explainability.top_positive_driver.delta} pts</span>
                </div>
                <div class="font-semibold text-sm text-slate-800">${m.explainability.top_positive_driver.dimension}</div>
                <div class="text-xs text-slate-600 mt-0.5">${m.explainability.top_positive_driver.metric_value}</div>
              </div>

              <div class="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200/80">
                <div class="flex items-center justify-between text-xs font-bold text-rose-800 mb-1">
                  <span>⚠️ Primary Drag / Vulnerability</span>
                  <span class="text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">${m.explainability.top_negative_drag.delta} pts</span>
                </div>
                <div class="font-semibold text-sm text-slate-800">${m.explainability.top_negative_drag.dimension}</div>
                <div class="text-xs text-slate-600 mt-0.5">${m.explainability.top_negative_drag.metric_value}</div>
              </div>
            </div>
          </div>

          <!-- Radar Chart of Competencies -->
          <div class="lg:col-span-5 glass-panel p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-slate-800 text-base">🕸️ 360° Competency Radar</h3>
                <p class="text-xs text-slate-500">Benchmark comparison vs department average.</p>
              </div>
              <span class="badge-curved badge-purple text-xs">Multi-Source</span>
            </div>

            <div class="h-64 w-full">
              <canvas id="student-radar-chart"></canvas>
            </div>
          </div>
        </div>

        <!-- Syllabus Completion Progress Section (Specific User Requirement) -->
        <div class="glass-panel p-6 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
                <span>📚 Current Semester Syllabus Completion Tracker</span>
                <span class="badge-curved badge-info text-xs">${s.syllabus.overall_completed_pct}% Overall Coverage</span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">Track your curriculum pace across courses to prepare for mid-terms and finals.</p>
            </div>
            <span class="text-xs text-slate-500 font-medium">Pending Modules to Clear: <strong class="text-slate-800">${s.syllabus.pending_modules_count}</strong></span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${Object.entries(s.syllabus.courses).map(([courseName, prog]) => `
              <div class="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-slate-800 truncate">${courseName}</span>
                  <span class="font-bold ${prog.progress_pct >= 75 ? 'text-emerald-600' : prog.progress_pct >= 60 ? 'text-amber-600' : 'text-rose-600'}">${prog.progress_pct}%</span>
                </div>
                <div class="progress-track h-2">
                  <div class="progress-fill ${prog.progress_pct >= 75 ? 'bg-emerald-500' : prog.progress_pct >= 60 ? 'bg-amber-500' : 'bg-rose-500'}" style="width: ${prog.progress_pct}%"></div>
                </div>
                <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>${prog.completed_modules} / ${prog.total_modules} Units Complete</span>
                  <span class="font-medium text-slate-700">${prog.total_modules - prog.completed_modules} Units Pending</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- AI Personalized Action Roadmap (Specific User Requirement: Real dynamic answers) -->
        <div class="glass-panel p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
                <span>🤖 AI Personalized Diagnostic Action Plan</span>
                <span class="badge-curved badge-success text-xs">Tailored to Your Metrics</span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">Data-driven recommendations computed to optimize your academic & placement success score.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${inv.prioritized_interventions.map((item, idx) => `
              <div class="p-5 rounded-2xl border ${item.urgency_badge === 'danger' ? 'border-rose-200 bg-rose-50/40' : item.urgency_badge === 'warning' ? 'border-amber-200 bg-amber-50/40' : item.urgency_badge === 'success' ? 'border-emerald-200 bg-emerald-50/40' : 'border-indigo-200 bg-indigo-50/40'} space-y-3">
                <div class="flex items-center justify-between">
                  <span class="badge-curved ${item.urgency_badge === 'danger' ? 'badge-danger' : item.urgency_badge === 'warning' ? 'badge-warning' : item.urgency_badge === 'success' ? 'badge-success' : 'badge-info'} text-xs">
                    ${item.category} • ${item.urgency}
                  </span>
                  <span class="text-xs font-bold text-slate-600">${item.timeframe}</span>
                </div>
                <h4 class="font-bold text-slate-900 text-sm">${item.title}</h4>
                <p class="text-xs text-slate-600 leading-relaxed">${item.diagnosis}</p>
                
                <div class="bg-white/80 rounded-xl p-3 border border-slate-200/60 space-y-1.5 text-xs">
                  <div class="font-semibold text-slate-800">Action Steps:</div>
                  <ul class="list-disc list-inside text-slate-600 space-y-1">
                    ${item.action_steps.map(step => `<li>${step}</li>`).join('')}
                  </ul>
                </div>

                <div class="flex items-center justify-between text-xs font-semibold pt-1">
                  <span class="text-emerald-700">Expected Score Boost:</span>
                  <span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">${item.expected_impact}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Interactive AI Coach Q&A Box -->
        <div class="glass-panel p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
              <span>💬 Ask My AI Academic & Career Advisor</span>
            </h3>
            <span class="badge-curved badge-purple text-xs">Context-Aware AI</span>
          </div>
          
          <div class="flex flex-wrap gap-2 text-xs">
            <button onclick="AIChat.askPrompt('How can I boost my Placement Readiness score?')" class="btn-curved btn-secondary text-xs py-1.5 px-3">
              💡 How can I boost my Placement Readiness score?
            </button>
            <button onclick="AIChat.askPrompt('What syllabus units should I revise before mid-term exams?')" class="btn-curved btn-secondary text-xs py-1.5 px-3">
              📖 What syllabus units should I revise?
            </button>
            <button onclick="AIChat.askPrompt('What are my biggest weaknesses in mock interviews?')" class="btn-curved btn-secondary text-xs py-1.5 px-3">
              🎯 What are my interview weaknesses?
            </button>
          </div>

          <div id="ai-chat-messages" class="h-64 overflow-y-auto bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4"></div>

          <div class="flex gap-2">
            <input id="ai-chat-input" type="text" placeholder="Ask anything about your coursework, coding milestones, or exam readiness..." class="flex-1 rounded-full border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white" />
            <button id="ai-chat-send-btn" class="btn-curved btn-primary">
              <span>Ask AI</span>
              <i data-lucide="send" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    // Render charts
    setTimeout(() => {
      AppCharts.renderSuccessScoreGauge('student-score-gauge', m.success_score, m.risks.risk_color);
      AppCharts.renderDriverAttributionBar('student-driver-bar', m.explainability.all_attributions);
      AppCharts.renderCompetencyRadar('student-radar-chart', s.skills.skill_radar);
      AIChat.init(s.student_id);
      lucide.createIcons();
    }, 50);
  },

  // ==========================================
  // 2. FACULTY PORTAL
  // ==========================================
  async loadFacultyPortal() {
    const main = document.getElementById('portal-content');
    main.innerHTML = `<div class="p-8 text-center text-slate-500"><span class="animate-spin inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full"></span> Loading faculty cohort analytics & student roster...</div>`;

    const [sumRes, stuRes, sylRes] = await Promise.all([
      fetch('/api/analytics/summary'),
      fetch('/api/students'),
      fetch('/api/syllabus/summary')
    ]);

    const summary = await sumRes.json();
    const studentsData = await stuRes.json();
    const sylSummary = await sylRes.json();

    this.state.summary = summary;
    this.state.students = studentsData.students;
    this.state.syllabusSummary = sylSummary;

    main.innerHTML = `
      <div class="space-y-6">
        <!-- Faculty Executive Cohort KPIs -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="glass-panel p-5 space-y-1">
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span class="font-medium">Total Monitored Students</span>
              <i data-lucide="users" class="w-4 h-4 text-indigo-600"></i>
            </div>
            <div class="text-2xl font-black text-slate-900">${summary.total_students}</div>
            <div class="text-xs text-slate-500">Across 4 Engineering Branches</div>
          </div>

          <div class="glass-panel p-5 space-y-1">
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span class="font-medium">Cohort Mean Success Score</span>
              <i data-lucide="sparkles" class="w-4 h-4 text-emerald-600"></i>
            </div>
            <div class="text-2xl font-black text-indigo-600">${summary.avg_success_score}<span class="text-xs text-slate-400 font-normal"> / 100</span></div>
            <div class="text-xs text-emerald-600 font-medium">Avg CGPA: ${summary.avg_cgpa}</div>
          </div>

          <div class="glass-panel p-5 space-y-1 border-l-4 border-rose-500">
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span class="font-medium">At-Risk Interventions</span>
              <span class="pulse-dot pulse-dot-red"></span>
            </div>
            <div class="text-2xl font-black text-rose-600">${summary.risk_breakdown.high_risk} <span class="text-xs text-slate-500 font-normal">(${summary.risk_breakdown.at_risk_pct}%)</span></div>
            <div class="text-xs text-rose-500 font-medium">${summary.risk_breakdown.dual_risk} Dual-Risk Students Need Urgent Triage</div>
          </div>

          <div class="glass-panel p-5 space-y-1">
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span class="font-medium">Campus Syllabus Completed</span>
              <i data-lucide="book-open" class="w-4 h-4 text-indigo-600"></i>
            </div>
            <div class="text-2xl font-black text-slate-900">${sylSummary.overall_campus_syllabus_pct}%</div>
            <div class="text-xs text-slate-500 font-medium">${sylSummary.completed_units} / ${sylSummary.total_units} Units Delivered</div>
          </div>
        </div>

        <!-- 2 Columns: Risk Distribution Donut & Syllabus Management Trigger -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-5 glass-panel p-6 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-slate-800 text-sm">Cohort Risk Distribution</h3>
              <span class="badge-curved badge-info text-xs">Automated ML</span>
            </div>
            <div class="h-48 w-full">
              <canvas id="faculty-risk-donut"></canvas>
            </div>
          </div>

          <div class="lg:col-span-7 glass-panel p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span>📚 Faculty Curriculum & Syllabus Management</span>
                  <span class="badge-curved badge-warning text-xs">Curriculum Health: ${sylSummary.health_status}</span>
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">Update unit completion milestones to update student dashboards and campus analytics.</p>
              </div>
              <button onclick="App.openSyllabusModal()" class="btn-curved btn-primary text-xs py-1.5 px-3">
                <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                <span>Update Units</span>
              </button>
            </div>

            <!-- Department syllabus mini bars -->
            <div class="grid grid-cols-2 gap-3 pt-1">
              ${Object.entries(sylSummary.department_completion).map(([dept, pct]) => `
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1.5">
                  <div class="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span class="truncate">${dept}</span>
                    <span class="${pct >= 75 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-rose-600'}">${pct}%</span>
                  </div>
                  <div class="progress-track h-2">
                    <div class="progress-fill ${pct >= 75 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500'}" style="width: ${pct}%"></div>
                  </div>
                </div>
              `).join('')}
            </div>

            ${sylSummary.delayed_courses_count > 0 ? `
              <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <i data-lucide="alert-triangle" class="w-4 h-4 text-rose-600 shrink-0"></i>
                <span>Pacing Alert: <strong>${sylSummary.delayed_courses.join(', ')}</strong> is lagging planned lectures. Remedial tutorials recommended.</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Filterable Student Roster & Triage Table -->
        <div class="glass-panel p-6 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 class="font-bold text-slate-800 text-base">Student Success & Early Intervention Roster</h3>
              <p class="text-xs text-slate-500">Click any student row to view full 360° analytics, explainable drivers, and AI diagnosis.</p>
            </div>
            
            <div class="flex flex-wrap items-center gap-2 text-xs">
              <!-- Search -->
              <div class="relative">
                <input id="filter-search" oninput="App.applyFilters()" type="text" placeholder="Search student or ID..." class="rounded-full border border-slate-300 pl-8 pr-4 py-1.5 text-xs focus:outline-none focus:border-indigo-500 bg-white" />
                <i data-lucide="search" class="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400"></i>
              </div>

              <!-- Risk Filter -->
              <select id="filter-risk" onchange="App.applyFilters()" class="rounded-full border border-slate-300 px-3 py-1.5 text-xs bg-white text-slate-700">
                <option>All Risks</option>
                <option>Dual-Risk</option>
                <option>High Risk</option>
                <option>Moderate Risk</option>
                <option>Safe</option>
              </select>

              <!-- Department Filter -->
              <select id="filter-dept" onchange="App.applyFilters()" class="rounded-full border border-slate-300 px-3 py-1.5 text-xs bg-white text-slate-700">
                <option>All Departments</option>
                <option>Computer Science</option>
                <option>Information Technology</option>
                <option>Electronics & Comm</option>
                <option>Data Science</option>
              </select>

              <!-- Export CSV -->
              <a href="/api/export/csv" class="btn-curved btn-secondary text-xs py-1.5 px-3">
                <i data-lucide="download" class="w-3.5 h-3.5"></i>
                <span>Export Dataset</span>
              </a>
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th class="py-3 px-3">Student</th>
                  <th class="py-3 px-3">Branch</th>
                  <th class="py-3 px-3">Success Score</th>
                  <th class="py-3 px-3">Academic</th>
                  <th class="py-3 px-3">Attendance</th>
                  <th class="py-3 px-3">Placement</th>
                  <th class="py-3 px-3">Strategic Segment</th>
                  <th class="py-3 px-3">Risk Status</th>
                  <th class="py-3 px-3 text-right">Quick Intervention</th>
                </tr>
              </thead>
              <tbody id="student-roster-tbody" class="divide-y divide-slate-100">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- Global Campus AI Decision Assistant -->
        <div class="glass-panel p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
              <span>🤖 Faculty AI Decision Support Assistant</span>
            </h3>
            <span class="badge-curved badge-info text-xs">Multi-Student Synthesis</span>
          </div>

          <div class="flex flex-wrap gap-2 text-xs">
            <button onclick="AIChat.askPrompt('Which students need urgent attendance remediation?')" class="btn-curved btn-secondary text-xs py-1.5 px-3">
              🚨 Which students need urgent attendance remediation?
            </button>
            <button onclick="AIChat.askPrompt('Why is Sneha Reddy marked as Dual-Risk?')" class="btn-curved btn-secondary text-xs py-1.5 px-3">
              🔍 Why is Sneha Reddy marked as Dual-Risk?
            </button>
            <button onclick="AIChat.askPrompt('How can Amit Patel resolve his academic risk?')" class="btn-curved btn-secondary text-xs py-1.5 px-3">
              ⚡ How can Amit Patel resolve his academic risk?
            </button>
            <button onclick="AIChat.askPrompt('What is the campus syllabus completion status?')" class="btn-curved btn-secondary text-xs py-1.5 px-3">
              📚 What is the syllabus completion status?
            </button>
          </div>

          <div id="ai-chat-messages" class="h-60 overflow-y-auto bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4"></div>

          <div class="flex gap-2">
            <input id="ai-chat-input" type="text" placeholder="Ask questions about any student, branch trends, or intervention strategies..." class="flex-1 rounded-full border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 bg-white" />
            <button id="ai-chat-send-btn" class="btn-curved btn-primary">
              <span>Query AI</span>
              <i data-lucide="send" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    this.renderStudentRows(this.state.students);

    setTimeout(() => {
      AppCharts.renderRiskDonut('faculty-risk-donut', summary.risk_breakdown);
      AIChat.init();
      lucide.createIcons();
    }, 50);
  },

  // ==========================================
  // 3. ADMIN PORTAL
  // ==========================================
  async loadAdminPortal() {
    const main = document.getElementById('portal-content');
    main.innerHTML = `<div class="p-8 text-center text-slate-500"><span class="animate-spin inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full"></span> Loading institutional analytics & segmentation matrix...</div>`;

    const [sumRes, segRes, stuRes, sylRes] = await Promise.all([
      fetch('/api/analytics/summary'),
      fetch('/api/analytics/segmentation'),
      fetch('/api/students'),
      fetch('/api/syllabus/summary')
    ]);

    const summary = await sumRes.json();
    const segmentation = await segRes.json();
    const stuData = await stuRes.json();
    const sylSummary = await sylRes.json();

    this.state.summary = summary;
    this.state.segmentation = segmentation;
    this.state.students = stuData.students;
    this.state.syllabusSummary = sylSummary;

    main.innerHTML = `
      <div class="space-y-6">
        <!-- Admin Institutional KPIs -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="glass-panel p-5 space-y-1">
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span class="font-medium">Total Enrollment</span>
              <i data-lucide="graduation-cap" class="w-4 h-4 text-indigo-600"></i>
            </div>
            <div class="text-2xl font-black text-slate-900">${summary.total_students}</div>
            <div class="text-xs text-emerald-600 font-medium">100% Data Ingestion Complete</div>
          </div>

          <div class="glass-panel p-5 space-y-1">
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span class="font-medium">Institutional Success Index</span>
              <i data-lucide="award" class="w-4 h-4 text-indigo-600"></i>
            </div>
            <div class="text-2xl font-black text-indigo-600">${summary.avg_success_score} <span class="text-xs text-slate-400 font-normal">/ 100</span></div>
            <div class="text-xs text-slate-500 font-medium">Benchmark Threshold: ≥70.0</div>
          </div>

          <div class="glass-panel p-5 space-y-1">
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span class="font-medium">Placement Readiness Rate</span>
              <i data-lucide="briefcase" class="w-4 h-4 text-emerald-600"></i>
            </div>
            <div class="text-2xl font-black text-emerald-600">${summary.placement_breakdown.placement_ready_pct}%</div>
            <div class="text-xs text-slate-500">${summary.placement_breakdown.placement_ready_count} Students Cleared for Tier-1 Drives</div>
          </div>

          <div class="glass-panel p-5 space-y-1 border-l-4 border-rose-500">
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span class="font-medium">Detention Attendance Risk</span>
              <span class="pulse-dot pulse-dot-red"></span>
            </div>
            <div class="text-2xl font-black text-rose-600">${summary.attendance_detention_risk_count}</div>
            <div class="text-xs text-rose-500 font-medium">Students Below Mandatory 75% Cutoff</div>
          </div>
        </div>

        <!-- Departmental Benchmark Comparison & Risk Donut -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-7 glass-panel p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-slate-800 text-sm">Departmental Benchmark Matrix</h3>
                <p class="text-xs text-slate-500">Average Student Success Score vs Attendance Discipline across branches.</p>
              </div>
              <span class="badge-curved badge-info text-xs">Cross-Department</span>
            </div>
            <div class="h-60 w-full">
              <canvas id="admin-dept-bar"></canvas>
            </div>
          </div>

          <div class="lg:col-span-5 glass-panel p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-slate-800 text-sm">Campus Risk Tier Breakdown</h3>
                <p class="text-xs text-slate-500">Distribution across high risk and safe tiers.</p>
              </div>
              <span class="badge-curved badge-purple text-xs">At-Risk Audit</span>
            </div>
            <div class="h-60 w-full">
              <canvas id="admin-risk-donut"></canvas>
            </div>
          </div>
        </div>

        <!-- Bonus Feature: Strategic Student Segmentation Matrix -->
        <div class="glass-panel p-6 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
                <span>🎯 Strategic Student Segmentation Matrix</span>
                <span class="badge-curved badge-success text-xs">Targeted Intervention Engine</span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">Clustering students into high-impact operational cohorts for specialized intervention programs.</p>
            </div>
          </div>

          <!-- Scatter Plot Visualizer -->
          <div class="h-64 w-full bg-slate-50/50 p-2 rounded-xl border border-slate-200/60">
            <canvas id="admin-segmentation-scatter"></canvas>
          </div>

          <!-- Segment Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            ${segmentation.segments.map(seg => `
              <div class="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2 hover:shadow-md transition-all">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-xs text-slate-900">${seg.badge}</span>
                  <span class="badge-curved badge-info text-[11px] font-bold">${seg.count} students (${seg.pct}%)</span>
                </div>
                <p class="text-[11px] text-slate-500 leading-relaxed">${seg.description}</p>
                <div class="pt-1 text-[11px] font-semibold text-indigo-600">
                  Target: ${seg.badge.includes('Placement Drag') ? 'DSA & Mock Interview Sprints' : seg.badge.includes('Academic Risk') ? 'Attendance & Backlog Recovery' : seg.badge.includes('Critical') ? 'Immediate Faculty Counseling' : 'Elite Marquee Placement Prep'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Institutional Syllabus Health Audit (Specific User Requirement) -->
        <div class="glass-panel p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
                <span>📚 Campus-Wide Curriculum & Syllabus Health Audit</span>
                <span class="badge-curved badge-info text-xs">${sylSummary.overall_campus_syllabus_pct}% Campus Completion</span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">Academic Dean tracking of lecture delivery velocity and syllabus coverage milestones.</p>
            </div>
            <button onclick="App.openSyllabusModal()" class="btn-curved btn-secondary text-xs py-1.5 px-3">
              <span>View Course Syllabus Details</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            ${Object.entries(sylSummary.department_completion).map(([dept, pct]) => `
              <div class="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div class="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>${dept}</span>
                  <span class="${pct >= 75 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-rose-600'}">${pct}%</span>
                </div>
                <div class="progress-track h-2">
                  <div class="progress-fill ${pct >= 75 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500'}" style="width: ${pct}%"></div>
                </div>
                <div class="text-[11px] text-slate-500 font-medium">Status: ${pct >= 75 ? 'On Target' : 'Needs Velocity Review'}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Global Campus AI Decision Assistant -->
        <div class="glass-panel p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
              <span>🏛️ Administrative AI Institutional Advisor</span>
            </h3>
            <span class="badge-curved badge-purple text-xs">Campus-Wide Synthesis</span>
          </div>

          <div class="flex flex-wrap gap-2 text-xs">
            <button onclick="AIChat.askPrompt('Summarize campus-wide bottlenecks')" class="btn-curved btn-secondary text-xs py-1.5 px-3">
              📊 Summarize campus-wide bottlenecks
            </button>
            <button onclick="AIChat.askPrompt('What are the placement readiness recommendations?')" class="btn-curved btn-secondary text-xs py-1.5 px-3">
              💼 Placement readiness recommendations
            </button>
            <button onclick="AIChat.askPrompt('Which courses are lagging in syllabus completion?')" class="btn-curved btn-secondary text-xs py-1.5 px-3">
              📚 Which courses are lagging in syllabus completion?
            </button>
          </div>

          <div id="ai-chat-messages" class="h-60 overflow-y-auto bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4"></div>

          <div class="flex gap-2">
            <input id="ai-chat-input" type="text" placeholder="Ask questions about institutional metrics, resource allocation, or student trends..." class="flex-1 rounded-full border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 bg-white" />
            <button id="ai-chat-send-btn" class="btn-curved btn-primary">
              <span>Query AI</span>
              <i data-lucide="send" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      AppCharts.renderDepartmentBar('admin-dept-bar', summary.department_benchmarks);
      AppCharts.renderRiskDonut('admin-risk-donut', summary.risk_breakdown);
      AppCharts.renderSegmentationScatter('admin-segmentation-scatter', this.state.students);
      AIChat.init();
      lucide.createIcons();
    }, 50);
  },

  // --- FILTERS & STUDENT TABLE RENDERING ---
  applyFilters() {
    const search = document.getElementById('filter-search')?.value.toLowerCase() || '';
    const risk = document.getElementById('filter-risk')?.value || 'All Risks';
    const dept = document.getElementById('filter-dept')?.value || 'All Departments';

    const filtered = this.state.students.filter(s => {
      if (search && !s.name.toLowerCase().includes(search) && !s.student_id.toLowerCase().includes(search)) {
        return false;
      }
      if (dept !== 'All Departments' && s.department !== dept) {
        return false;
      }
      if (risk !== 'All Risks') {
        if (risk === 'Dual-Risk' && s.overall_risk !== 'Dual-Risk') return false;
        if (risk === 'High Risk' && !['High Risk', 'Dual-Risk'].includes(s.overall_risk)) return false;
        if (risk === 'Moderate Risk' && s.overall_risk !== 'Moderate Risk') return false;
        if (risk === 'Safe' && s.overall_risk !== 'Safe / Thriving') return false;
      }
      return true;
    });

    this.renderStudentRows(filtered);
  },

  renderStudentRows(students) {
    const tbody = document.getElementById('student-roster-tbody');
    if (!tbody) return;

    if (students.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="p-6 text-center text-slate-400">No students found matching current filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = students.map(s => {
      let riskBadge = 'badge-success';
      if (s.overall_risk === 'Dual-Risk') riskBadge = 'badge-danger font-black';
      else if (s.overall_risk === 'High Risk') riskBadge = 'badge-warning font-bold';
      else if (s.overall_risk === 'Moderate Risk') riskBadge = 'badge-warning';

      return `
        <tr class="hover:bg-slate-50/80 transition-colors cursor-pointer" onclick="App.openStudentModal('${s.student_id}')">
          <td class="py-3 px-3">
            <div class="flex items-center gap-2.5">
              <img src="${s.avatar}" class="w-7 h-7 rounded-full bg-slate-200" />
              <div>
                <div class="font-bold text-slate-900">${s.name}</div>
                <div class="text-[11px] text-slate-400">${s.student_id}</div>
              </div>
            </div>
          </td>
          <td class="py-3 px-3 text-slate-600">${s.department}</td>
          <td class="py-3 px-3">
            <div class="font-extrabold text-sm ${s.success_score >= 80 ? 'text-emerald-600' : s.success_score >= 60 ? 'text-indigo-600' : 'text-rose-600'}">
              ${s.success_score}
            </div>
          </td>
          <td class="py-3 px-3">
            <div class="font-semibold text-slate-800">CGPA: ${s.cgpa}</div>
            <div class="text-[11px] ${s.backlogs > 0 ? 'text-rose-500 font-bold' : 'text-slate-400'}">Backlogs: ${s.backlogs}</div>
          </td>
          <td class="py-3 px-3">
            <div class="font-semibold ${s.attendance_pct < 75 ? 'text-rose-600 font-bold' : 'text-slate-800'}">${s.attendance_pct}%</div>
            <div class="text-[11px] ${s.attendance_pct < 75 ? 'text-rose-500 font-bold' : 'text-emerald-500'}">${s.attendance_pct < 75 ? 'Detention Risk' : 'Compliant'}</div>
          </td>
          <td class="py-3 px-3">
            <div class="font-semibold text-slate-800">Code: ${s.coding_score}/100</div>
            <div class="text-[11px] text-slate-400">Apt: ${s.aptitude_score}/100</div>
          </td>
          <td class="py-3 px-3">
            <span class="badge-curved badge-info text-[11px]">${s.segment_badge}</span>
          </td>
          <td class="py-3 px-3">
            <span class="badge-curved ${riskBadge} text-[11px] flex items-center gap-1.5">
              ${s.overall_risk === 'Dual-Risk' ? '<span class="pulse-dot pulse-dot-red"></span>' : ''}
              ${s.overall_risk}
            </span>
          </td>
          <td class="py-3 px-3 text-right" onclick="event.stopPropagation()">
            <button onclick="App.triggerIntervention('${s.student_id}', 'schedule_counseling')" class="btn-pill-action btn-primary text-[11px] py-1 px-2.5">
              <i data-lucide="calendar" class="w-3 h-3"></i>
              <span>Counsel</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    lucide.createIcons();
  },

  // --- MODALS ---
  async openStudentModal(studentId) {
    const modal = document.getElementById('student-modal');
    const content = document.getElementById('student-modal-content');
    modal.classList.remove('hidden');
    content.innerHTML = `<div class="p-8 text-center text-slate-500"><span class="animate-spin inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full"></span> Loading 360° analytics & AI recommendations...</div>`;

    const res = await fetch(`/api/students/${studentId}`);
    const data = await res.json();
    const s = data.student;
    const m = data.metrics;
    const inv = data.interventions;

    content.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div class="flex items-center gap-3">
            <img src="${s.avatar}" class="w-12 h-12 rounded-full bg-slate-100 border border-slate-200" />
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-xl font-black text-slate-900">${s.name}</h3>
                <span class="badge-curved badge-info text-xs">${s.student_id}</span>
                <span class="badge-curved ${m.risks.risk_color === 'green' ? 'badge-success' : m.risks.risk_color === 'red' ? 'badge-danger font-bold' : 'badge-warning'} text-xs">${m.risks.overall_risk}</span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">${s.department} • ${s.year} • Specialization: ${s.specialization}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="text-right">
              <div class="text-xs text-slate-500 font-semibold uppercase">Success Score</div>
              <div class="text-2xl font-black text-indigo-600">${m.success_score}<span class="text-xs text-slate-400 font-normal"> / 100</span></div>
            </div>
            <div class="h-10 w-px bg-slate-200"></div>
            <button onclick="App.triggerIntervention('${s.student_id}', 'email_notice')" class="btn-curved btn-secondary text-xs py-1.5 px-3">
              <i data-lucide="mail" class="w-3.5 h-3.5"></i>
              <span>Send Notice</span>
            </button>
            <button onclick="App.triggerIntervention('${s.student_id}', 'schedule_counseling')" class="btn-curved btn-primary text-xs py-1.5 px-3">
              <i data-lucide="user-check" class="w-3.5 h-3.5"></i>
              <span>Assign Mentor</span>
            </button>
          </div>
        </div>

        <!-- AI Executive Synthesis -->
        <div class="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl text-xs space-y-2">
          <div class="flex items-center gap-2 font-bold text-indigo-900 text-sm">
            <i data-lucide="sparkles" class="w-4 h-4 text-indigo-600"></i>
            <span>AI Automated Diagnostic Assessment</span>
          </div>
          <p class="text-slate-700 leading-relaxed">${inv.ai_executive_summary}</p>
        </div>

        <!-- 2 Columns: Explainable Waterfall & Competency Radar -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-3">
            <h4 class="font-bold text-slate-800 text-sm">Explainable Score Driver Attribution</h4>
            <div class="h-44 w-full">
              <canvas id="modal-driver-bar"></canvas>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div><strong>Primary Boost:</strong> <span class="text-emerald-700 font-semibold">${m.explainability.top_positive_driver.dimension}</span> (${m.explainability.top_positive_driver.metric_value})</div>
              <div><strong>Primary Drag:</strong> <span class="text-rose-700 font-semibold">${m.explainability.top_negative_drag.dimension}</span> (${m.explainability.top_negative_drag.metric_value})</div>
            </div>
          </div>

          <div class="space-y-3">
            <h4 class="font-bold text-slate-800 text-sm">Competency Radar Dimensions</h4>
            <div class="h-56 w-full">
              <canvas id="modal-radar-chart"></canvas>
            </div>
          </div>
        </div>

        <!-- Subject Marks Breakdown -->
        <div class="space-y-2">
          <h4 class="font-bold text-slate-800 text-sm">Current Semester Subject Performance</h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            ${Object.entries(s.academic.subject_marks).map(([sub, mark]) => `
              <div class="p-3 bg-white border border-slate-200 rounded-xl space-y-1 text-xs">
                <div class="font-semibold text-slate-700 truncate">${sub}</div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 font-medium">Marks:</span>
                  <span class="font-bold ${mark >= 75 ? 'text-emerald-600' : mark >= 60 ? 'text-indigo-600' : 'text-rose-600'}">${mark}/100</span>
                </div>
                <div class="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Attendance:</span>
                  <span class="${s.attendance.subject_attendance[sub] < 75 ? 'text-rose-500 font-bold' : 'text-slate-600'}">${s.attendance.subject_attendance[sub]}%</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Dynamic AI Prioritized Interventions -->
        <div class="space-y-3">
          <h4 class="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span>Prioritized Action Interventions</span>
            <span class="badge-curved badge-info text-xs">${inv.interventions_count} Actions Recommended</span>
          </h4>
          <div class="space-y-3">
            ${inv.prioritized_interventions.map(act => `
              <div class="p-4 rounded-xl border ${act.urgency_badge === 'danger' ? 'border-rose-200 bg-rose-50/30' : act.urgency_badge === 'warning' ? 'border-amber-200 bg-amber-50/30' : 'border-indigo-200 bg-indigo-50/30'} space-y-2 text-xs">
                <div class="flex items-center justify-between">
                  <span class="badge-curved ${act.urgency_badge === 'danger' ? 'badge-danger' : act.urgency_badge === 'warning' ? 'badge-warning' : 'badge-info'} text-xs font-bold">${act.title}</span>
                  <span class="text-slate-500 font-medium">${act.timeframe}</span>
                </div>
                <p class="text-slate-600">${act.diagnosis}</p>
                <div class="bg-white/80 p-2.5 rounded-lg border border-slate-200/60">
                  <div class="font-semibold text-slate-700 mb-1">Recommended Action:</div>
                  <ul class="list-disc list-inside text-slate-600 space-y-0.5">
                    ${act.action_steps.map(st => `<li>${st}</li>`).join('')}
                  </ul>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      AppCharts.renderDriverAttributionBar('modal-driver-bar', m.explainability.all_attributions);
      AppCharts.renderCompetencyRadar('modal-radar-chart', s.skills.skill_radar);
      lucide.createIcons();
    }, 50);
  },

  closeStudentModal() {
    document.getElementById('student-modal').classList.add('hidden');
  },

  // --- SYLLABUS MANAGEMENT MODAL (Faculty & Admin) ---
  async openSyllabusModal() {
    const modal = document.getElementById('syllabus-modal');
    const content = document.getElementById('syllabus-modal-content');
    modal.classList.remove('hidden');
    content.innerHTML = `<div class="p-8 text-center text-slate-500"><span class="animate-spin inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full"></span> Loading course syllabus records...</div>`;

    const res = await fetch('/api/syllabus');
    const data = await res.json();
    const courses = data.courses;

    content.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Course Syllabus & Curriculum Progress Manager</h3>
            <p class="text-xs text-slate-500">Update lecture unit milestones to reflect actual syllabus delivery in classrooms.</p>
          </div>
        </div>

        <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          ${courses.map(c => `
            <div class="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-slate-900">${c.course_name}</span>
                    <span class="badge-curved badge-info text-xs">${c.course_id}</span>
                    <span class="badge-curved ${c.status === 'Ahead of Schedule' ? 'badge-success' : c.status.includes('Delayed') ? 'badge-danger font-bold' : 'badge-warning'} text-xs">${c.status}</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-0.5">${c.department} • Instructor: ${c.instructor} • Target: ${c.target_completion_date}</div>
                </div>

                <div class="text-right">
                  <span class="text-xs font-semibold text-slate-500">Progress:</span>
                  <span class="text-sm font-black text-indigo-600 ml-1">${c.completion_pct}%</span>
                  <div class="text-[11px] text-slate-400">${c.completed_modules}/${c.total_modules} Modules Delivered</div>
                </div>
              </div>

              <!-- Units List -->
              <div class="space-y-2 pt-2 border-t border-slate-100 text-xs">
                ${c.units.map(u => `
                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60">
                    <div class="flex items-center gap-2.5">
                      <span class="font-bold text-slate-700">Unit ${u.unit_no}:</span>
                      <span class="text-slate-600">${u.title}</span>
                    </div>

                    <div class="flex items-center gap-3">
                      <span class="badge-curved ${u.status === 'Completed' ? 'badge-success' : u.status === 'In Progress' ? 'badge-warning' : 'badge-danger'} text-[11px]">
                        ${u.status} (${u.completed}/${u.modules} Mods)
                      </span>
                      <button onclick="App.toggleUnitStatus('${c.course_id}', ${u.unit_no}, ${u.modules}, '${u.status === 'Completed' ? 'In Progress' : 'Completed'}')" class="btn-pill-action btn-secondary text-[11px] py-1 px-2.5">
                        ${u.status === 'Completed' ? 'Mark In Progress' : 'Mark Completed'}
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    lucide.createIcons();
  },

  closeSyllabusModal() {
    document.getElementById('syllabus-modal').classList.add('hidden');
  },

  async toggleUnitStatus(courseId, unitNo, totalModules, newStatus) {
    const completed = newStatus === 'Completed' ? totalModules : Math.floor(totalModules / 2);
    await fetch('/api/syllabus/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_id: courseId,
        unit_no: unitNo,
        completed_modules: completed,
        status: newStatus
      })
    });
    this.openSyllabusModal(); // refresh syllabus modal
  },

  // --- INTERVENTION TRIGGER ---
  async triggerIntervention(studentId, actionType) {
    const res = await fetch('/api/interventions/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, action_type: actionType })
    });
    const data = await res.json();
    alert(`✅ Action Dispatched!\n${data.action_taken} for ${data.student_name} (${data.student_id}). Notification sent to academic mentor.`);
  },

  // --- METHODOLOGY & SLIDES MODALS ---
  openMethodologyModal() {
    document.getElementById('methodology-modal').classList.remove('hidden');
    lucide.createIcons();
  },

  closeMethodologyModal() {
    document.getElementById('methodology-modal').classList.add('hidden');
  },

  openSlidesModal() {
    document.getElementById('slides-modal').classList.remove('hidden');
    lucide.createIcons();
  },

  closeSlidesModal() {
    document.getElementById('slides-modal').classList.add('hidden');
  }
};

window.App = App;
window.onload = () => App.init();

