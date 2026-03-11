/**
 * Dashboard — Hierarchical Financial Monitoring Platform
 * ========================================================
 * Domains → Projects → Financial Breakdown → Alerts
 */

// ══════════════════════════════════════════════════════════════
// PLATFORM DATA MODEL
// ══════════════════════════════════════════════════════════════

const PLATFORM_DATA = {
  domains: [
    {
      id: 'infra',
      name: 'Infrastructure Development',
      icon: 'bi-buildings',
      color: '#4285F4',
      colorLight: 'var(--blue-light)',
      projects: [
        {
          id: 'aerospace-park',
          name: 'Chennai Aerospace Park Phase 1',
          agency: 'TIDCO',
          budget: 50000,  // in lakhs (₹500 Cr)
          spent: 38500,
          timeline: 'Apr 2024 — Mar 2027',
          status: 'In Progress',
          contractors: ['L&T Infra', 'Afcons Infrastructure', 'Shapoorji Pallonji', 'KEC International', 'Sterling & Wilson'],
          monthlySpend: [2800, 3100, 3400, 3200, 3600, 3500, 3100, 3400, 3200, 3700, 3500, 3000],
          categories: [
            { name: 'Land Acquisition', budget: 12000, spent: 11400, contractor: 'TIDCO (Direct)', status: 'On Track' },
            { name: 'Earthworks Contracting', budget: 8000, spent: 9200, contractor: 'L&T Infra', status: 'Overrun' },
            { name: 'Phase 1 Sub-contractors', budget: 10000, spent: 7200, contractor: 'Afcons Infrastructure', status: 'On Track' },
            { name: 'Raw Material Procurement', budget: 9000, spent: 5100, contractor: 'Shapoorji Pallonji', status: 'On Track' },
            { name: 'Logistics & Transport', budget: 5500, spent: 3200, contractor: 'KEC International', status: 'On Track' },
            { name: 'Consultancy & Design', budget: 5500, spent: 2400, contractor: 'Sterling & Wilson', status: 'On Track' }
          ]
        },
        {
          id: 'port-logistics',
          name: 'Chennai Port Logistics Expansion',
          agency: 'Chennai Port Authority',
          budget: 32000,
          spent: 24800,
          timeline: 'Jan 2025 — Dec 2027',
          status: 'In Progress',
          contractors: ['L&T Infra', 'Adani Ports', 'J Kumar Infra', 'Kalpataru Projects'],
          monthlySpend: [1800, 2100, 2200, 2000, 2300, 2100, 1900, 2200, 2100, 2400, 2200, 2000],
          categories: [
            { name: 'Port Infrastructure', budget: 10000, spent: 8200, contractor: 'L&T Infra', status: 'On Track' },
            { name: 'Cargo Handling Systems', budget: 7000, spent: 5600, contractor: 'Adani Ports', status: 'On Track' },
            { name: 'Road Connectivity', budget: 6000, spent: 5100, contractor: 'J Kumar Infra', status: 'On Track' },
            { name: 'Warehousing', budget: 5000, spent: 3200, contractor: 'Kalpataru Projects', status: 'On Track' },
            { name: 'Environmental Compliance', budget: 4000, spent: 2700, contractor: 'EPC Consultants', status: 'On Track' }
          ]
        },
        {
          id: 'smart-mfg',
          name: 'Coimbatore Smart Manufacturing Hub',
          agency: 'SIPCOT',
          budget: 28000,
          spent: 14200,
          timeline: 'Jul 2025 — Jun 2028',
          status: 'Early Stage',
          contractors: ['Tata Projects', 'Godrej & Boyce', 'BHEL', 'Kirloskar'],
          monthlySpend: [800, 1000, 1200, 1100, 1300, 1200, 1400, 1300, 1500, 1400, 1600, 1400],
          categories: [
            { name: 'Land Development', budget: 7000, spent: 4200, contractor: 'SIPCOT (Direct)', status: 'On Track' },
            { name: 'Factory Shell Construction', budget: 8000, spent: 3800, contractor: 'Tata Projects', status: 'On Track' },
            { name: 'Power & Utilities', budget: 5000, spent: 2800, contractor: 'BHEL', status: 'On Track' },
            { name: 'Smart Systems Integration', budget: 4500, spent: 2100, contractor: 'Godrej & Boyce', status: 'On Track' },
            { name: 'Consultancy', budget: 3500, spent: 1300, contractor: 'Kirloskar', status: 'On Track' }
          ]
        }
      ]
    },
    {
      id: 'defense',
      name: 'Defense Manufacturing',
      icon: 'bi-shield-shaded',
      color: '#34A853',
      colorLight: 'var(--green-light)',
      projects: [
        {
          id: 'hosur-defense',
          name: 'Hosur Defense Corridor',
          agency: 'TIDCO',
          budget: 45000,
          spent: 28900,
          timeline: 'Jan 2024 — Dec 2027',
          status: 'In Progress',
          contractors: ['BEL', 'HAL', 'BEML', 'Ordnance Factory Board', 'Bharat Dynamics'],
          monthlySpend: [2000, 2200, 2400, 2300, 2500, 2400, 2600, 2500, 2700, 2600, 2800, 2600],
          categories: [
            { name: 'Land & Site Preparation', budget: 10000, spent: 8500, contractor: 'TIDCO (Direct)', status: 'On Track' },
            { name: 'Defense Testing Facility', budget: 12000, spent: 7800, contractor: 'BEL', status: 'On Track' },
            { name: 'Manufacturing Units', budget: 10000, spent: 6200, contractor: 'HAL', status: 'On Track' },
            { name: 'Security Infrastructure', budget: 7000, spent: 3800, contractor: 'BEML', status: 'On Track' },
            { name: 'R&D Labs', budget: 6000, spent: 2600, contractor: 'Bharat Dynamics', status: 'On Track' }
          ]
        },
        {
          id: 'trichy-aerospace',
          name: 'Trichy Aerospace Components Cluster',
          agency: 'SIPCOT',
          budget: 22000,
          spent: 11800,
          timeline: 'Jun 2025 — May 2028',
          status: 'Early Stage',
          contractors: ['HAL', 'Dynamatic Technologies', 'TANEJA Aerospace', 'Aequs'],
          monthlySpend: [600, 800, 900, 850, 1000, 950, 1100, 1050, 1200, 1100, 1300, 1150],
          categories: [
            { name: 'Industrial Park Development', budget: 6000, spent: 3800, contractor: 'SIPCOT (Direct)', status: 'On Track' },
            { name: 'Component Assembly Lines', budget: 7000, spent: 3200, contractor: 'HAL', status: 'On Track' },
            { name: 'Testing & Calibration Centre', budget: 4500, spent: 2400, contractor: 'Dynamatic Technologies', status: 'On Track' },
            { name: 'Supply Chain Hub', budget: 4500, spent: 2400, contractor: 'Aequs', status: 'On Track' }
          ]
        }
      ]
    },
    {
      id: 'digital',
      name: 'Digital Economy',
      icon: 'bi-cpu',
      color: '#FBBC05',
      colorLight: 'var(--yellow-light)',
      projects: [
        {
          id: 'fintech-city',
          name: 'TIDCO FinTech City',
          agency: 'TIDCO',
          budget: 35000,
          spent: 22400,
          timeline: 'Mar 2024 — Feb 2027',
          status: 'In Progress',
          contractors: ['ELCOT', 'TCS', 'Infosys', 'Wipro', 'HCL Technologies'],
          monthlySpend: [1500, 1700, 1900, 1800, 2000, 1900, 2100, 2000, 2200, 2100, 2300, 2100],
          categories: [
            { name: 'IT Infrastructure', budget: 10000, spent: 7200, contractor: 'ELCOT', status: 'On Track' },
            { name: 'Campus Construction', budget: 9000, spent: 6800, contractor: 'L&T Infra', status: 'On Track' },
            { name: 'Network & Connectivity', budget: 6000, spent: 3900, contractor: 'TCS', status: 'On Track' },
            { name: 'Smart Building Systems', budget: 5500, spent: 2800, contractor: 'Wipro', status: 'On Track' },
            { name: 'Innovation Labs Setup', budget: 4500, spent: 1700, contractor: 'Infosys', status: 'On Track' }
          ]
        },
        {
          id: 'ai-hub',
          name: 'Chennai AI Innovation Hub',
          agency: 'ELCOT',
          budget: 18000,
          spent: 8600,
          timeline: 'Sep 2025 — Aug 2028',
          status: 'Early Stage',
          contractors: ['ELCOT', 'Zoho Corp', 'Freshworks', 'IIT Madras Research Park'],
          monthlySpend: [400, 500, 600, 650, 700, 750, 800, 750, 850, 800, 900, 850],
          categories: [
            { name: 'Research Infrastructure', budget: 5000, spent: 2800, contractor: 'IIT Madras Research Park', status: 'On Track' },
            { name: 'Computing Hardware', budget: 5000, spent: 2400, contractor: 'ELCOT', status: 'On Track' },
            { name: 'Software Platforms', budget: 4000, spent: 1800, contractor: 'Zoho Corp', status: 'On Track' },
            { name: 'Talent Development', budget: 4000, spent: 1600, contractor: 'Freshworks', status: 'On Track' }
          ]
        }
      ]
    },
    {
      id: 'urban',
      name: 'Urban Development',
      icon: 'bi-building',
      color: '#EA4335',
      colorLight: 'var(--red-light)',
      projects: [
        {
          id: 'cmrl-phase2',
          name: 'CMRL Phase-II Extension',
          agency: 'Chennai Metro Rail Ltd',
          budget: 61000,
          spent: 42100,
          timeline: 'Jan 2023 — Dec 2026',
          status: 'In Progress',
          contractors: ['L&T Infra', 'Afcons Infrastructure', 'ITD Cementation', 'Alstom', 'BHEL'],
          monthlySpend: [3200, 3500, 3700, 3400, 3800, 3600, 3900, 3700, 4000, 3800, 4100, 3900],
          categories: [
            { name: 'Tunnel Construction', budget: 20000, spent: 15200, contractor: 'Afcons Infrastructure', status: 'On Track' },
            { name: 'Station Infrastructure', budget: 15000, spent: 10800, contractor: 'L&T Infra', status: 'On Track' },
            { name: 'Rolling Stock', budget: 12000, spent: 8400, contractor: 'Alstom', status: 'On Track' },
            { name: 'Signalling & Telecom', budget: 7000, spent: 4200, contractor: 'BHEL', status: 'On Track' },
            { name: 'Land Acquisition', budget: 7000, spent: 3500, contractor: 'CMRL (Direct)', status: 'On Track' }
          ]
        },
        {
          id: 'smart-city',
          name: 'Madurai Smart City Mission',
          agency: 'Smart City SPV',
          budget: 24000,
          spent: 15600,
          timeline: 'Apr 2024 — Mar 2027',
          status: 'In Progress',
          contractors: ['Tata Projects', 'NCC Ltd', 'Voltas', 'Schneider Electric'],
          monthlySpend: [1000, 1100, 1200, 1300, 1400, 1300, 1500, 1400, 1600, 1500, 1700, 1600],
          categories: [
            { name: 'Road & Infrastructure', budget: 8000, spent: 5400, contractor: 'Tata Projects', status: 'On Track' },
            { name: 'Water & Sewage', budget: 6000, spent: 4200, contractor: 'NCC Ltd', status: 'On Track' },
            { name: 'Smart Systems & IoT', budget: 5000, spent: 3100, contractor: 'Schneider Electric', status: 'On Track' },
            { name: 'Public Amenities', budget: 5000, spent: 2900, contractor: 'Voltas', status: 'On Track' }
          ]
        }
      ]
    },
    {
      id: 'logistics',
      name: 'Logistics & Ports',
      icon: 'bi-truck',
      color: '#A142F4',
      colorLight: '#F3E8FF',
      projects: [
        {
          id: 'industrial-corridor',
          name: 'Chennai–Salem Industrial Corridor',
          agency: 'NHAI / TN Highways',
          budget: 38000,
          spent: 26200,
          timeline: 'Jun 2023 — May 2027',
          status: 'In Progress',
          contractors: ['L&T Infra', 'Dilip Buildcon', 'Ashoka Buildcon', 'IRB Infrastructure'],
          monthlySpend: [1800, 2000, 2200, 2100, 2300, 2200, 2400, 2300, 2500, 2400, 2600, 2400],
          categories: [
            { name: 'Highway Construction', budget: 14000, spent: 10200, contractor: 'L&T Infra', status: 'On Track' },
            { name: 'Interchange & Flyovers', budget: 9000, spent: 6800, contractor: 'Dilip Buildcon', status: 'On Track' },
            { name: 'Utilities & Services', budget: 7000, spent: 4500, contractor: 'Ashoka Buildcon', status: 'On Track' },
            { name: 'Land Acquisition', budget: 5000, spent: 3200, contractor: 'TN Highways (Direct)', status: 'On Track' },
            { name: 'Toll Systems', budget: 3000, spent: 1500, contractor: 'IRB Infrastructure', status: 'On Track' }
          ]
        },
        {
          id: 'logistics-park',
          name: 'Ennore Multi-Modal Logistics Park',
          agency: 'Kamarajar Port Ltd',
          budget: 21000,
          spent: 12400,
          timeline: 'Oct 2024 — Sep 2027',
          status: 'In Progress',
          contractors: ['Adani Ports', 'J Kumar Infra', 'CONCOR', 'Container Corp'],
          monthlySpend: [700, 800, 900, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350, 1300],
          categories: [
            { name: 'Terminal Construction', budget: 7000, spent: 4200, contractor: 'Adani Ports', status: 'On Track' },
            { name: 'Rail Connectivity', budget: 5000, spent: 3100, contractor: 'CONCOR', status: 'On Track' },
            { name: 'Warehousing Facilities', budget: 4500, spent: 2600, contractor: 'J Kumar Infra', status: 'On Track' },
            { name: 'IT & Tracking Systems', budget: 4500, spent: 2500, contractor: 'Container Corp', status: 'On Track' }
          ]
        }
      ]
    }
  ]
};

