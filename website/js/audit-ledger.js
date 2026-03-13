/**
 * Smart Contract Execution & Audit Ledger — Logic
 * =================================================
 * API-driven audit ledger with add entry, CSV upload,
 * hash verification, and immutability checks.
 */

// ── State ────────────────────────────────────────────────
let ledgerData = [];

// ── Approver Colors ──────────────────────────────────────
const APPROVER_COLORS = {
  'Finance Controller': '#4285F4',
  'Audit Commissioner': '#EA4335',
  'System': '#9AA0A6',
  'District Collector': '#FBBC05',
  'Health Secretary': '#34A853',
  'Chief Secretary': '#6C63FF',
  'Procurement Head': '#E91E63',
  'Energy Secretary': '#FF9800'
};

// ── Status Labels & Icons ────────────────────────────────
const STATUS_CONFIG = {
  approved:  { label: 'Approved',         icon: 'bi-check-circle-fill' },
  blocked:   { label: 'Blocked',          icon: 'bi-x-circle-fill' },
  triggered: { label: 'Policy Triggered', icon: 'bi-exclamation-triangle-fill' },
  override:  { label: 'Override',         icon: 'bi-arrow-repeat' },
  pending:   { label: 'Pending',          icon: 'bi-hourglass-split' }
};

// ── Initialize ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadLedgerFromAPI();
  bindFilters();
  bindSidebar();
  bindAddEntryForm();
  bindCSVUpload();
  bindVerifyButton();
});

// ══════════════════════════════════════════════════════════
// DATA LOADING — FROM API
// ══════════════════════════════════════════════════════════

async function loadLedgerFromAPI() {
  try {
    const res = await fetch('/api/audit-ledger');
    const data = await res.json();
    if (data.success) {
      ledgerData = data.entries;
      populateFilters();
      renderKPIs(ledgerData);
      renderTable(ledgerData);
      updateImmutabilityStrip('ok');
    } else {
      showToast('Failed to load ledger data', 'error');
    }
  } catch (err) {
    console.error('Failed to load ledger:', err);
    showToast('Error connecting to server', 'error');
  }
}

// ══════════════════════════════════════════════════════════
// ADD NEW ENTRY
// ══════════════════════════════════════════════════════════

function bindAddEntryForm() {
  const form = document.getElementById('addEntryForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Hashing & Saving…';

    const entry = {
      department: document.getElementById('entryDept').value,
      project: document.getElementById('entryProject').value,
      vendor: document.getElementById('entryVendor').value,
      policy: document.getElementById('entryPolicy').value,
      action: document.getElementById('entryAction').value,
      approver: document.getElementById('entryApprover').value,
      status: document.getElementById('entryStatus').value,
    };

    try {
      const res = await fetch('/api/audit-ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      const data = await res.json();

      if (data.success) {
        ledgerData.unshift(data.entry);
        populateFilters();
        renderKPIs(ledgerData);
        renderTable(ledgerData);
        closeAddModal();
        showToast(`${data.entry.id} added with SHA-256 hash`, 'success');
      } else {
        showToast(data.error || 'Failed to add entry', 'error');
      }
    } catch (err) {
      showToast('Server error: ' + err.message, 'error');
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-plus-lg"></i> Create & Hash Entry';
  });
}

function openAddModal() {
  document.getElementById('addEntryModal').classList.add('open');
}

function closeAddModal() {
  document.getElementById('addEntryModal').classList.remove('open');
  document.getElementById('addEntryForm').reset();
}

// ══════════════════════════════════════════════════════════
// CSV UPLOAD
// ══════════════════════════════════════════════════════════

function bindCSVUpload() {
  const zone = document.getElementById('csvDropZone');
  const input = document.getElementById('csvFileInput');
  if (!zone || !input) return;

  // Drag & drop
  ['dragenter', 'dragover'].forEach(evt => {
    zone.addEventListener(evt, e => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
  });
  ['dragleave', 'drop'].forEach(evt => {
    zone.addEventListener(evt, e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
    });
  });
  zone.addEventListener('drop', e => {
    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith('.csv')) {
      uploadCSV(file);
    } else {
      showToast('Please drop a .csv file', 'error');
    }
  });

  // File input
  input.addEventListener('change', e => {
    if (e.target.files[0]) {
      uploadCSV(e.target.files[0]);
      e.target.value = '';
    }
  });
}

async function uploadCSV(file) {
  const status = document.getElementById('uploadStatusText');
  const progress = document.getElementById('uploadSpinner');
  status.textContent = '';
  progress.style.display = 'flex';

  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/audit-ledger/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    progress.style.display = 'none';

    if (data.success) {
      // Reload everything
      await loadLedgerFromAPI();
      showToast(`Imported ${data.imported} entries from ${file.name}. ${data.errors} errors.`, 'success');
      status.innerHTML = `<span style="color:var(--green);">✓ ${data.imported} records imported & SHA-256 hashed</span>`;
    } else {
      status.innerHTML = `<span style="color:var(--red);">✗ ${data.error}</span>`;
    }
  } catch (err) {
    progress.style.display = 'none';
    status.innerHTML = `<span style="color:var(--red);">✗ Upload failed: ${err.message}</span>`;
  }
}

