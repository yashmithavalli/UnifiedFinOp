/**
 * FinTrackTN — Data Configuration
 * ================================
 * ALL content, numbers, and department data lives here.
 * To plug in real data: just update the values below.
 * No need to touch index.html or main.js.
 */

const FinTrackData = {

  // ── Platform Info ──────────────────────────────────────
  platform: {
    name: "FinTrackTN",
    tagline: "Real-time Financial Visibility for Tamil Nadu",
    fiscalYear: "FY 2025-26",
    quarter: "Q4",
  },

  // ── Summary Stats (top 4 cards) ────────────────────────
  // Budget and Spent values are in Lakhs (₹)
  summary: {
    totalBudget: 9000,   // ₹ 90 Crores
    totalSpent:  7182,   // ₹ 71.82 Crores
    departments: 6,      // Update to 12 when all depts are added
    activeAlerts: 1,
  },

  // ── Departments ────────────────────────────────────────
  // budget & spent in Lakhs (₹)
  departments: [
    { id: "health",      name: "Health & Family Welfare", budget: 2000, spent: 1420, icon: "bi-heart-pulse",   color: "#ef4444" },
    { id: "education",   name: "School Education",        budget: 1800, spent: 1560, icon: "bi-book",          color: "#8b5cf6" },
    { id: "infra",       name: "Infrastructure",           budget: 2500, spent: 2250, icon: "bi-buildings",     color: "#f59e0b" },
    { id: "agriculture", name: "Agriculture",              budget: 1200, spent: 780,  icon: "bi-tree",          color: "#10b981" },
    { id: "transport",   name: "Transport",                budget: 900,  spent: 630,  icon: "bi-bus-front",     color: "#00d4ff" },
    { id: "it",          name: "IT & Digital Services",   budget: 600,  spent: 542,  icon: "bi-cpu",           color: "#6366f1" },
  ],

  // ── Monthly Trend Data (for area chart) ────────────────
  // Values in Lakhs (₹) — last 6 months
  monthlyData: {
    labels:  ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    budget:  [1400, 1450, 1500, 1520, 1480, 1650],
    actual:  [1100, 1320, 1180, 1440, 1290, 1852],
  },

  // ── Initial Transactions (shown on load) ───────────────
  transactions: [
    { dept: "Infrastructure", amount: "₹45.6L", category: "Bridge Construction",  status: "pending"  },
    { dept: "Health",         amount: "₹21.5L", category: "Staff Salary",         status: "approved" },
    { dept: "Education",      amount: "₹11.2L", category: "Teacher Training",     status: "approved" },
    { dept: "Infrastructure", amount: "₹32.1L", category: "Road Works",           status: "pending"  },
    { dept: "Transport",      amount: "₹18.9L", category: "Bus Fleet Upgrade",    status: "flagged"  },
    { dept: "Health",         amount: "₹14.2L", category: "Medical Supplies",     status: "approved" },
    { dept: "IT",             amount: "₹12.3L", category: "Software License",     status: "approved" },
    { dept: "Agriculture",    amount: "₹7.1L",  category: "Irrigation Works",     status: "approved" },
  ],

  // ── Simulated Live Transactions (added every 4 seconds) ─
  simulatedTransactions: [
    { dept: "Health",         amount: "₹3.2L",  category: "Ambulance Service",    status: "approved" },
    { dept: "IT",             amount: "₹5.6L",  category: "Cloud Storage Fees",   status: "approved" },
    { dept: "Infrastructure", amount: "₹18.7L", category: "Flyover Maintenance",  status: "flagged"  },
    { dept: "Agriculture",    amount: "₹2.9L",  category: "Seed Distribution",    status: "approved" },
    { dept: "Education",      amount: "₹7.4L",  category: "Mid-Day Meal Program", status: "approved" },
    { dept: "Transport",      amount: "₹14.1L", category: "Route Expansion",      status: "pending"  },
    { dept: "Health",         amount: "₹6.8L",  category: "Vaccination Drive",    status: "approved" },
    { dept: "IT",             amount: "₹9.3L",  category: "Cybersecurity Audit",  status: "approved" },
    { dept: "Agriculture",    amount: "₹4.5L",  category: "Fertilizer Subsidy",   status: "approved" },
    { dept: "Education",      amount: "₹8.1L",  category: "Digital Classrooms",   status: "approved" },
  ],

  // ── Budget Alert ────────────────────────────────────────
  // Fires after triggerAfter milliseconds to simulate a live alert
  alert: {
    department: "Infrastructure",
    message: "Infrastructure Dept has crossed 90% of Q4 budget — ₹22.5Cr / ₹25Cr",
    triggerAfter: 30000,  // 30 seconds
    threshold: 90,
  },

  // ── Impact Counters (bottom section) ────────────────────
  impact: [
    { id: "counter-budget",   end: 90,   suffix: "Cr",  prefix: "₹", label: "Total Budget Managed"    },
    { id: "counter-audit",    end: 40,   suffix: "%↓",  prefix: "",  label: "Audit Time Reduced"       },
    { id: "counter-accuracy", end: 99,   suffix: "%",   prefix: "",  label: "Reporting Accuracy"       },
    { id: "counter-depts",    end: 12,   suffix: "+",   prefix: "",  label: "Departments Integrated"   },
  ],

  // ── Embedded Sample Data (used by "Try with sample data" button) ──
  // Mirrors sample_data.csv — avoids CORS issues on file:// protocol
  sampleRows: [
    { Department: "Health & Family Welfare", Category: "Medical Supplies",    Amount: 1420000, Status: "approved", Month: "Oct", Budget: 20000000 },
    { Department: "Health & Family Welfare", Category: "Staff Salary",        Amount: 2150000, Status: "approved", Month: "Nov", Budget: 20000000 },
    { Department: "Health & Family Welfare", Category: "Equipment Purchase",  Amount: 930000,  Status: "approved", Month: "Dec", Budget: 20000000 },
    { Department: "Health & Family Welfare", Category: "Ambulance Service",   Amount: 320000,  Status: "approved", Month: "Jan", Budget: 20000000 },
    { Department: "Health & Family Welfare", Category: "Vaccination Drive",   Amount: 680000,  Status: "approved", Month: "Feb", Budget: 20000000 },
    { Department: "School Education",        Category: "Infrastructure",       Amount: 860000,  Status: "approved", Month: "Oct", Budget: 18000000 },
    { Department: "School Education",        Category: "Teacher Training",    Amount: 1120000, Status: "approved", Month: "Nov", Budget: 18000000 },
    { Department: "School Education",        Category: "Books & Materials",   Amount: 420000,  Status: "approved", Month: "Dec", Budget: 18000000 },
    { Department: "School Education",        Category: "Digital Classrooms",  Amount: 810000,  Status: "approved", Month: "Jan", Budget: 18000000 },
    { Department: "School Education",        Category: "Mid-Day Meal Program",Amount: 740000,  Status: "approved", Month: "Feb", Budget: 18000000 },
    { Department: "Infrastructure",          Category: "Road Works",          Amount: 3210000, Status: "pending",  Month: "Oct", Budget: 25000000 },
    { Department: "Infrastructure",          Category: "Bridge Construction", Amount: 4560000, Status: "pending",  Month: "Nov", Budget: 25000000 },
    { Department: "Infrastructure",          Category: "Metro Rail Work",     Amount: 2840000, Status: "pending",  Month: "Dec", Budget: 25000000 },
    { Department: "Infrastructure",          Category: "Flyover Maintenance", Amount: 1870000, Status: "flagged",  Month: "Jan", Budget: 25000000 },
    { Department: "Infrastructure",          Category: "Highway Expansion",   Amount: 3200000, Status: "approved", Month: "Feb", Budget: 25000000 },
    { Department: "Agriculture",             Category: "Fertilizer Subsidy",  Amount: 540000,  Status: "approved", Month: "Oct", Budget: 12000000 },
    { Department: "Agriculture",             Category: "Seed Distribution",   Amount: 290000,  Status: "approved", Month: "Nov", Budget: 12000000 },
    { Department: "Agriculture",             Category: "Irrigation Works",    Amount: 710000,  Status: "approved", Month: "Dec", Budget: 12000000 },
    { Department: "Agriculture",             Category: "Crop Insurance",      Amount: 450000,  Status: "approved", Month: "Jan", Budget: 12000000 },
    { Department: "Agriculture",             Category: "Farmer Training",     Amount: 380000,  Status: "approved", Month: "Feb", Budget: 12000000 },
    { Department: "Transport",               Category: "Fleet Maintenance",   Amount: 980000,  Status: "approved", Month: "Oct", Budget: 9000000  },
    { Department: "Transport",               Category: "Bus Fleet Upgrade",   Amount: 1890000, Status: "flagged",  Month: "Nov", Budget: 9000000  },
    { Department: "Transport",               Category: "Route Expansion",     Amount: 1410000, Status: "pending",  Month: "Dec", Budget: 9000000  },
    { Department: "Transport",               Category: "Driver Training",     Amount: 250000,  Status: "approved", Month: "Jan", Budget: 9000000  },
    { Department: "Transport",               Category: "Fuel Subsidy",        Amount: 670000,  Status: "approved", Month: "Feb", Budget: 9000000  },
    { Department: "IT & Digital Services",   Category: "Software License",    Amount: 1230000, Status: "approved", Month: "Oct", Budget: 6000000  },
    { Department: "IT & Digital Services",   Category: "Cloud Storage Fees",  Amount: 560000,  Status: "approved", Month: "Nov", Budget: 6000000  },
    { Department: "IT & Digital Services",   Category: "Server Maintenance",  Amount: 670000,  Status: "approved", Month: "Dec", Budget: 6000000  },
    { Department: "IT & Digital Services",   Category: "Cybersecurity Audit", Amount: 930000,  Status: "approved", Month: "Jan", Budget: 6000000  },
    { Department: "IT & Digital Services",   Category: "Portal Development",  Amount: 890000,  Status: "approved", Month: "Feb", Budget: 6000000  },
  ],
};

