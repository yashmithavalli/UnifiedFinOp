/**
 * Dashboard — Charts & Interactions
 * ===================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Sidebar mobile toggle ─────────────────────────────────
  const menuBtn = document.getElementById('dashMenuBtn');
  const sidebar = document.getElementById('sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  // ── Charts ────────────────────────────────────────────────
  const chartColors = {
    blue: '#4285F4', green: '#34A853',
    yellow: '#FBBC05', red: '#EA4335',
    blueBg: 'rgba(66,133,244,0.1)', greenBg: 'rgba(52,168,83,0.1)',
  };

  const chartDefaults = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { labels: { font: { family: 'Inter', size: 12 }, padding: 14, boxWidth: 10 } },
      tooltip: {
        backgroundColor: '#FFF', titleColor: '#202124', bodyColor: '#5F6368',
        borderColor: '#E5E7EB', borderWidth: 1, padding: 12,
        titleFont: { family: 'Inter', weight: '600' },
        bodyFont: { family: 'Inter' },
      }
    }
  };

  // Monthly Spending Trend
  const trendCtx = document.getElementById('spendTrendChart');
  if (trendCtx) {
    const ctx = trendCtx.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 260);
    grad.addColorStop(0, 'rgba(66,133,244,0.15)'); grad.addColorStop(1, 'rgba(66,133,244,0.01)');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
        datasets: [
          {
            label: 'Budget', data: [180, 190, 185, 195, 200, 205, 210, 215, 200, 220, 225, 230],
            borderColor: chartColors.green, backgroundColor: 'transparent',
            borderWidth: 2, tension: 0.4, pointRadius: 3, pointHoverRadius: 5, borderDash: [6, 4],
          },
          {
            label: 'Actual Spend', data: [160, 175, 195, 180, 210, 190, 225, 200, 215, 240, 210, 235],
            borderColor: chartColors.blue, backgroundColor: grad,
            fill: true, borderWidth: 2, tension: 0.4, pointRadius: 3, pointHoverRadius: 5,
          }
        ]
      },
      options: {
        ...chartDefaults,
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#9AA0A6' } },
          y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#9AA0A6', callback: v => `$${v}K` } }
        }
      }
    });
  }

  // Department Distribution
  const deptCtx = document.getElementById('deptDistChart');
  if (deptCtx) {
    new Chart(deptCtx.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Engineering', 'Marketing', 'HR', 'Finance', 'Operations', 'Sales'],
        datasets: [{
          data: [35, 20, 12, 15, 10, 8],
          backgroundColor: ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#A142F4', '#FF6D01'],
          borderWidth: 2, borderColor: '#fff', hoverOffset: 4,
        }]
      },
      options: {
        ...chartDefaults,
        cutout: '65%',
        plugins: {
          ...chartDefaults.plugins,
          legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 11 }, padding: 10, boxWidth: 10 } }
        }
      }
    });
  }

  // Project Cost Breakdown
  const projCtx = document.getElementById('projectChart');
  if (projCtx) {
    new Chart(projCtx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Cloud Migration', 'DevOps Tooling', 'AI Platform', 'HRIS Setup', 'Ad Campaign'],
        datasets: [{
          label: 'Cost ($K)',
          data: [85, 42, 65, 38, 28],
          backgroundColor: ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#A142F4'],
          borderRadius: 6, borderSkipped: false,
        }]
      },
      options: {
        ...chartDefaults,
        indexAxis: 'y',
        plugins: { ...chartDefaults.plugins, legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#9AA0A6', callback: v => `$${v}K` } },
          y: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 }, color: '#5F6368' } }
        }
      }
    });
  }

  // Top Vendors
  const vendorCtx = document.getElementById('vendorChart');
  if (vendorCtx) {
    new Chart(vendorCtx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['AWS', 'Microsoft', 'Google Cloud', 'Dell', 'Workday'],
        datasets: [{
          label: 'Spend ($K)',
          data: [120, 85, 68, 45, 32],
          backgroundColor: '#4285F4',
          borderRadius: 6, borderSkipped: false,
        }]
      },
      options: {
        ...chartDefaults,
        plugins: { ...chartDefaults.plugins, legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 }, color: '#5F6368' } },
          y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#9AA0A6', callback: v => `$${v}K` } }
        }
      }
    });
  }

  // ── Department Charts ─────────────────────────────────────
  const deptSpendCtx = document.getElementById('deptSpendChart');
  if (deptSpendCtx) {
    new Chart(deptSpendCtx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Engineering', 'Marketing', 'HR', 'Finance'],
        datasets: [
          { label: 'Budget', data: [500, 300, 200, 250], backgroundColor: 'rgba(66,133,244,0.2)', borderRadius: 6, borderSkipped: false },
          { label: 'Spent', data: [420, 280, 150, 230], backgroundColor: '#4285F4', borderRadius: 6, borderSkipped: false }
        ]
      },
      options: {
        ...chartDefaults,
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 }, color: '#5F6368' } },
          y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#9AA0A6', callback: v => `$${v}K` } }
        }
      }
    });
  }

  // ── Vendor Trend Chart ────────────────────────────────────
  const vendorTrendCtx = document.getElementById('vendorTrendChart');
  if (vendorTrendCtx) {
    new Chart(vendorTrendCtx.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
        datasets: [
          { label: 'AWS', data: [18, 22, 20, 25, 21, 24], borderColor: '#FF9900', borderWidth: 2, tension: 0.4, pointRadius: 3 },
          { label: 'Microsoft', data: [12, 14, 16, 13, 15, 17], borderColor: '#00A4EF', borderWidth: 2, tension: 0.4, pointRadius: 3 },
          { label: 'Google Cloud', data: [10, 11, 13, 12, 14, 15], borderColor: '#4285F4', borderWidth: 2, tension: 0.4, pointRadius: 3 },
          { label: 'Dell', data: [5, 8, 6, 9, 7, 10], borderColor: '#007DB8', borderWidth: 2, tension: 0.4, pointRadius: 3 },
        ]
      },
      options: {
        ...chartDefaults,
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#9AA0A6' } },
          y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#9AA0A6', callback: v => `$${v}K` } }
        }
      }
    });
  }

  // ── Upload Zone ───────────────────────────────────────────
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  if (uploadZone && fileInput) {
    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
    uploadZone.addEventListener('drop', e => {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', e => {
      if (e.target.files[0]) handleUpload(e.target.files[0]);
    });
  }

  // ── Policy Toggles ────────────────────────────────────────
  document.querySelectorAll('.policy-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => toggle.classList.toggle('active'));
  });
});

// ── Upload Handler ──────────────────────────────────────────
function handleUpload(file) {
  const uploadStatus = document.getElementById('uploadStatus');
  if (!uploadStatus) return;

  const steps = [
    'Uploading file...', 'Parsing dataset...', 'Validating columns...',
    'Normalizing data...', 'Storing data...', 'Generating insights...'
  ];

  uploadStatus.style.display = 'block';
  let step = 0;

  const interval = setInterval(() => {
    if (step < steps.length) {
      uploadStatus.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--blue-light);border-radius:var(--r-sm);margin-bottom:8px;">
          <div style="width:16px;height:16px;border:2px solid rgba(66,133,244,0.2);border-top-color:var(--blue);border-radius:50%;animation:spin 0.6s linear infinite;"></div>
          <span style="font-size:13px;color:var(--blue);font-weight:500;">${steps[step]}</span>
        </div>
        <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
      `;
      step++;
    } else {
      clearInterval(interval);
      uploadStatus.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--green-light);border-radius:var(--r-sm);">
          <i class="bi bi-check-circle-fill" style="color:var(--green);font-size:18px;"></i>
          <div>
            <strong style="font-size:13px;">Upload Complete!</strong>
            <p style="font-size:12px;color:var(--text2);margin:0;">${file.name} — ${file.size > 1024 ? (file.size / 1024).toFixed(1) + ' KB' : file.size + ' B'}</p>
          </div>
        </div>
      `;
    }
  }, 800);
}

// ── Export Dashboard ─────────────────────────────────────────
function exportDashboard() {
  const data = [
    ['Date', 'Department', 'Vendor', 'Project', 'Amount', 'Status'],
    ['2026-03-08', 'Engineering', 'AWS', 'Cloud Migration', '12400', 'Approved'],
    ['2026-03-07', 'Marketing', 'Google', 'Ad Campaign Q1', '8200', 'Approved'],
    ['2026-03-07', 'HR', 'Workday', 'HRIS Setup', '15600', 'Pending'],
    ['2026-03-06', 'Engineering', 'Microsoft', 'DevOps Tooling', '6300', 'Approved'],
    ['2026-03-05', 'Finance', 'Dell', 'Hardware Refresh', '22100', 'Flagged'],
    ['2026-03-04', 'Engineering', 'Google Cloud', 'AI Platform', '9800', 'Approved'],
  ];
  const csv = data.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'finops_report.csv';
  a.click();
}

// ── Report Export ────────────────────────────────────────────
function exportReport(type) {
  const reports = {
    department: [
      ['Department', 'Budget', 'Spent', 'Utilization'],
      ['Engineering', '500000', '420000', '84%'],
      ['Marketing', '300000', '280000', '93%'],
      ['HR', '200000', '150000', '75%'],
      ['Finance', '250000', '230000', '92%'],
    ],
    vendor: [
      ['Vendor', 'Total Spend', 'Transactions', 'Departments'],
      ['AWS', '120000', '45', 'Engineering, Operations'],
      ['Microsoft', '85000', '32', 'Engineering, Finance'],
      ['Google Cloud', '68000', '28', 'Engineering, Marketing'],
      ['Dell', '45000', '12', 'Finance, HR'],
    ],
    budget: [
      ['Department', 'Budget', 'Spent', 'Remaining', 'Status'],
      ['Engineering', '500000', '420000', '80000', 'On Track'],
      ['Marketing', '300000', '280000', '20000', 'At Risk'],
      ['HR', '200000', '150000', '50000', 'On Track'],
      ['Finance', '250000', '230000', '20000', 'At Risk'],
    ]
  };
  const data = reports[type] || reports.department;
  const csv = data.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `finops_${type}_report.csv`;
  a.click();
}
