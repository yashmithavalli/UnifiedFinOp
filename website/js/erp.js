/**
 * ERP Integration Hub — JavaScript
 * ==================================
 * Live feed simulation, sync animations, charts, and modal logic
 */

// ── Simulated Transaction Feed Data ─────────────────────────
const feedData = {
  sap: {
    vendors: ['L&T Infra', 'Afcons Infrastructure', 'Shapoorji Pallonji', 'KEC International', 'BEL', 'HAL'],
    projects: ['Chennai Aerospace Park', 'CMRL Phase-II', 'Hosur Defense Corridor', 'Chennai–Salem Corridor'],
    categories: ['Purchase Order', 'Invoice', 'GL Posting', 'Payment'],
  },
  oracle: {
    vendors: ['BHEL', 'Tata Projects', 'Adani Ports', 'Alstom', 'ELCOT', 'TCS'],
    projects: ['Power Grid Upgrade', 'Madurai Smart City', 'FinTech City', 'Ennore Logistics Park'],
    categories: ['Budget Transfer', 'Invoice', 'Journal Entry', 'AP Payment'],
  },
  netsuite: {
    vendors: ['Wipro', 'Infosys', 'Zoho Corp', 'Schneider Electric', 'Godrej & Boyce', 'Kirloskar'],
    projects: ['AI Innovation Hub', 'Smart Manufacturing Hub', 'Trichy Aerospace Cluster'],
    categories: ['Expense Report', 'Vendor Bill', 'Purchase Receipt', 'Credit Memo'],
  }
};

const sources = ['sap', 'oracle', 'netsuite'];
let feedRunning = true;
let feedInterval = null;

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAmount() {
  const base = Math.floor(Math.random() * 2000) + 50;
  return base * 100; // lakhs-like
}

function formatINR(num) {
  return '₹' + num.toLocaleString('en-IN');
}

function timeAgo() {
  const secs = Math.floor(Math.random() * 300);
  if (secs < 60) return `${secs}s ago`;
  return `${Math.floor(secs / 60)}m ago`;
}

function generateFeedItem() {
  const src = randomItem(sources);
  const data = feedData[src];
  const vendor = randomItem(data.vendors);
  const project = randomItem(data.projects);
  const category = randomItem(data.categories);
  const amount = randomAmount();

  return {
    source: src,
    text: `<strong>${category}</strong> — ${vendor} → ${project}`,
    amount: formatINR(amount),
    time: timeAgo()
  };
}

function addFeedItem() {
  const feed = document.getElementById('liveFeed');
  if (!feed) return;

  const item = generateFeedItem();
  const el = document.createElement('div');
  el.className = 'feed-item';
  el.innerHTML = `
    <span class="feed-source ${item.source}">${item.source.toUpperCase()}</span>
    <span class="feed-text">${item.text}</span>
    <span class="feed-amount">${item.amount}</span>
    <span class="feed-time">${item.time}</span>
  `;

  feed.insertBefore(el, feed.firstChild);

  // Keep max 25 items
  while (feed.children.length > 25) {
    feed.removeChild(feed.lastChild);
  }
}

function toggleFeed() {
  feedRunning = !feedRunning;
  const btn = document.getElementById('feedToggle');
  const badge = document.getElementById('feedBadge');
  if (feedRunning) {
    btn.innerHTML = '<i class="bi bi-pause"></i> Pause';
    badge.innerHTML = '<i class="bi bi-broadcast"></i> STREAMING';
    badge.style.background = '';
    badge.style.color = '';
    startFeed();
  } else {
    btn.innerHTML = '<i class="bi bi-play"></i> Resume';
    badge.innerHTML = '<i class="bi bi-pause-circle"></i> PAUSED';
    badge.style.background = 'var(--yellow-light)';
    badge.style.color = '#B06D00';
    if (feedInterval) clearInterval(feedInterval);
  }
}

function startFeed() {
  if (feedInterval) clearInterval(feedInterval);
  feedInterval = setInterval(() => {
    if (feedRunning) addFeedItem();
  }, 2500);
}

