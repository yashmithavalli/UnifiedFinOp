/**
 * FinTrackTN — Main Application Logic
 * =====================================
 * Upload-driven dashboard:
 * 1. Landing page shown first
 * 2. User uploads CSV or Excel
 * 3. File is parsed → dashboard data built
 * 4. Charts, feed, bars populated with REAL data
 * 5. Budget alerts fired if dept >= 90% utilisation
 */

// ── Globals ─────────────────────────────────────────────────
let chartInstances = {};
let dashboardData  = null;
let currentFileName = '';
let txSimIndex = 0;
let txSimInterval = null;
let countersStarted = false;

const DEPT_COLORS = [
  '#ef4444','#8b5cf6','#f59e0b','#10b981',
  '#00d4ff','#6366f1','#ec4899','#14b8a6','#f97316','#a855f7'
];
const DEPT_ICONS = [
  'bi-heart-pulse','bi-book','bi-buildings','bi-tree',
  'bi-bus-front','bi-cpu','bi-hospital','bi-droplet','bi-lightning','bi-people'
];
const MONTH_ORDER = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── On DOM Ready ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  AOS.init({ duration: 550, easing: 'ease-out', once: true });

  // Live clock
  setInterval(() => {
    const ts = document.getElementById('lastUpdated');
    if (ts) ts.textContent = 'Updated: ' + new Date().toLocaleTimeString('en-IN');
  }, 1000);

  // ── Upload Zone ────────────────────────────────────────────
  const uploadZone = document.getElementById('uploadZone');
  const fileInput  = document.getElementById('fileInput');

  uploadZone.addEventListener('click', () => fileInput.click());

  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  });

  // Demo & re-upload
  document.getElementById('loadDemoBtn').addEventListener('click', loadDemoData);
  document.getElementById('reuploadBtn').addEventListener('click', goToLanding);
  document.getElementById('navUploadBtn').addEventListener('click', goToLanding);

  const panelUpload = document.getElementById('panelUploadBtn');
  if (panelUpload) panelUpload.addEventListener('click', goToLanding);

  const sidebarUpload = document.getElementById('sidebarUploadBtn');
  if (sidebarUpload) sidebarUpload.addEventListener('click', goToLanding);

  // Re-upload hidden input
  const reInput = document.getElementById('reuploadInput');
  if (reInput) reInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  });

  // Sidebar toggle
  const toggleBtn = document.getElementById('sidebarToggle');
  const panel     = document.getElementById('sidebarPanel');
  const topnav    = document.getElementById('topnav');
  const mainC     = document.getElementById('mainContent');
  let panelOpen   = true;

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      panelOpen = !panelOpen;
      panel.classList.toggle('collapsed', !panelOpen);
      topnav.classList.toggle('expanded', !panelOpen);
      mainC.classList.toggle('expanded', !panelOpen);
      const ab = document.getElementById('alertBanner');
      if (ab) ab.style.left = panelOpen ? 'var(--sidebar-w)' : 'var(--strip-w)';
    });
  }
});

// ── Go back to landing page ──────────────────────────────────
function goToLanding() {
  document.body.classList.remove('dashboard-ready');
  // Reset charts
  Object.values(chartInstances).forEach(c => c.destroy());
  chartInstances = {};
  countersStarted = false;
  if (txSimInterval) { clearInterval(txSimInterval); txSimInterval = null; }
  // Reset file inputs
  document.getElementById('fileInput').value = '';
  const ri = document.getElementById('reuploadInput');
  if (ri) ri.value = '';
}

