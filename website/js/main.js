/**
 * Unified FinOps Platform — Main Application Logic
 * ==================================================
 * Landing page interactions, navigation, and animations.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── AOS Init ──────────────────────────────────────────────
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 600, easing: 'ease-out', once: true, offset: 60 });
  }

  // ── Mobile Menu Toggle ────────────────────────────────────
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const icon = menuBtn.querySelector('i');
      icon.className = navLinks.classList.contains('open') ? 'bi bi-x-lg' : 'bi bi-list';
    });
    // Close menu when a link is clicked
    navLinks.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const icon = menuBtn.querySelector('i');
        icon.className = 'bi bi-list';
      });
    });
  }

  // ── Navbar scroll effect ──────────────────────────────────
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 30);
    });
  }

  // ── Smooth scroll for anchor links ────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Active nav link on scroll ─────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  if (sections.length > 0) {
    const navLinksAll = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(section => {
        const top = section.offsetTop - 120;
        if (window.pageYOffset >= top) {
          current = section.getAttribute('id');
        }
      });
      navLinksAll.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === '#' + current || (current === 'hero' && href.includes('index'))) {
          link.classList.add('active');
        }
      });
    });
  }

  // ── Dashboard Preview Chart Bars ──────────────────────────
  const dashChart = document.getElementById('dashChart');
  if (dashChart) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const budgetData = [65, 70, 55, 80, 60, 75, 85, 70];
    const spentData   = [50, 60, 45, 72, 55, 68, 78, 62];

    months.forEach((month, i) => {
      const group = document.createElement('div');
      group.className = 'dash-bar-group';
      group.innerHTML = `
        <div class="dash-bar-wrap">
          <div class="dash-bar" style="height: ${budgetData[i]}%; background: rgba(0,212,255,0.5); animation-delay: ${i * 0.08}s;"></div>
          <div class="dash-bar" style="height: ${spentData[i]}%; background: rgba(245,158,11,0.5); animation-delay: ${i * 0.08 + 0.04}s;"></div>
        </div>
        <div class="dash-bar-label">${month}</div>
      `;
      dashChart.appendChild(group);
    });
  }

  // ── Contact form handler ──────────────────────────────────
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formEl = contactForm;
      const successEl = document.getElementById('contactSuccess');
      if (formEl && successEl) {
        formEl.style.display = 'none';
        successEl.style.display = 'block';
      }
    });
  }

});