// ── Sync Simulation ─────────────────────────────────────────
function simulateSync(system) {
  const statusEl = document.getElementById(`${system}-status`);
  const connector = document.getElementById(`connector-${system}`);
  if (!statusEl) return;

  // Phase 1: Syncing
  statusEl.innerHTML = '<span class="erp-status-dot syncing"></span> Syncing...';
  connector.style.borderColor = 'var(--blue)';

  const steps = ['Connecting...', 'Fetching records...', 'Validating data...', 'Mapping fields...', 'Importing...'];
  let step = 0;

  const stepInterval = setInterval(() => {
    step++;
    if (step < steps.length) {
      statusEl.innerHTML = `<span class="erp-status-dot syncing"></span> ${steps[step]}`;
    } else {
      clearInterval(stepInterval);
      // Phase 2: Done
      const records = Math.floor(Math.random() * 200) + 200;
      statusEl.innerHTML = '<span class="erp-status-dot connected"></span> Connected';
      connector.style.borderColor = '';

      // Show success toast
      showToast(`${system.toUpperCase()} sync complete — ${records} records imported`, 'success');

      // Add some feed items
      for (let i = 0; i < 3; i++) {
        setTimeout(() => addFeedItem(), i * 400);
      }
    }
  }, 800);
}

// ── Toast Notification ──────────────────────────────────────
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 14px 20px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    font-family: Inter, sans-serif;
    z-index: 2000;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: feed-in 0.4s ease;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    ${type === 'success'
      ? 'background: #34A853; color: #fff;'
      : 'background: #4285F4; color: #fff;'
    }
  `;
  toast.innerHTML = `<i class="bi bi-check-circle-fill"></i> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── Config Modal ────────────────────────────────────────────
const modalEndpoints = {
  sap: 'https://sap-s4hana.tn.gov.in/api/odata/v4',
  oracle: 'https://oracle-fin.tn.gov.in/fscmRestApi/resources/v2',
  netsuite: 'https://netsuite.tn.gov.in/rest/v1/record',
  new: ''
};

const modalTitles = {
  sap: 'Configure SAP S/4HANA',
  oracle: 'Configure Oracle Financials',
  netsuite: 'Configure Oracle NetSuite',
  new: 'Add New ERP Connector'
};

function openConfigModal(system) {
  const modal = document.getElementById('configModal');
  document.getElementById('modalTitle').textContent = modalTitles[system] || 'Configure Connection';
  document.getElementById('modalSub').textContent = system === 'new'
    ? 'Set up a new enterprise system connection'
    : `Update connection parameters for ${system.toUpperCase()}`;
  document.getElementById('modalEndpoint').value = modalEndpoints[system] || '';
  document.getElementById('modalToken').value = system !== 'new' ? 'Bearer tn-gov-xxxx-xxxx-xxxx' : '';
  modal.classList.add('open');
}

function closeConfigModal() {
  document.getElementById('configModal').classList.remove('open');
}

function saveConfig() {
  closeConfigModal();
  showToast('Configuration saved successfully', 'success');
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.id === 'configModal') closeConfigModal();
});

// ── Charts ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Sidebar mobile toggle
  const menuBtn = document.getElementById('dashMenuBtn');
  const sidebar = document.getElementById('sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

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

  // Sync Volume Trend
  const syncCtx = document.getElementById('syncVolumeChart');
  if (syncCtx) {
    const ctx = syncCtx.getContext('2d');
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
    }

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [
          {
            label: 'SAP',
            data: [320, 340, 310, 360, 380, 350, 370, 390, 340, 410, 380, 360, 400, 342],
            backgroundColor: '#0053B4',
            borderRadius: 4, borderSkipped: false,
          },
          {
            label: 'Oracle',
            data: [280, 300, 290, 320, 310, 340, 300, 350, 320, 360, 330, 340, 380, 456],
            backgroundColor: '#C74634',
            borderRadius: 4, borderSkipped: false,
          },
          {
            label: 'NetSuite',
            data: [150, 160, 140, 170, 165, 180, 155, 190, 170, 185, 175, 165, 200, 189],
            backgroundColor: '#1B5E20',
            borderRadius: 4, borderSkipped: false,
          }
        ]
      },
      options: {
        ...chartDefaults,
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { font: { family: 'Inter', size: 10 }, color: '#9AA0A6' } },
          y: { stacked: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#9AA0A6' } }
        }
      }
    });
  }

  // Source Distribution Doughnut
  const srcCtx = document.getElementById('sourceDistChart');
  if (srcCtx) {
    new Chart(srcCtx.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['SAP S/4HANA', 'Oracle Financials', 'Oracle NetSuite'],
        datasets: [{
          data: [4285, 3842, 2156],
          backgroundColor: ['#0053B4', '#C74634', '#1B5E20'],
          borderWidth: 3, borderColor: '#fff', hoverOffset: 4,
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

  // ── Start Live Feed ────────────────────────────────────────
  // Seed initial items
  for (let i = 0; i < 8; i++) {
    addFeedItem();
  }
  startFeed();
});