// ── Utility Functions ──────────────────────────────────────────
function formatCr(lakhs) {
  if (lakhs >= 10000) return '₹' + (lakhs / 100).toFixed(0) + ' Cr';
  if (lakhs >= 100) return '₹' + (lakhs / 100).toFixed(1) + ' Cr';
  return '₹' + lakhs + ' L';
}

function formatCrNum(lakhs) {
  if (lakhs >= 100) return (lakhs / 100).toFixed(1);
  return lakhs.toString();
}

function getVariance(budget, spent) {
  return ((spent - budget) / budget * 100).toFixed(1);
}

function getUtilization(budget, spent) {
  return Math.round(spent / budget * 100);
}

function getAllProjects() {
  const projects = [];
  PLATFORM_DATA.domains.forEach(d => {
    d.projects.forEach(p => {
      projects.push({ ...p, domainName: d.name, domainId: d.id, domainColor: d.color });
    });
  });
  return projects;
}

function generateAlerts() {
  const alerts = [];
  PLATFORM_DATA.domains.forEach(domain => {
    domain.projects.forEach(project => {
      project.categories.forEach(cat => {
        const variance = parseFloat(getVariance(cat.budget, cat.spent));
        if (variance > 10) {
          alerts.push({
            severity: 'critical',
            title: `Budget Overrun — ${cat.name}`,
            detail: `${domain.name} → ${project.name} → ${cat.name}`,
            meta: `Variance: +${variance}% | Contractor: ${cat.contractor} | Budget: ${formatCr(cat.budget)} → Spent: ${formatCr(cat.spent)}`,
            project: project.name,
            domain: domain.name,
            variance
          });
        } else if (variance > 0) {
          alerts.push({
            severity: 'warning',
            title: `Spending Near Limit — ${cat.name}`,
            detail: `${domain.name} → ${project.name} → ${cat.name}`,
            meta: `Variance: +${variance}% | Contractor: ${cat.contractor}`,
            project: project.name,
            domain: domain.name,
            variance
          });
        }
      });
      // Project-level utilization alert
      const util = getUtilization(project.budget, project.spent);
      if (util > 85) {
        alerts.push({
          severity: util > 90 ? 'critical' : 'warning',
          title: `High Budget Utilization — ${project.name}`,
          detail: `${domain.name} → ${project.name}`,
          meta: `Utilization: ${util}% | Agency: ${project.agency} | Remaining: ${formatCr(project.budget - project.spent)}`,
          project: project.name,
          domain: domain.name,
          variance: util
        });
      }
    });
  });
  alerts.sort((a, b) => b.variance - a.variance);
  return alerts;
}

