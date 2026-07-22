/* app.js — Portfolio Renderer */

async function loadData() {
  const res = await fetch('data.json?v=' + Date.now());
  return res.json();
}

function renderHero(d) {
  const a = d.about;
  document.title = `${a.name} — QA & Automation Engineer`;
  document.getElementById('hero-name-terminal').textContent = a.name;
  document.getElementById('hero-tagline').innerHTML = a.tagline.includes('before') ? a.tagline.replace('before your users do.', 'before<br/><em>your users do.</em>') : a.tagline;
  document.getElementById('hero-sub').textContent = `${a.title} · Selenium · Java · REST Assured · TestNG`;

  // Stats
  const statsEl = document.getElementById('hero-stats');
  statsEl.innerHTML = '';
  (a.stats || []).forEach(s => {
    const el = document.createElement('div');
    el.className = 'stat-item';
    el.innerHTML = `<div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div>`;
    statsEl.appendChild(el);
  });
}

function renderAbout(d) {
  const a = d.about;
  document.getElementById('about-name').textContent = a.name;
  document.getElementById('about-bio').textContent = a.bio;
  document.getElementById('footer-copy').textContent = `© ${new Date().getFullYear()} ${a.name}`;

  // Photo
  const photoEl = document.getElementById('about-photo');
  if (a.photo && a.photo.length > 10) {
    photoEl.innerHTML = `<img src="${a.photo}" alt="${a.name}" />`;
  } else {
    const initials = a.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
    photoEl.innerHTML = `<span>${initials}</span>`;
  }

  // Links
  const email = document.getElementById('about-email');
  const linkedin = document.getElementById('about-linkedin');
  const github = document.getElementById('about-github');
  email.href = `mailto:${a.email}`;
  if (a.linkedin) linkedin.href = a.linkedin; else linkedin.style.display = 'none';
  if (a.github) github.href = a.github; else github.style.display = 'none';

  // Footer links
  const fl = document.getElementById('footer-linkedin');
  const fg = document.getElementById('footer-github');
  if (fl) fl.href = a.linkedin || '#';
  if (fg) fg.href = a.github || '#';

  // WhatsApp
  const waBtn = document.getElementById('whatsapp-btn');
  if (a.whatsapp) {
    waBtn.href = `https://wa.me/${a.whatsapp.replace(/\D/g,'')}`;
  } else {
    waBtn.style.display = 'none';
  }
}

function renderSkills(d) {
  const grid = document.getElementById('skills-grid');
  grid.innerHTML = '';
  d.skills.forEach(s => {
    const el = document.createElement('div');
    el.className = 'skill-card';
    el.innerHTML = `<div class="skill-name">${s.name}</div><div class="skill-cat">${s.category}</div>`;
    grid.appendChild(el);
  });
}

function renderProjects(d) {
  const grid = document.getElementById('projects-grid');
  grid.innerHTML = '';
  d.projects.forEach((p, i) => {
    const tech = (p.tech || []).map(t => `<span class="tech-tag">${t}</span>`).join('');
    const links = [];
    if (p.link) links.push(`<a href="${p.link}" class="project-link" target="_blank">Live Demo ↗</a>`);
    if (p.github) links.push(`<a href="${p.github}" class="project-link" target="_blank">GitHub ↗</a>`);
    const linksHTML = links.length ? `<div class="project-links">${links.join('')}</div>` : '';
    const el = document.createElement('div');
    el.className = 'project-card';
    el.innerHTML = `
      <div class="project-number">PROJECT_${String(i+1).padStart(2,'0')}</div>
      <div class="project-title">${p.title}</div>
      <div class="project-desc">${p.description}</div>
      <div class="project-tech">${tech}</div>
      ${linksHTML}
    `;
    grid.appendChild(el);
  });
}

function renderTestimonials(d) {
  const grid = document.getElementById('testimonials-grid');
  grid.innerHTML = '';
  d.testimonials.forEach(t => {
    const el = document.createElement('div');
    el.className = 'testimonial-card';
    el.innerHTML = `
      <div class="t-quote-mark">"</div>
      <div class="testimonial-stars">★★★★★</div>
      <p class="testimonial-quote">${t.quote}</p>
      <div class="testimonial-author">${t.name}</div>
      <div class="testimonial-role">${t.role}</div>
    `;
    grid.appendChild(el);
  });
}

function initContact() {
  const form = document.getElementById('contact-form');
  const btn = document.getElementById('submit-btn');
  const feedback = document.getElementById('form-feedback');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    btn.textContent = 'Sending...';
    btn.disabled = true;
    feedback.className = 'form-feedback';
    feedback.textContent = '';

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      });
      if (res.ok) {
        form.reset();
        feedback.className = 'form-feedback success';
        feedback.textContent = '✓ Message sent! I\'ll get back to you soon.';
        btn.textContent = 'Message Sent!';
      } else {
        throw new Error();
      }
    } catch {
      feedback.className = 'form-feedback error';
      feedback.textContent = 'Something went wrong. Please try again or use WhatsApp.';
      btn.textContent = 'Send Message';
      btn.disabled = false;
    }
  });
}

function initNav() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });

  document.querySelectorAll('#nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
    });
  });
}

async function init() {
  const data = await loadData();
  renderHero(data);
  renderAbout(data);
  renderSkills(data);
  renderProjects(data);
  renderTestimonials(data);
  initContact();
  initNav();
}

init();
