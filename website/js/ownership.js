/**
 * Spend Ownership Graph — Interactivity
 * ======================================
 * Node click/expand, filter dropdowns, and trace search.
 */

(function () {
  'use strict';

  // ── Data for search ───────────────────────────────────────
  const traceData = [
    {
      id: 'chain1',
      expense: '₹2,30,00,000',
      vendor: 'Larsen & Toubro',
      project: 'Chennai Metro Phase 2 Infrastructure',
      dept: 'Transport Infrastructure',
      owner: 'Project Director – Metro Development',
      filterDept: 'transport',
      filterVendor: 'lt',
      filterOwner: 'metro-dir',
      keywords: ['l&t', 'lt', 'larsen', 'toubro', 'metro', 'chennai', 'phase 2', 'transport', '2.3', 'exp-2026-00147']
    },
    {
      id: 'chain2',
      expense: '₹1,10,00,000',
      vendor: 'Tata Consulting Services',
      project: 'TIDCO Smart Industrial Park Development',
      dept: 'Industrial Development',
      owner: 'TIDCO Project Manager',
      filterDept: 'industrial',
      filterVendor: 'tcs',
      filterOwner: 'tidco-mgr',
      keywords: ['tcs', 'tata', 'tidco', 'smart', 'industrial', 'park', '1.1', 'exp-2026-00203']
    }
  ];

  // ── Node click to expand/collapse detail ──────────────────
  document.querySelectorAll('.trace-node[data-detail]').forEach(node => {
    node.addEventListener('click', function () {
      const detailId = this.getAttribute('data-detail');
      const detailEl = document.getElementById(detailId);
      if (!detailEl) return;

      const isOpen = detailEl.classList.contains('open');

      // Close all details in the same chain
      const chain = this.closest('.trace-chain');
      chain.querySelectorAll('.trace-node-detail.open').forEach(d => d.classList.remove('open'));
      chain.querySelectorAll('.trace-node.active').forEach(n => n.classList.remove('active'));

      // Toggle current
      if (!isOpen) {
        detailEl.classList.add('open');
        this.classList.add('active');
      }
    });
  });

  // ── Filter dropdowns ──────────────────────────────────────
  const filterDept = document.getElementById('filterDept');
  const filterVendor = document.getElementById('filterVendor');
  const filterOwner = document.getElementById('filterOwner');
  const chains = document.querySelectorAll('.trace-chain');

  function applyFilters() {
    const deptVal = filterDept.value;
    const vendorVal = filterVendor.value;
    const ownerVal = filterOwner.value;

    chains.forEach(chain => {
      const dept = chain.getAttribute('data-dept');
      const vendor = chain.getAttribute('data-vendor');
      const owner = chain.getAttribute('data-owner');

      const deptMatch = deptVal === 'all' || dept === deptVal;
      const vendorMatch = vendorVal === 'all' || vendor === vendorVal;
      const ownerMatch = ownerVal === 'all' || owner === ownerVal;

      chain.style.display = (deptMatch && vendorMatch && ownerMatch) ? '' : 'none';
    });
  }

  if (filterDept) filterDept.addEventListener('change', applyFilters);
  if (filterVendor) filterVendor.addEventListener('change', applyFilters);
  if (filterOwner) filterOwner.addEventListener('change', applyFilters);

  // Reset button
  window.resetFilters = function () {
    if (filterDept) filterDept.value = 'all';
    if (filterVendor) filterVendor.value = 'all';
    if (filterOwner) filterOwner.value = 'all';
    chains.forEach(c => c.style.display = '');

    // Clear search
    const searchInput = document.getElementById('traceSearch');
    const searchResult = document.getElementById('searchResult');
    if (searchInput) searchInput.value = '';
    if (searchResult) {
      searchResult.classList.remove('show');
      searchResult.innerHTML = '';
    }

    // Close all open details
    document.querySelectorAll('.trace-node-detail.open').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.trace-node.active').forEach(n => n.classList.remove('active'));
  };

  // ── Trace Search ──────────────────────────────────────────
  const searchInput = document.getElementById('traceSearch');
  const searchResult = document.getElementById('searchResult');

  if (searchInput && searchResult) {
    let debounceTimer;
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => performSearch(this.value.trim()), 250);
    });
  }

  function performSearch(query) {
    if (!query || query.length < 2) {
      searchResult.classList.remove('show');
      searchResult.innerHTML = '';
      return;
    }

    const q = query.toLowerCase();
    const matches = traceData.filter(d =>
      d.keywords.some(k => k.includes(q)) ||
      d.vendor.toLowerCase().includes(q) ||
      d.project.toLowerCase().includes(q) ||
      d.dept.toLowerCase().includes(q) ||
      d.owner.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
      searchResult.innerHTML = `
        <div class="trace-path-flow" style="justify-content: center; color: var(--text2); font-size: 13px;">
          <i class="bi bi-info-circle" style="margin-right: 6px;"></i> No matching expense chain found for "${query}"
        </div>`;
      searchResult.classList.add('show');
      return;
    }

    let html = '';
    matches.forEach(m => {
      html += `
        <div class="trace-path-flow" style="margin-bottom: 8px; cursor: pointer;" onclick="document.getElementById('${m.id}').scrollIntoView({behavior:'smooth',block:'center'})">
          <span class="trace-path-chip expense"><i class="bi bi-currency-rupee"></i> ${m.expense}</span>
          <i class="bi bi-arrow-right trace-path-arrow"></i>
          <span class="trace-path-chip vendor"><i class="bi bi-shop"></i> ${m.vendor}</span>
          <i class="bi bi-arrow-right trace-path-arrow"></i>
          <span class="trace-path-chip project"><i class="bi bi-folder2-open"></i> ${m.project}</span>
          <i class="bi bi-arrow-right trace-path-arrow"></i>
          <span class="trace-path-chip dept"><i class="bi bi-building"></i> ${m.dept}</span>
          <i class="bi bi-arrow-right trace-path-arrow"></i>
          <span class="trace-path-chip owner"><i class="bi bi-person-badge"></i> ${m.owner}</span>
        </div>`;
    });

    searchResult.innerHTML = html;
    searchResult.classList.add('show');
  }

})();