// ══════════════════════════════════════════════════════════════
// DASHBOARD RENDERING
// ══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

  // ── Sidebar mobile toggle ─────────────────────────────────
  const menuBtn = document.getElementById('dashMenuBtn');
  const sidebar = document.getElementById('sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  // ── Render Executive Summary ──────────────────────────────
  const execContainer = document.getElementById('execSummary');
  if (execContainer) {
    const totalBudget = PLATFORM_DATA.domains.reduce((s, d) => s + d.projects.reduce((s2, p) => s2 + p.budget, 0), 0);
    const totalSpent = PLATFORM_DATA.domains.reduce((s, d) => s + d.projects.reduce((s2, p) => s2 + p.spent, 0), 0);
    const totalProjects = PLATFORM_DATA.domains.reduce((s, d) => s + d.projects.length, 0);
    const alerts = generateAlerts().filter(a => a.severity === 'critical');
    const util = getUtilization(totalBudget, totalSpent);

    execContainer.innerHTML = `
      <div class="exec-card blue">
        <div class="exec-label">Total Government Budget</div>
        <div class="exec-value" style="color: var(--blue);">${formatCr(totalBudget)}</div>
        <div class="exec-sub"><span class="health-dot ${util > 85 ? 'critical' : util > 70 ? 'warning' : 'healthy'}"></span> FY 2025-26</div>
      </div>
      <div class="exec-card red">
        <div class="exec-label">Total Spending</div>
        <div class="exec-value" style="color: var(--red);">${formatCr(totalSpent)}</div>
        <div class="exec-sub"><i class="bi bi-arrow-up-short" style="color: var(--red);"></i> ${util}% utilized</div>
      </div>
      <div class="exec-card yellow">
        <div class="exec-label">Active Domains / Projects</div>
        <div class="exec-value">${PLATFORM_DATA.domains.length} / ${totalProjects}</div>
        <div class="exec-sub"><span class="health-dot healthy"></span> All active</div>
      </div>
      <div class="exec-card green">
        <div class="exec-label">Remaining Budget</div>
        <div class="exec-value" style="color: var(--green);">${formatCr(totalBudget - totalSpent)}</div>
        <div class="exec-sub"><i class="bi bi-shield-check" style="color: var(--green);"></i> ${100 - util}% available</div>
      </div>
    `;
  }

  // ── Render Domain Cards ───────────────────────────────────
  const domainGrid = document.getElementById('domainGrid');
  if (domainGrid) {
    PLATFORM_DATA.domains.forEach(domain => {
      const budget = domain.projects.reduce((s, p) => s + p.budget, 0);
      const spent = domain.projects.reduce((s, p) => s + p.spent, 0);
      const util = getUtilization(budget, spent);
      const card = document.createElement('div');
      card.className = 'domain-card';
      card.setAttribute('data-domain', domain.id);
      card.style.setProperty('--domain-color', domain.color);
      card.innerHTML = `
        <div class="domain-card-top" style="background: ${domain.color};">
          <i class="bi ${domain.icon}"></i>
        </div>
        <div class="domain-card-body">
          <div class="domain-card-name">${domain.name}</div>
          <div class="domain-card-stats">
            <div class="domain-stat">
              <div class="domain-stat-value">${formatCr(budget)}</div>
              <div class="domain-stat-label">Budget</div>
            </div>
            <div class="domain-stat">
              <div class="domain-stat-value">${formatCr(spent)}</div>
              <div class="domain-stat-label">Spent</div>
            </div>
            <div class="domain-stat">
              <div class="domain-stat-value">${domain.projects.length}</div>
              <div class="domain-stat-label">Projects</div>
            </div>
          </div>
          <div class="domain-util-bar">
            <div class="domain-util-fill" style="width: ${util}%; background: ${util > 85 ? 'var(--red)' : util > 70 ? 'var(--yellow)' : 'var(--green)'}"></div>
          </div>
          <div class="domain-util-text">
            <span>${util}% utilized</span>
            <span>${formatCr(budget - spent)} remaining</span>
          </div>
        </div>
        <div class="domain-card-action">
          <span>View Projects</span> <i class="bi bi-chevron-right"></i>
        </div>
      `;
      card.addEventListener('click', () => expandDomain(domain.id));
      domainGrid.appendChild(card);
    });
  }

  // ── Domain Expansion ──────────────────────────────────────
  window.expandDomain = function (domainId) {
    const panel = document.getElementById('projectPanel');
    const domain = PLATFORM_DATA.domains.find(d => d.id === domainId);
    if (!panel || !domain) return;

    // Toggle active state on cards
    document.querySelectorAll('.domain-card').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-domain') === domainId);
    });

    const budget = domain.projects.reduce((s, p) => s + p.budget, 0);
    const spent = domain.projects.reduce((s, p) => s + p.spent, 0);

    panel.innerHTML = `
      <div class="project-panel-header">
        <div>
          <div class="project-panel-title"><i class="bi ${domain.icon}" style="color: ${domain.color};"></i> ${domain.name}</div>
          <div class="project-panel-sub">${domain.projects.length} active projects — ${formatCr(budget)} total budget — ${formatCr(spent)} spent</div>
        </div>
        <button class="btn-secondary" onclick="document.getElementById('projectPanel').innerHTML=''; document.querySelectorAll('.domain-card').forEach(c=>c.classList.remove('active'));"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="project-list">
        ${domain.projects.map(p => {
      const util = getUtilization(p.budget, p.spent);
      const overrunCats = p.categories.filter(c => parseFloat(getVariance(c.budget, c.spent)) > 10);
      return `
          <div class="project-row" onclick="window.location.href='project.html?id=${p.id}'">
            <div class="project-row-main">
              <div class="project-row-name">${p.name}</div>
              <div class="project-row-agency"><i class="bi bi-building"></i> ${p.agency}</div>
            </div>
            <div class="project-row-stats">
              <div class="project-row-stat">
                <div class="project-row-stat-value">${formatCr(p.budget)}</div>
                <div class="project-row-stat-label">Budget</div>
              </div>
              <div class="project-row-stat">
                <div class="project-row-stat-value">${formatCr(p.spent)}</div>
                <div class="project-row-stat-label">Spent</div>
              </div>
              <div class="project-row-stat">
                <div class="project-row-stat-value">${util}%</div>
                <div class="project-row-stat-label">Used</div>
              </div>
            </div>
            <div class="project-row-bar">
              <div class="project-row-bar-fill" style="width: ${util}%; background: ${util > 85 ? 'var(--red)' : util > 70 ? 'var(--yellow)' : domain.color}"></div>
            </div>
            <div class="project-row-footer">
              <div>
                <span class="status-badge ${p.status === 'In Progress' ? 'active' : 'pending'}">${p.status}</span>
                ${overrunCats.length > 0 ? `<span class="status-badge flagged"><i class="bi bi-exclamation-triangle"></i> ${overrunCats.length} overrun${overrunCats.length > 1 ? 's' : ''}</span>` : ''}
              </div>
              <span class="project-row-timeline"><i class="bi bi-calendar3"></i> ${p.timeline}</span>
            </div>
          </div>`;
    }).join('')}
      </div>
    `;
    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Render Alerts ─────────────────────────────────────────
  const alertsContainer = document.getElementById('alertsPanel');
  if (alertsContainer) {
    const alerts = generateAlerts();
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').slice(0, 5);
    const warningAlerts = alerts.filter(a => a.severity === 'warning').slice(0, 3);
    const displayAlerts = [...criticalAlerts, ...warningAlerts];

    alertsContainer.innerHTML = displayAlerts.map(alert => `
      <div class="smart-alert">
        <div class="smart-alert-severity ${alert.severity}"></div>
        <div class="smart-alert-content">
          <div class="smart-alert-title">${alert.title}</div>
          <div class="smart-alert-detail">${alert.detail}</div>
          <div style="font-size:10.5px;color:var(--text3);margin-top:3px;">${alert.meta}</div>
        </div>
        <div class="smart-alert-meta">
          <span class="smart-alert-badge" style="background: ${alert.severity === 'critical' ? 'var(--red-light)' : 'var(--yellow-light)'}; color: ${alert.severity === 'critical' ? 'var(--red)' : '#B06D00'};">${alert.severity === 'critical' ? 'Critical' : 'Warning'}</span>
        </div>
      </div>
    `).join('');
  }

  // ── Charts ────────────────────────────────────────────────
  const chartColors = {
    blue: '#4285F4', green: '#34A853',
    yellow: '#FBBC05', red: '#EA4335',
    purple: '#A142F4',
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

  // Domain Distribution Doughnut
  const domainDistCtx = document.getElementById('domainDistChart');
  if (domainDistCtx) {
    const colors = PLATFORM_DATA.domains.map(d => d.color);
    new Chart(domainDistCtx.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: PLATFORM_DATA.domains.map(d => d.name),
        datasets: [{
          data: PLATFORM_DATA.domains.map(d => d.projects.reduce((s, p) => s + p.spent, 0)),
          backgroundColor: colors,
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

  // Top Projects Bar Chart
  const topProjectsCtx = document.getElementById('topProjectsChart');
  if (topProjectsCtx) {
    const allProjects = getAllProjects().sort((a, b) => b.spent - a.spent).slice(0, 6);
    new Chart(topProjectsCtx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: allProjects.map(p => p.name.length > 25 ? p.name.substring(0, 25) + '…' : p.name),
        datasets: [{
          label: 'Spending (₹Cr)',
          data: allProjects.map(p => (p.spent / 100).toFixed(0)),
          backgroundColor: allProjects.map(p => p.domainColor),
          borderRadius: 6, borderSkipped: false,
        }]
      },
      options: {
        ...chartDefaults,
        indexAxis: 'y',
        plugins: { ...chartDefaults.plugins, legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#9AA0A6', callback: v => `₹${v}Cr` } },
          y: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 10 }, color: '#5F6368' } }
        }
      }
    });
  }

  // Monthly Spending Trend
  const trendCtx = document.getElementById('spendTrendChart');
  if (trendCtx) {
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    // Aggregate monthly spend across all projects
    const monthlyTotals = months.map((_, i) => {
      return PLATFORM_DATA.domains.reduce((sum, d) =>
        sum + d.projects.reduce((s2, p) => s2 + (p.monthlySpend[i] || 0), 0), 0);
    });

    const ctx = trendCtx.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 260);
    grad.addColorStop(0, 'rgba(66,133,244,0.15)');
    grad.addColorStop(1, 'rgba(66,133,244,0.01)');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Total Monthly Spend',
          data: monthlyTotals.map(v => (v / 100).toFixed(0)),
          borderColor: chartColors.blue, backgroundColor: grad,
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

  // ── Policy Toggles ────────────────────────────────────────
  document.querySelectorAll('.policy-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => toggle.classList.toggle('active'));
  });

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

  // ── Department / Vendor Charts (for dept/vendor pages) ────
  const deptSpendCtx = document.getElementById('deptSpendChart');
  if (deptSpendCtx) {
    new Chart(deptSpendCtx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Highways Dept', 'TNEB', 'TIDCO', 'Chennai Metro Rail'],
        datasets: [
          { label: 'Budget', data: [500, 300, 200, 250], backgroundColor: 'rgba(66,133,244,0.2)', borderRadius: 6, borderSkipped: false },
          { label: 'Spent', data: [420, 280, 150, 230], backgroundColor: '#4285F4', borderRadius: 6, borderSkipped: false }
        ]
      },
      options: {
        ...chartDefaults,
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 }, color: '#5F6368' } },
          y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#9AA0A6', callback: v => `₹${v}L` } }
        }
      }
    });
  }

  const vendorTrendCtx = document.getElementById('vendorTrendChart');
  if (vendorTrendCtx) {
    new Chart(vendorTrendCtx.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
        datasets: [
          { label: 'L&T Infra', data: [18, 22, 20, 25, 21, 24], borderColor: '#FF9900', borderWidth: 2, tension: 0.4, pointRadius: 3 },
          { label: 'BHEL', data: [12, 14, 16, 13, 15, 17], borderColor: '#00A4EF', borderWidth: 2, tension: 0.4, pointRadius: 3 },
          { label: 'ELCOT', data: [10, 11, 13, 12, 14, 15], borderColor: '#4285F4', borderWidth: 2, tension: 0.4, pointRadius: 3 },
          { label: 'Local Contractor XYZ', data: [5, 8, 6, 9, 7, 10], borderColor: '#007DB8', borderWidth: 2, tension: 0.4, pointRadius: 3 },
        ]
      },
      options: {
        ...chartDefaults,
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#9AA0A6' } },
          y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#9AA0A6', callback: v => `₹${v}L` } }
        }
      }
    });
  }
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
  const rows = [['Domain', 'Project', 'Agency', 'Category', 'Budget (₹L)', 'Spent (₹L)', 'Variance %', 'Contractor']];
  PLATFORM_DATA.domains.forEach(d => {
    d.projects.forEach(p => {
      p.categories.forEach(c => {
        rows.push([d.name, p.name, p.agency, c.name, c.budget, c.spent, getVariance(c.budget, c.spent), c.contractor]);
      });
    });
  });
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'finops_hierarchical_report.csv';
  a.click();
}