// ── File Processing ──────────────────────────────────────────
function processFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  currentFileName = file.name;
  showProgress('Reading file...');

  const reader = new FileReader();

  if (ext === 'csv') {
    reader.onload = (e) => {
      showProgress('Parsing CSV...');
      setTimeout(() => {
        const rows = parseCSVText(e.target.result);
        buildDashboard(rows, file.name);
      }, 300);
    };
    reader.readAsText(file);
  } else if (['xlsx', 'xls'].includes(ext)) {
    reader.onload = (e) => {
      showProgress('Parsing Excel...');
      setTimeout(() => {
        try {
          const wb   = XLSX.read(e.target.result, { type: 'array' });
          const ws   = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
          buildDashboard(rows, file.name);
        } catch (err) {
          hideProgress();
          alert('Could not read Excel file. Please try a CSV instead.');
        }
      }, 300);
    };
    reader.readAsArrayBuffer(file);
  } else {
    hideProgress();
    alert('Please upload a .csv or .xlsx file.');
  }
}

// ── Load Demo Data ───────────────────────────────────────
// Uses embedded sampleRows from data.js — avoids CORS on file:// protocol
function loadDemoData() {
  showProgress('Loading sample data...');
  setTimeout(() => {
    buildDashboard(FinTrackData.sampleRows, 'sample_data.csv');
  }, 400);
}