// ══════════════════════════════════════════════════════════
// VERIFY INTEGRITY
// ══════════════════════════════════════════════════════════

function bindVerifyButton() {
  const btn = document.getElementById('verifyIntegrityBtn');
  if (!btn) return;
  btn.addEventListener('click', verifyIntegrity);
}

async function verifyIntegrity() {
  const btn = document.getElementById('verifyIntegrityBtn');
  const panel = document.getElementById('verifyResultPanel');
  btn.disabled = true;
  btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Verifying…';

  try {
    const res = await fetch('/api/audit-ledger/verify');
    const data = await res.json();

    if (data.success) {
      const time = new Date(data.verifiedAt).toLocaleString('en-IN');
      updateImmutabilityStrip(data.allValid ? 'ok' : 'tampered');

      let html = `
        <div class="verify-summary ${data.allValid ? 'valid' : 'tampered'}">
          <div class="verify-icon">
            <i class="bi ${data.allValid ? 'bi-shield-check' : 'bi-shield-exclamation'}"></i>
          </div>
          <div class="verify-info">
            <div class="verify-title">${data.allValid ? 'All Records Verified ✓' : '⚠ Tampered Records Detected!'}</div>
            <div class="verify-stats">
              ${data.total} total records &nbsp;·&nbsp;
              <span style="color:var(--green)">${data.valid} valid</span> &nbsp;·&nbsp;
              <span style="color:${data.tampered > 0 ? 'var(--red)' : 'var(--text3)'}">${data.tampered} tampered</span> &nbsp;·&nbsp;
              Verified at ${time}
            </div>
          </div>
        </div>`;

      // Show first 5 details if tampered
      if (data.tampered > 0) {
        const tamperedItems = data.details.filter(d => !d.valid);
        html += `<div class="verify-tampered-list">`;
        tamperedItems.slice(0, 5).forEach(item => {
          html += `
            <div class="verify-tampered-item">
              <strong>${item.id}</strong>: stored <code>${item.storedHash.substring(0, 20)}…</code> ≠ computed <code>${item.computedHash.substring(0, 20)}…</code>
            </div>`;
        });
        html += `</div>`;
      }

      panel.innerHTML = html;
      panel.style.display = 'block';
    }
  } catch (err) {
    showToast('Verification failed: ' + err.message, 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="bi bi-shield-check"></i> Verify Integrity';
}

// ══════════════════════════════════════════════════════════
// IMMUTABILITY STRIP UPDATE
// ══════════════════════════════════════════════════════════

function updateImmutabilityStrip(state) {
  const strip = document.querySelector('.immutability-strip');
  if (!strip) return;
  if (state === 'tampered') {
    strip.style.background = 'linear-gradient(135deg, #FDECEA 0%, #FCE4EC 100%)';
    strip.style.borderColor = 'var(--red)';
    strip.querySelector('span').textContent =
      '⚠ WARNING: One or more records may have been tampered with. Run integrity verification.';
  } else {
    strip.style.background = '';
    strip.style.borderColor = '';
    strip.querySelector('span').textContent =
      'All records are cryptographically sealed and cannot be modified. Each entry is verified by SHA-256 hash.';
  }
}

// ══════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ══════════════════════════════════════════════════════════

function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = 'position:fixed;top:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const bg = type === 'success' ? '#E8F5E9' : type === 'error' ? '#FDECEA' : '#E3F2FD';
  const color = type === 'success' ? '#2E7D32' : type === 'error' ? '#C62828' : '#1565C0';
  const icon = type === 'success' ? 'bi-check-circle-fill' : type === 'error' ? 'bi-x-circle-fill' : 'bi-info-circle-fill';
  toast.style.cssText = `background:${bg};color:${color};padding:12px 20px;border-radius:12px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;box-shadow:0 4px 16px rgba(0,0,0,0.1);animation:fadeSlideIn 0.3s ease;max-width:400px;`;
  toast.innerHTML = `<i class="bi ${icon}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ══════════════════════════════════════════════════════════
// FILTER LOGIC
// ══════════════════════════════════════════════════════════

function populateFilters() {
  const deptSelect = document.getElementById('filterDept');
  const vendorSelect = document.getElementById('filterVendor');
  const policySelect = document.getElementById('filterPolicy');

  // Save current selections
  const prevDept = deptSelect.value;
  const prevVendor = vendorSelect.value;
  const prevPolicy = policySelect.value;

  // Clear 
  deptSelect.innerHTML = '<option value="">All Departments</option>';
  vendorSelect.innerHTML = '<option value="">All Vendors</option>';
  policySelect.innerHTML = '<option value="">All Policies</option>';

  const depts = [...new Set(ledgerData.map(e => e.department))].sort();
  const vendors = [...new Set(ledgerData.map(e => e.vendor))].sort();
  const policies = [...new Set(ledgerData.map(e => e.policy))].sort();

  depts.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d; opt.textContent = d;
    deptSelect.appendChild(opt);
  });
  vendors.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v; opt.textContent = v;
    vendorSelect.appendChild(opt);
  });
  policies.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p; opt.textContent = p;
    policySelect.appendChild(opt);
  });

  // Restore selections
  deptSelect.value = prevDept;
  vendorSelect.value = prevVendor;
  policySelect.value = prevPolicy;
}

function bindFilters() {
  const ids = ['filterDept', 'filterVendor', 'filterPolicy', 'filterSearch'];
  ids.forEach(id => {
    document.getElementById(id).addEventListener(
      id === 'filterSearch' ? 'input' : 'change',
      applyFilters
    );
  });
}

function applyFilters() {
  const dept = document.getElementById('filterDept').value;
  const vendor = document.getElementById('filterVendor').value;
  const policy = document.getElementById('filterPolicy').value;
  const search = document.getElementById('filterSearch').value.toLowerCase();

  let filtered = ledgerData;

  if (dept)   filtered = filtered.filter(e => e.department === dept);
  if (vendor) filtered = filtered.filter(e => e.vendor === vendor);
  if (policy) filtered = filtered.filter(e => e.policy === policy);

  if (search) {
    filtered = filtered.filter(e =>
      e.id.toLowerCase().includes(search) ||
      e.department.toLowerCase().includes(search) ||
      e.project.toLowerCase().includes(search) ||
      e.vendor.toLowerCase().includes(search) ||
      e.approver.toLowerCase().includes(search) ||
      e.action.toLowerCase().includes(search)
    );
  }

  renderKPIs(filtered);
  renderTable(filtered);
}

// ══════════════════════════════════════════════════════════
// RENDER FUNCTIONS
// ══════════════════════════════════════════════════════════

function renderKPIs(data) {
  document.getElementById('kpiTotal').textContent = data.length;
  document.getElementById('kpiApproved').textContent = data.filter(e => e.status === 'approved').length;
  document.getElementById('kpiBlocked').textContent = data.filter(e => e.status === 'blocked').length;
  document.getElementById('kpiTriggered').textContent =
    data.filter(e => e.status === 'triggered').length +
    data.filter(e => e.status === 'override').length;
}

function renderTable(data) {
  const tbody = document.getElementById('ledgerBody');
  const countEl = document.getElementById('filterCount');

  if (countEl) {
    countEl.innerHTML = `Showing <strong>${data.length}</strong> of <strong>${ledgerData.length}</strong> records`;
  }

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="ledger-empty">
            <i class="bi bi-journal-x"></i>
            <div class="ledger-empty-title">No matching records</div>
            <div class="ledger-empty-desc">Adjust your filters to see ledger entries.</div>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = data.map(entry => {
    const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending;
    const approverColor = APPROVER_COLORS[entry.approver] || '#9AA0A6';
    const initials = entry.approver === 'System' ? 'SY' :
      entry.approver.split(' ').map(w => w[0]).join('').substring(0, 2);
    const shortHash = entry.hash ? entry.hash.substring(0, 20) : '—';
    const sourceTag = entry.source === 'csv_upload'
      ? '<span class="ledger-source csv">CSV</span>'
      : entry.source === 'manual'
        ? '<span class="ledger-source manual">NEW</span>'
        : '';

    return `
      <tr>
        <td><span class="ledger-evt-id">${entry.id}</span>${sourceTag}</td>
        <td><span class="ledger-timestamp">${entry.timestamp}</span></td>
        <td>
          <div class="ledger-dept">${entry.department}</div>
          <div class="ledger-project">${entry.project}</div>
        </td>
        <td><span class="ledger-vendor">${entry.vendor}</span></td>
        <td><span class="ledger-policy"><i class="bi bi-shield-check"></i> ${entry.policy}</span></td>
        <td><span class="ledger-action">${entry.action}</span></td>
        <td>
          <div class="ledger-approver">
            <div class="ledger-approver-avatar" style="background:${approverColor}">${initials}</div>
            <span class="ledger-approver-name">${entry.approver}</span>
          </div>
        </td>
        <td><span class="ledger-status ${entry.status}"><i class="bi ${cfg.icon}"></i> ${cfg.label}</span></td>
        <td><span class="ledger-hash"><span class="ledger-hash-prefix">SHA-256:</span> ${shortHash}…</span></td>
      </tr>`;
  }).join('');
}

// ── Sidebar Toggle ───────────────────────────────────────
function bindSidebar() {
  const btn = document.getElementById('dashMenuBtn');
  const sidebar = document.getElementById('sidebar');
  if (btn && sidebar) {
    btn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}