// ── Report Export ────────────────────────────────────────────
function exportReport(type) {
  const reports = {
    department: [
      ['Department', 'Budget', 'Spent', 'Utilization'],
      ['Highways Dept', '5000000', '4200000', '84%'],
      ['TNEB', '3000000', '2800000', '93%'],
      ['TIDCO', '2000000', '1500000', '75%'],
      ['Chennai Metro Rail', '2500000', '2300000', '92%'],
    ],
    vendor: [
      ['Vendor', 'Total Spend', 'Transactions', 'Departments'],
      ['L&T Infra', '1200000', '45', 'Highways Dept, TN Transport Corp'],
      ['BHEL', '850000', '32', 'Highways Dept, Chennai Metro Rail'],
      ['ELCOT', '680000', '28', 'Highways Dept, TNEB'],
      ['Local Contractor XYZ', '450000', '12', 'Chennai Metro Rail, TIDCO'],
    ],
    budget: [
      ['Department', 'Budget', 'Spent', 'Remaining', 'Status'],
      ['Highways Dept', '5000000', '4200000', '800000', 'On Track'],
      ['TNEB', '3000000', '2800000', '200000', 'At Risk'],
      ['TIDCO', '2000000', '1500000', '500000', 'On Track'],
      ['Chennai Metro Rail', '2500000', '2300000', '200000', 'At Risk'],
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