// ── CSV Parser ───────────────────────────────────────────────
function parseCSVText(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  return lines.slice(1).map(line => {
    // Handle quoted fields
    const values = [];
    let cur = ''; let inQ = false;
    for (let ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { values.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    values.push(cur.trim());
    return headers.reduce((obj, h, i) => {
      obj[h] = (values[i] || '').replace(/^"|"$/g, '').trim();
      return obj;
    }, {});
  }).filter(r => r.Department || r.department);
}

// ── Normalize a row (handles different column name cases) ────
function normalizeRow(row) {
  const g = (keys) => {
    for (const k of keys) if (row[k] !== undefined && row[k] !== '') return row[k];
    return '';
  };
  return {
    department: g(['Department','department','DEPARTMENT','Dept','dept']) || 'Unknown',
    category:   g(['Category','category','CATEGORY','Type','type'])       || 'General',
    amount:     parseFloat(g(['Amount','amount','AMOUNT','Expense','expense','Cost','cost'])) || 0,
    status:     (g(['Status','status','STATUS']) || 'approved').toLowerCase().trim(),
    month:      g(['Month','month','MONTH'])                               || 'Jan',
    budget:     parseFloat(g(['Budget','budget','BUDGET','BudgetAllocated','budget_allocated'])) || 0,
  };
}

// ── Build & Render Dashboard ─────────────────────────────────
function buildDashboard(rawRows, fileName) {
  showProgress('Calculating insights...');

  const rows = rawRows.map(normalizeRow).filter(r => r.amount > 0);

  if (rows.length === 0) {
    hideProgress();
    alert('No valid data found. Please check the file has columns: Department, Category, Amount, Status, Month, Budget');
    return;
  }

  // Group by department
  const deptMap = {};
  rows.forEach(r => {
    if (!deptMap[r.department]) {
      deptMap[r.department] = { spent: 0, budget: 0, count: 0 };
    }
    deptMap[r.department].spent += r.amount;
    if (r.budget > 0) deptMap[r.department].budget = r.budget;
    deptMap[r.department].count++;
  });

  // Build dept array with color assignments
  const departments = Object.entries(deptMap).map(([name, d], i) => ({
    id:     name.toLowerCase().replace(/\s+/g,'-'),
    name,
    spent:  Math.round(d.spent),
    budget: Math.round(d.budget) || Math.round(d.spent * 1.3), // estimate if missing
    color:  DEPT_COLORS[i % DEPT_COLORS.length],
    icon:   DEPT_ICONS[i % DEPT_ICONS.length],
    count:  d.count,
  }));

  // Group by month for area chart
  const monthMap = {};
  rows.forEach(r => {
    const m = r.month.substring(0,3); // normalize to 3-char
    if (!monthMap[m]) monthMap[m] = 0;
    monthMap[m] += r.amount;
  });
  const months = Object.keys(monthMap).sort((a,b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b));
  const totalBudget = departments.reduce((s, d) => s + d.budget, 0);
  const budgetPerMonth = months.length > 0 ? Math.round(totalBudget / months.length) : 0;

  // Build summary
  const totalSpent  = departments.reduce((s, d) => s + d.spent,  0);
  const alerts      = departments.filter(d => d.budget > 0 && (d.spent / d.budget) >= 0.9);

  dashboardData = {
    departments,
    transactions: rows.slice(0, 20),
    livePool:     rows.slice(0, 20), // used for simulated live feed
    monthlyData: {
      labels: months,
      actual: months.map(m => Math.round(monthMap[m])),
      budget: months.map(() => budgetPerMonth),
    },
    summary: {
      totalBudget,
      totalSpent,
      departments: departments.length,
      activeAlerts: alerts.length,
    },
    alerts,
  };

  // Transition
  setTimeout(() => {
    hideProgress();
    renderDashboard(fileName);
  }, 400);
}

// ── Render Dashboard ─────────────────────────────────────────
function renderDashboard(fileName) {
  // Show dashboard
  document.body.classList.add('dashboard-ready');

  const d = dashboardData;

  // File info
  document.getElementById('fileChipName').textContent  = fileName;
  document.getElementById('dataSourceName').textContent = fileName;
  document.getElementById('dataSourceName').parentElement.title = fileName;

  // Stats
  const budgetCr = fmtCr(d.summary.totalBudget);
  const spentCr  = fmtCr(d.summary.totalSpent);
  const pct      = ((d.summary.totalSpent / d.summary.totalBudget) * 100).toFixed(1);

  document.getElementById('statBudget').textContent = budgetCr;
  document.getElementById('statSpent').textContent  = spentCr;
  document.getElementById('statDepts').textContent  = d.summary.departments;
  document.getElementById('statAlerts').textContent = d.summary.activeAlerts;
  document.getElementById('spentPct').textContent   = pct;
  document.getElementById('donutTotalValue').textContent = spentCr;
  document.getElementById('txCountLabel').textContent   = `${d.transactions.length} entries loaded`;

  const alertSub = document.getElementById('statAlertSub');
  if (d.summary.activeAlerts > 0) {
    alertSub.className = 'stat-change danger';
    alertSub.innerHTML = `<i class="bi bi-exclamation-triangle"></i> ${d.summary.activeAlerts} dept(s) over 90%`;
  } else {
    alertSub.className = 'stat-change positive';
    alertSub.innerHTML = `<i class="bi bi-shield-check"></i> All within limits`;
  }

  // Alert banners — only fires if a dept is genuinely at/over 90% budget
  const ab = document.getElementById('alertBanner');
  ab.classList.remove('show');
  ab.style.display = 'none'; // always hide first
  if (d.alerts.length > 0) {
    const msgs = d.alerts.map(dep => {
      const p = Math.round((dep.spent / dep.budget) * 100);
      return `${dep.name} (${p}%)`;
    }).join(', ');
    document.getElementById('alertMessage').textContent =
      `${msgs} — Budget utilisation ≥ 90%`;
    ab.style.display = 'block';
    setTimeout(() => ab.classList.add('show'), 200);
    // Update alert badges
    ['navAlertBadge','sidebarAlertBadge'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.textContent = d.alerts.length; el.style.display = 'flex'; }
    });
  } else {
    // Hide badges
    ['navAlertBadge','sidebarAlertBadge'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }

  // Charts
  renderAreaChart(d.monthlyData);
  renderDonutChart(d.departments);

  // Budget bars
  renderBudgetBars(d.departments);

  // Transaction feed
  renderFeed(d.transactions);
  startLiveFeed(d.livePool);

  // Impact counters
  setupCounters(d.summary, d.transactions.length);

  // Fade in
  const mc = document.getElementById('mainContent');
  mc.classList.add('fade-in');
  setTimeout(() => mc.classList.remove('fade-in'), 600);
}

// ── Formatting Helpers ───────────────────────────────────────
function fmtCr(n) {
  if (n >= 10000000) return `₹${(n/10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n/100000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}
function fmtL(n) {
  return `${(n/100000).toFixed(1)}L`;
}

// ── Area Chart ───────────────────────────────────────────────
function renderAreaChart(monthly) {
  if (chartInstances.area) chartInstances.area.destroy();

  const ctx = document.getElementById('areaChart').getContext('2d');
  const gCyan  = ctx.createLinearGradient(0,0,0,240);
  gCyan.addColorStop(0,'rgba(0,212,255,0.25)'); gCyan.addColorStop(1,'rgba(0,212,255,0.01)');
  const gAmber = ctx.createLinearGradient(0,0,0,240);
  gAmber.addColorStop(0,'rgba(245,158,11,0.22)'); gAmber.addColorStop(1,'rgba(245,158,11,0.01)');

  chartInstances.area = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthly.labels,
      datasets: [
        {
          label: 'Budget (Estimated)',
          data: monthly.budget,
          borderColor: '#00d4ff', backgroundColor: gCyan,
          fill: true, tension: 0.45, borderWidth: 2,
          pointBackgroundColor: '#00d4ff', pointRadius: 4, pointHoverRadius: 6,
        },
        {
          label: 'Actual Spent',
          data: monthly.actual,
          borderColor: '#f59e0b', backgroundColor: gAmber,
          fill: true, tension: 0.45, borderWidth: 2,
          pointBackgroundColor: '#f59e0b', pointRadius: 4, pointHoverRadius: 6,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color:'#8898aa', font:{ family:'Inter', size:12 }, boxWidth:12, padding:16 } },
        tooltip: {
          backgroundColor:'#1e2a3a', borderColor:'rgba(255,255,255,0.08)', borderWidth:1,
          titleColor:'#e8edf5', bodyColor:'#8898aa', padding:12,
          callbacks: { label: ctx => ` ₹${fmtL(ctx.raw)} — ${ctx.dataset.label}` }
        }
      },
      scales: {
        x: { grid:{ color:'rgba(255,255,255,0.05)' }, ticks:{ color:'#8898aa', font:{ family:'Inter', size:11 } } },
        y: { grid:{ color:'rgba(255,255,255,0.05)' }, ticks:{ color:'#8898aa', font:{ family:'Inter', size:11 }, callback: v => `₹${fmtL(v)}` } }
      }
    }
  });
}

// ── Donut Chart ──────────────────────────────────────────────
function renderDonutChart(depts) {
  if (chartInstances.donut) chartInstances.donut.destroy();

  const ctx = document.getElementById('donutChart').getContext('2d');
  chartInstances.donut = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: depts.map(d => d.name.split(' ')[0]),
      datasets: [{
        data: depts.map(d => d.spent),
        backgroundColor: depts.map(d => d.color),
        borderWidth: 2, borderColor: '#151c2c', hoverOffset: 5,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: {
        legend: { position:'bottom', labels:{ color:'#8898aa', font:{ family:'Inter', size:11 }, boxWidth:10, padding:10 } },
        tooltip: {
          backgroundColor:'#1e2a3a', borderColor:'rgba(255,255,255,0.08)', borderWidth:1,
          titleColor:'#e8edf5', bodyColor:'#8898aa',
          callbacks: { label: ctx => ` ${fmtCr(ctx.raw)} spent` }
        }
      }
    }
  });
}

// ── Budget Progress Bars ─────────────────────────────────────
function renderBudgetBars(depts) {
  const container = document.getElementById('budgetBars');
  container.innerHTML = '';

  depts.forEach(dep => {
    const pct = Math.min(Math.round((dep.spent / dep.budget) * 100), 100);
    const color = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#00c48c';
    const cls   = pct >= 90 ? 'danger'  : pct >= 70 ? 'warning'  : 'positive';

    const row = document.createElement('div');
    row.className = 'budget-row';
    row.innerHTML = `
      <div class="budget-row-header">
        <span class="budget-dept-name">
          <i class="bi ${dep.icon}" style="color:${dep.color}"></i>
          ${dep.name}
        </span>
        <span class="budget-pct stat-change ${cls}">${pct}%</span>
      </div>
      <div class="budget-row-header" style="margin-top:-4px;margin-bottom:6px;">
        <span class="budget-amounts">Spent: ${fmtCr(dep.spent)}</span>
        <span class="budget-amounts">Budget: ${fmtCr(dep.budget)}</span>
      </div>
      <div class="budget-track">
        <div class="budget-fill" id="fill-${dep.id}" style="width:0%;background:${color};"></div>
      </div>`;
    container.appendChild(row);
    setTimeout(() => {
      const el = document.getElementById(`fill-${dep.id}`);
      if (el) el.style.width = `${pct}%`;
    }, 300);
  });
}

// ── Transaction Feed ─────────────────────────────────────────
function createTxRow(tx, isNew = false) {
  const row = document.createElement('div');
  row.className = 'tx-row';
  const cls = tx.status === 'approved' ? 'approved' : tx.status === 'flagged' ? 'flagged' : 'pending';
  row.innerHTML = `
    <span class="tx-dept">${tx.department || tx.dept}</span>
    <span class="tx-category">${tx.category}</span>
    <span class="tx-amount">${fmtCr(tx.amount)}</span>
    <span class="tx-status ${cls}">${tx.status}</span>
    ${isNew ? '<span class="tx-new-badge">NEW</span>' : ''}`;
  return row;
}

function renderFeed(transactions) {
  const feed = document.getElementById('transactionFeed');
  feed.innerHTML = '';
  transactions.forEach(tx => feed.appendChild(createTxRow(tx, false)));
}

function startLiveFeed(pool) {
  if (txSimInterval) clearInterval(txSimInterval);
  txSimIndex = 0;

  txSimInterval = setInterval(() => {
    const feed = document.getElementById('transactionFeed');
    if (!feed) return;
    const tx = pool[txSimIndex % pool.length];
    txSimIndex++;
    const row = createTxRow(tx, true);
    feed.insertBefore(row, feed.firstChild);
    setTimeout(() => { const b = row.querySelector('.tx-new-badge'); if (b) b.remove(); }, 3000);
    while (feed.children.length > 18) feed.removeChild(feed.lastChild);
  }, 4000);
}

// ── Impact Counters ──────────────────────────────────────────
function setupCounters(summary, txnCount) {
  countersStarted = false;

  // Pre-fill values
  document.getElementById('counter-budget').textContent = fmtCr(summary.totalBudget);
  document.getElementById('counter-txns').textContent   = txnCount;
  document.getElementById('counter-depts').textContent  = summary.departments;
  document.getElementById('counter-pct').textContent    =
    `${((summary.totalSpent / summary.totalBudget) * 100).toFixed(1)}%`;

  const impactSection = document.querySelector('.impact-section');
  if (!impactSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        animateCounter('counter-txns',  txnCount,          '', '',    1600);
        animateCounter('counter-depts', summary.departments,'', '',    1400);
      }
    });
  }, { threshold: 0.3 });
  observer.observe(impactSection);
}

function animateCounter(id, end, prefix, suffix, duration) {
  const el = document.getElementById(id);
  if (!el) return;
  const startTime = performance.now();
  function update(now) {
    const p = Math.min((now - startTime) / duration, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = `${prefix}${Math.floor(e * end)}${suffix}`;
    if (p < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ── Progress helpers ─────────────────────────────────────────
function showProgress(msg) {
  const p = document.getElementById('uploadProgress');
  const t = document.getElementById('uploadProgressText');
  if (p) p.classList.add('show');
  if (t) t.textContent = msg;
}
function hideProgress() {
  const p = document.getElementById('uploadProgress');
  if (p) p.classList.remove('show');
}
