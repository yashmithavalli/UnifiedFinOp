/**
 * Project Detail Page — Rendering & Charts
 * ==========================================
 * Reads ?id= query param, finds project in PLATFORM_DATA, renders everything.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Get project from URL ──────────────────────────────────
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');

  if (!projectId || typeof PLATFORM_DATA === 'undefined') {
    document.getElementById('projectHeader').innerHTML = `
      <div class="empty-state">
        <i class="bi bi-folder-x"></i>
        <div class="empty-state-title">Project Not Found</div>
        <div class="empty-state-desc">No project ID specified. <a href="dashboard.html">Return to Dashboard</a></div>
      </div>
    `;
    return;
  }

  // Find project and its domain
  let project = null, domain = null;
  for (const d of PLATFORM_DATA.domains) {
    const p = d.projects.find(p => p.id === projectId);
    if (p) { project = p; domain = d; break; }
  }

  if (!project) {
    document.getElementById('projectHeader').innerHTML = `
      <div class="empty-state">
        <i class="bi bi-folder-x"></i>
        <div class="empty-state-title">Project Not Found</div>
        <div class="empty-state-desc">Project ID "${projectId}" not found. <a href="dashboard.html">Return to Dashboard</a></div>
      </div>
    `;
    return;
  }

  const util = getUtilization(project.budget, project.spent);
  const remaining = project.budget - project.spent;

  // ── Update page title & breadcrumb ────────────────────────
  document.title = `${project.name} — Unified FinOps Platform`;
  document.getElementById('breadcrumbProject').textContent = project.name;

  // ── Project Header ────────────────────────────────────────
  const headerEl = document.getElementById('projectHeader');
  const overrunCats = project.categories.filter(c => parseFloat(getVariance(c.budget, c.spent)) > 10);

  headerEl.innerHTML = `
    <div class="project-detail-header">
      <div class="project-detail-info">
        <div class="project-detail-domain" style="color: ${domain.color};"><i class="bi ${domain.icon}"></i> ${domain.name}</div>
        <h1 class="dash-page-title" style="margin-bottom: 6px;">${project.name}</h1>
        <div class="project-detail-meta">
          <span><i class="bi bi-building"></i> ${project.agency}</span>
          <span><i class="bi bi-calendar3"></i> ${project.timeline}</span>
          <span class="status-badge ${project.status === 'In Progress' ? 'active' : 'pending'}">${project.status}</span>
          ${overrunCats.length > 0 ? `<span class="status-badge flagged"><i class="bi bi-exclamation-triangle"></i> ${overrunCats.length} budget overrun${overrunCats.length > 1 ? 's' : ''}</span>` : ''}
        </div>
      </div>
      <div class="dash-header-actions">
        <button class="btn-secondary" onclick="exportProjectCSV()"><i class="bi bi-download"></i> Export</button>
      </div>
    </div>
  `;

  // ── KPI Cards ─────────────────────────────────────────────
  const kpiEl = document.getElementById('projectKPIs');
  kpiEl.innerHTML = `
    <div class="kpi-card">
      <div class="kpi-header">
        <div class="kpi-icon" style="background: var(--blue-light); color: var(--blue);"><i class="bi bi-wallet2"></i></div>
      </div>
      <div class="kpi-value">${formatCr(project.budget)}</div>
      <div class="kpi-label">Total Budget</div>
      <div class="kpi-health">
        <span class="health-dot ${util > 85 ? 'critical' : util > 70 ? 'warning' : 'healthy'}"></span>
        <div class="kpi-health-bar"><div class="kpi-health-fill" style="width: ${util}%; background: ${util > 85 ? 'var(--red)' : util > 70 ? 'var(--yellow)' : 'var(--green)'}"></div></div>
        <span>${util}%</span>
      </div>
    </div>
    <div class="kpi-card">
      <div class="kpi-header">
        <div class="kpi-icon" style="background: var(--red-light); color: var(--red);"><i class="bi bi-cash-stack"></i></div>
      </div>
      <div class="kpi-value">${formatCr(project.spent)}</div>
      <div class="kpi-label">Current Spending</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-header">
        <div class="kpi-icon" style="background: var(--green-light); color: var(--green);"><i class="bi bi-piggy-bank"></i></div>
      </div>
      <div class="kpi-value">${formatCr(remaining)}</div>
      <div class="kpi-label">Remaining Budget</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-header">
        <div class="kpi-icon" style="background: var(--yellow-light); color: #B06D00;"><i class="bi bi-people"></i></div>
      </div>
      <div class="kpi-value">${project.contractors.length}</div>
      <div class="kpi-label">Contractors</div>
    </div>
  `;

  // ── Financial Breakdown Table ─────────────────────────────
  const breakdownEl = document.getElementById('breakdownTable');
  breakdownEl.innerHTML = `
    <thead>
      <tr>
        <th>Spending Category</th>
        <th>Allocated Budget</th>
        <th>Current Spending</th>
        <th>Remaining</th>
        <th>Utilization</th>
        <th>Variance</th>
        <th>Contractor</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${project.categories.map(c => {
        const v = parseFloat(getVariance(c.budget, c.spent));
        const u = getUtilization(c.budget, c.spent);
        const isOverrun = v > 10;
        const isWarning = v > 0;
        return `
        <tr class="${isOverrun ? 'row-critical' : ''}">
          <td><strong>${c.name}</strong></td>
          <td>${formatCr(c.budget)}</td>
          <td>${formatCr(c.spent)}</td>
          <td>${formatCr(Math.max(0, c.budget - c.spent))}</td>
          <td>
            <div style="display:flex;align-items:center;gap:6px;">
              <div style="flex:1;height:6px;background:var(--bg);border-radius:3px;overflow:hidden;min-width:50px;">
                <div style="height:100%;width:${Math.min(u, 100)}%;background:${isOverrun ? 'var(--red)' : u > 85 ? 'var(--yellow)' : 'var(--green)'};border-radius:3px;"></div>
              </div>
              <span style="font-size:11px;font-weight:600;min-width:32px;">${u}%</span>
            </div>
          </td>
          <td><span style="font-weight:600;color:${isOverrun ? 'var(--red)' : isWarning ? '#B06D00' : 'var(--green)'};">${v > 0 ? '+' : ''}${v}%</span></td>
          <td>${c.contractor}</td>
          <td><span class="status-badge ${isOverrun ? 'flagged' : u > 85 ? 'pending' : 'approved'}">${isOverrun ? 'Overrun' : c.status}</span></td>
        </tr>`;
      }).join('')}
    </tbody>
  `;

  // ── Charts ────────────────────────────────────────────────
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

  const catColors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#A142F4', '#FF6D01'];

  // Budget vs Actual Bar Chart
  const bvaCtx = document.getElementById('budgetVsActualChart');
  if (bvaCtx) {
    new Chart(bvaCtx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: project.categories.map(c => c.name.length > 18 ? c.name.substring(0, 18) + '…' : c.name),
        datasets: [
          {
            label: 'Budget',
            data: project.categories.map(c => (c.budget / 100).toFixed(1)),
            backgroundColor: 'rgba(66,133,244,0.2)',
            borderRadius: 6, borderSkipped: false,
          },
          {
            label: 'Spent',
            data: project.categories.map(c => (c.spent / 100).toFixed(1)),
            backgroundColor: project.categories.map((c, i) => {
              const v = parseFloat(getVariance(c.budget, c.spent));
              return v > 10 ? '#EA4335' : v > 0 ? '#FBBC05' : '#4285F4';
            }),
            borderRadius: 6, borderSkipped: false,
          }
        ]
      },
      options: {
        ...chartDefaults,
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 10 }, color: '#5F6368' } },
          y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#9AA0A6', callback: v => `₹${v}Cr` } }
        }
      }
    });
  }

  // Vendor Distribution Doughnut
  const vendorCtx = document.getElementById('vendorDistChart');
  if (vendorCtx) {
    new Chart(vendorCtx.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: project.categories.map(c => c.contractor),
        datasets: [{
          data: project.categories.map(c => c.spent),
          backgroundColor: catColors.slice(0, project.categories.length),
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

  // Monthly Spending Trend
  const trendCtx = document.getElementById('monthlyTrendChart');
  if (trendCtx) {
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    const ctx = trendCtx.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 260);
    grad.addColorStop(0, `${domain.color}22`);
    grad.addColorStop(1, `${domain.color}02`);

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Monthly Spend',
          data: project.monthlySpend.map(v => (v / 100).toFixed(1)),
          borderColor: domain.color,
          backgroundColor: grad,
          fill: true, borderWidth: 2, tension: 0.4, pointRadius: 3, pointHoverRadius: 5,
        }]
      },
      options: {
        ...chartDefaults,
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#9AA0A6' } },
          y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#9AA0A6', callback: v => `₹${v}Cr` } }
        }
      }
    });
  }

  // ── Project Alerts ────────────────────────────────────────
  const alertsEl = document.getElementById('projectAlerts');
  const projectAlerts = [];

  project.categories.forEach(cat => {
    const v = parseFloat(getVariance(cat.budget, cat.spent));
    if (v > 10) {
      projectAlerts.push({
        severity: 'critical',
        title: `Budget Overrun Detected — ${cat.name}`,
        desc: `Project: ${project.name} | Category: ${cat.name} | Variance: +${v}%`,
        meta: `Contractor: ${cat.contractor} | Budget: ${formatCr(cat.budget)} → Spent: ${formatCr(cat.spent)} | Overspent by ${formatCr(cat.spent - cat.budget)}`
      });
    } else if (v > 0) {
      projectAlerts.push({
        severity: 'warning',
        title: `Spending Near Limit — ${cat.name}`,
        desc: `Project: ${project.name} | Category: ${cat.name} | Variance: +${v}%`,
        meta: `Contractor: ${cat.contractor} | Remaining: ${formatCr(Math.max(0, cat.budget - cat.spent))}`
      });
    }
  });

  if (util > 85) {
    projectAlerts.unshift({
      severity: util > 90 ? 'critical' : 'warning',
      title: `High Budget Utilization — ${project.name}`,
      desc: `Overall project utilization at ${util}% | Agency: ${project.agency}`,
      meta: `Total Budget: ${formatCr(project.budget)} | Spent: ${formatCr(project.spent)} | Remaining: ${formatCr(remaining)}`
    });
  }

  if (projectAlerts.length > 0) {
    alertsEl.innerHTML = `<div class="smart-alerts-list">${projectAlerts.map(a => `
      <div class="smart-alert">
        <div class="smart-alert-severity ${a.severity}"></div>
        <div class="smart-alert-content">
          <div class="smart-alert-title">${a.title}</div>
          <div class="smart-alert-detail">${a.desc}</div>
          <div style="font-size:10.5px;color:var(--text3);margin-top:3px;">${a.meta}</div>
        </div>
        <div class="smart-alert-meta">
          <span class="smart-alert-badge" style="background: ${a.severity === 'critical' ? 'var(--red-light)' : 'var(--yellow-light)'}; color: ${a.severity === 'critical' ? 'var(--red)' : '#B06D00'};">${a.severity === 'critical' ? 'Critical' : 'Warning'}</span>
        </div>
      </div>
    `).join('')}</div>`;
  } else {
    alertsEl.innerHTML = `
      <div class="dash-card" style="text-align: center; padding: 24px; margin-bottom: 24px;">
        <i class="bi bi-check-circle-fill" style="font-size: 24px; color: var(--green); display: block; margin-bottom: 8px;"></i>
        <div style="font-size: 14px; font-weight: 600;">No Alerts</div>
        <div style="font-size: 12px; color: var(--text2);">All spending categories within budget limits.</div>
      </div>
    `;
  }

  // ── Contractors Table ─────────────────────────────────────
  const contractorsEl = document.getElementById('contractorsTable');
  // Aggregate contractor data from categories
  const contractorMap = {};
  project.categories.forEach(c => {
    if (!contractorMap[c.contractor]) {
      contractorMap[c.contractor] = { spent: 0, categories: [] };
    }
    contractorMap[c.contractor].spent += c.spent;
    contractorMap[c.contractor].categories.push(c.name);
  });

  const sortedContractors = Object.entries(contractorMap).sort((a, b) => b[1].spent - a[1].spent);

  contractorsEl.innerHTML = `
    <thead>
      <tr>
        <th>Contractor / Vendor</th>
        <th>Total Spend</th>
        <th>% of Project</th>
        <th>Categories</th>
      </tr>
    </thead>
    <tbody>
      ${sortedContractors.map(([name, data]) => {
        const pct = Math.round(data.spent / project.spent * 100);
        return `
        <tr>
          <td><strong>${name}</strong></td>
          <td>${formatCr(data.spent)}</td>
          <td>
            <div style="display:flex;align-items:center;gap:6px;">
              <div style="flex:1;height:6px;background:var(--bg);border-radius:3px;overflow:hidden;min-width:40px;">
                <div style="height:100%;width:${pct}%;background:${domain.color};border-radius:3px;"></div>
              </div>
              <span style="font-size:11px;font-weight:600;">${pct}%</span>
            </div>
          </td>
          <td>${data.categories.join(', ')}</td>
        </tr>`;
      }).join('')}
    </tbody>
  `;

  // ── Export project CSV ────────────────────────────────────
  window.exportProjectCSV = function() {
    const rows = [['Category', 'Budget (₹L)', 'Spent (₹L)', 'Variance %', 'Contractor', 'Status']];
    project.categories.forEach(c => {
      rows.push([c.name, c.budget, c.spent, getVariance(c.budget, c.spent), c.contractor, c.status]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${project.name.replace(/\s+/g, '_')}_breakdown.csv`;
    a.click();
  };
});
