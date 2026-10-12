/**
 * Interactive Visualizations Engine (Chart.js wrapper)
 * Renders gauges, radar profiles, driver waterfalls, scatter segmentation, and trend lines.
 */

window.AppCharts = {
  instances: {},

  destroyChart(id) {
    if (this.instances[id]) {
      this.instances[id].destroy();
      delete this.instances[id];
    }
  },

  // 1. Success Score Gauge / Donut
  renderSuccessScoreGauge(canvasId, score, riskColor = 'green') {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    let fillColor = '#10b981'; // emerald
    if (score < 50 || riskColor === 'red') fillColor = '#ef4444'; // rose
    else if (score < 70 || riskColor === 'orange' || riskColor === 'yellow') fillColor = '#f59e0b'; // amber

    this.instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [score, 100 - score],
          backgroundColor: [fillColor, '#e2e8f0'],
          borderWidth: 0,
          circumference: 240,
          rotation: 240,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '80%',
        plugins: {
          tooltip: { enabled: false }
        }
      }
    });
  },

  // 2. Student Competency Radar Chart
  renderCompetencyRadar(canvasId, radarData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const labels = Object.keys(radarData);
    const values = Object.values(radarData);

    this.instances[canvasId] = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Student Competency',
          data: values,
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          borderColor: '#4f46e5',
          pointBackgroundColor: '#4f46e5',
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#4f46e5',
          borderWidth: 2,
          pointRadius: 4
        }, {
          label: 'Campus Benchmark (Mean)',
          data: [75, 70, 72, 70, 75, 78],
          backgroundColor: 'rgba(148, 163, 184, 0.1)',
          borderColor: '#94a3b8',
          borderDash: [4, 4],
          borderWidth: 1.5,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: '#e2e8f0' },
            grid: { color: '#f1f5f9' },
            suggestedMin: 30,
            suggestedMax: 100,
            ticks: {
              stepSize: 20,
              font: { size: 10 },
              backdropColor: 'transparent'
            },
            pointLabels: {
              font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
              color: '#475569'
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { family: 'Plus Jakarta Sans', size: 11 } }
          }
        }
      }
    });
  },

  // 3. Academic Semester History Line Chart
  renderSemesterLine(canvasId, historyData) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const labels = historyData.map(h => h.semester);
    const data = historyData.map(h => h.sgpa);

    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Semester SGPA',
          data: data,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#4f46e5',
          pointBorderWidth: 2,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 4,
            max: 10,
            grid: { color: '#f1f5f9' },
            ticks: { stepSize: 1, font: { size: 10 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11, weight: '500' } }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  },

  // 4. Explainable Score Driver Attribution Horizontal Bar Chart
  renderDriverAttributionBar(canvasId, attributions) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const labels = attributions.map(a => a.dimension);
    const deltas = attributions.map(a => a.delta);
    const bgColors = deltas.map(d => d >= 0 ? '#10b981' : '#ef4444');

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Impact on Success Score (Points)',
          data: deltas,
          backgroundColor: bgColors,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: '#f1f5f9' },
            ticks: {
              callback: val => (val > 0 ? `+${val}` : `${val}`),
              font: { size: 10 }
            }
          },
          y: {
            grid: { display: false },
            ticks: { font: { size: 11, weight: '500' } }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `Impact: ${ctx.raw > 0 ? '+' : ''}${ctx.raw} pts vs cohort mean`
            }
          }
        }
      }
    });
  },

  // 5. Cohort Risk Distribution Donut (Faculty / Admin)
  renderRiskDonut(canvasId, riskBreakdown) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    this.instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Safe / Thriving', 'Moderate Watchlist', 'High Risk', 'Dual-Risk (Critical)'],
        datasets: [{
          data: [
            riskBreakdown.safe_thriving,
            riskBreakdown.moderate_risk,
            riskBreakdown.high_risk - riskBreakdown.dual_risk,
            riskBreakdown.dual_risk
          ],
          backgroundColor: ['#10b981', '#f59e0b', '#f97316', '#ef4444'],
          borderWidth: 2,
          borderColor: '#ffffff',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, font: { size: 11 } }
          }
        }
      }
    });
  },

  // 6. Strategic Student Segmentation Scatter Plot
  renderSegmentationScatter(canvasId, studentList) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Map students into scatter points: X = CGPA (scaled 0-10), Y = Placement Coding Score (0-100)
    const points = studentList.map(s => {
      let color = '#10b981';
      if (s.overall_risk === 'Dual-Risk') color = '#ef4444';
      else if (s.overall_risk === 'High Risk') color = '#f97316';
      else if (s.overall_risk === 'Moderate Risk') color = '#f59e0b';

      return {
        x: s.cgpa,
        y: s.coding_score,
        name: s.name,
        dept: s.department,
        score: s.success_score,
        segment: s.segment_name,
        color: color
      };
    });

    this.instances[canvasId] = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Students',
          data: points,
          pointBackgroundColor: points.map(p => p.color),
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointRadius: 6,
          pointHoverRadius: 9
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: { display: true, text: 'Academic Mastery (CGPA)', font: { size: 11, weight: '600' } },
            min: 4,
            max: 10,
            grid: { color: '#f1f5f9' }
          },
          y: {
            title: { display: true, text: 'Placement Coding Benchmark (0–100)', font: { size: 11, weight: '600' } },
            min: 20,
            max: 100,
            grid: { color: '#f1f5f9' }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const p = ctx.raw;
                return `${p.name} (${p.dept}): CGPA ${p.x}, Code ${p.y} | Score: ${p.score}`;
              }
            }
          }
        }
      }
    });
  },

  // 7. Department Benchmark Bar Chart (Admin)
  renderDepartmentBar(canvasId, deptBenchmarks) {
    this.destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const labels = deptBenchmarks.map(d => d.department.replace('Computer Science', 'CSE').replace('Information Technology', 'IT').replace('Electronics & Comm', 'ECE').replace('Data Science', 'DS'));
    const scores = deptBenchmarks.map(d => d.avg_success_score);
    const attendance = deptBenchmarks.map(d => d.avg_attendance);

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Avg Success Score',
          data: scores,
          backgroundColor: '#4f46e5',
          borderRadius: 6
        }, {
          label: 'Avg Attendance %',
          data: attendance,
          backgroundColor: '#06b6d4',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 40,
            max: 100,
            grid: { color: '#f1f5f9' },
            ticks: { font: { size: 10 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11, weight: '600' } }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 11 } }
          }
        }
      }
    });
  }
};

