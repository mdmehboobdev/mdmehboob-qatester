/* app.js — Portfolio Renderer */

let portfolioData = null;

async function loadData() {
  const res = await fetch('data.json?v=' + Date.now());
  return res.json();
}

/* ===========================
   SETTINGS & VISIBILITY
=========================== */
function applySettings(d) {
  const s = d.settings || {};
  if (s.siteTitle) document.getElementById('site-title').textContent = s.siteTitle;
  if (s.metaDescription) document.getElementById('site-desc').setAttribute('content', s.metaDescription);
  if (s.footerText) document.getElementById('footer-copy').textContent = s.footerText;

  // Section visibility
  const sections = s.sections || {};
  const map = { about: '#about', skills: '#skills', services: '#services', projects: '#projects', testimonials: '#testimonials', contact: '#contact' };
  Object.entries(map).forEach(([key, sel]) => {
    const el = document.querySelector(sel);
    if (el) el.style.display = (sections[key] === false) ? 'none' : '';
    // Also hide nav item
    const navItem = document.querySelector(`.nav-links li[data-section="${key}"]`);
    if (navItem) navItem.style.display = (sections[key] === false) ? 'none' : '';
  });

  // EmailJS init
  if (s.emailjsPublicKey) {
    emailjs.init(s.emailjsPublicKey);
  }
}

/* ===========================
   LOGO
=========================== */
function renderLogo(d) {
  const logo = d.about?.logo;
  const navLogo = document.getElementById('nav-logo');
  if (logo && logo.startsWith('data:image')) {
    navLogo.innerHTML = `<img src="${logo}" alt="Logo" style="height:36px;object-fit:contain;"/>`;
  } else {
    navLogo.innerHTML = `<span class="logo-bracket">&lt;</span>MA<span class="logo-bracket">/&gt;</span>`;
  }
}

/* ===========================
   HERO
=========================== */
function renderHero(d) {
  const a = d.about;
  document.getElementById('hero-name-terminal').textContent = a.name;

  // Tagline supports HTML (em tags)
  const taglineEl = document.getElementById('hero-tagline');
  taglineEl.innerHTML = a.tagline || 'I find the bugs<br/><em>before your users do.</em>';

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

/* ===========================
   ABOUT
=========================== */
function renderAbout(d) {
  const a = d.about;
  document.getElementById('about-name').textContent = a.name;

  // Bio supports rich HTML from editor
  document.getElementById('about-bio').innerHTML = a.bio || '';

  // Photo
  const photoEl = document.getElementById('about-photo');
  if (a.photo && a.photo.startsWith('data:image')) {
    photoEl.innerHTML = `<img src="${a.photo}" alt="${a.name}"/>`;
  } else {
    const initials = a.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
    photoEl.innerHTML = `<span>${initials}</span>`;
  }

  const emailEl = document.getElementById('about-email');
  const liEl    = document.getElementById('about-linkedin');
  const ghEl    = document.getElementById('about-github');
  if (emailEl) emailEl.href = `mailto:${a.email}`;
  if (liEl) { liEl.href = a.linkedin || '#'; if (!a.linkedin) liEl.style.display = 'none'; }
  if (ghEl) { ghEl.href = a.github || '#'; if (!a.github) ghEl.style.display = 'none'; }

  // Footer
  const fl = document.getElementById('footer-linkedin');
  const fg = document.getElementById('footer-github');
  if (fl) fl.href = a.linkedin || '#';
  if (fg) fg.href = a.github || '#';

  // WhatsApp
  const waNum = (a.whatsapp || '').replace(/\D/g, '');
  const waUrl = waNum ? `https://wa.me/${waNum}` : '#';
  const waBtn = document.getElementById('whatsapp-btn');
  const waContact = document.getElementById('contact-wa-btn');
  if (waBtn) { waBtn.href = waUrl; if (!waNum) waBtn.style.display = 'none'; }
  if (waContact) { waContact.href = waUrl; if (!waNum) waContact.closest('.contact-wa-wrap').style.display = 'none'; }
}

/* ===========================
   SKILLS
=========================== */
function renderSkills(d) {
  const grid = document.getElementById('skills-grid');
  grid.innerHTML = '';
  (d.skills || []).forEach(s => {
    const el = document.createElement('div');
    el.className = 'skill-card';
    el.innerHTML = `<div class="skill-name">${s.name}</div><div class="skill-cat">${s.category}</div>`;
    grid.appendChild(el);
  });
}

/* ===========================
   SERVICES
=========================== */
function renderServices(d) {
  const grid = document.getElementById('services-grid');
  grid.innerHTML = '';
  (d.services || []).forEach(s => {
    const features = (s.features || []).map(f => `<span class="service-feature">${f}</span>`).join('');
    const priceHTML = s.price ? `<div class="service-price">${s.price}</div>` : '';
    const el = document.createElement('div');
    el.className = 'service-card';
    el.innerHTML = `
      <div class="service-icon">${s.icon || '⚙️'}</div>
      <div class="service-title">${s.title}</div>
      <div class="service-desc">${s.description}</div>
      <div class="service-features">${features}</div>
      ${priceHTML}`;
    grid.appendChild(el);
  });
}

/* ===========================
   PROJECTS + MODAL
=========================== */
function renderProjects(d) {
  const grid = document.getElementById('projects-grid');
  grid.innerHTML = '';
  (d.projects || []).forEach((p, i) => {
    const tech = (p.tech || []).map(t => `<span class="tech-tag">${t}</span>`).join('');
    const imgHTML = (p.image && p.image.startsWith('data:image'))
      ? `<img src="${p.image}" class="project-img" alt="${p.title}"/>`
      : `<div class="project-img-placeholder"><span class="proj-num">PROJECT_${String(i+1).padStart(2,'0')}</span></div>`;

    const el = document.createElement('div');
    el.className = 'project-card';
    el.innerHTML = `
      ${imgHTML}
      <div class="project-body">
        <div class="project-number">PROJECT_${String(i+1).padStart(2,'0')}</div>
        <div class="project-title">${p.title}</div>
        <div class="project-short">${p.shortDesc || ''}</div>
        <div class="project-tech">${tech}</div>
        <button class="project-see-more" onclick="openModal(${i})">
          See More
          <svg viewBox="0 0 20 20" fill="none" width="16"><path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>`;
    grid.appendChild(el);
  });
}

function openModal(i) {
  const p = portfolioData.projects[i];
  if (!p) return;

  document.getElementById('modal-number').textContent = `PROJECT_${String(i+1).padStart(2,'0')}`;
  document.getElementById('modal-title').textContent = p.title;
  document.getElementById('modal-desc').innerHTML = p.description || '';

  // Image
  const imgWrap = document.getElementById('modal-image-wrap');
  if (p.image && p.image.startsWith('data:image')) {
    imgWrap.innerHTML = `<img src="${p.image}" alt="${p.title}"/>`;
  } else {
    imgWrap.innerHTML = `<div class="modal-image-placeholder"><span>PROJECT_${String(i+1).padStart(2,'0')}</span></div>`;
  }

  // Tech
  const tech = (p.tech || []).map(t => `<span class="tech-tag">${t}</span>`).join('');
  document.getElementById('modal-tech').innerHTML = tech;

  // Results
  const resultsEl = document.getElementById('modal-results');
  if (p.results && p.results.length) {
    resultsEl.innerHTML = `<div class="modal-results-title">Key Results</div>` +
      p.results.map(r => `<div class="modal-result-item">${r}</div>`).join('');
  } else { resultsEl.innerHTML = ''; }

  // Links
  const links = [];
  if (p.link) links.push(`<a href="${p.link}" target="_blank" class="btn btn-primary">Live Demo ↗</a>`);
  if (p.github) links.push(`<a href="${p.github}" target="_blank" class="btn btn-outline">GitHub ↗</a>`);
  document.getElementById('modal-links').innerHTML = links.join('');

  // Open
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ===========================
   TESTIMONIALS
=========================== */
function renderTestimonials(d) {
  const grid = document.getElementById('testimonials-grid');
  grid.innerHTML = '';
  (d.testimonials || []).forEach(t => {
    const el = document.createElement('div');
    el.className = 'testimonial-card';
    el.innerHTML = `
      <div class="t-quote-mark">"</div>
      <div class="testimonial-stars">★★★★★</div>
      <p class="testimonial-quote">${t.quote}</p>
      <div class="testimonial-author">${t.name}</div>
      <div class="testimonial-role">${t.role}</div>`;
    grid.appendChild(el);
  });
}

/* ===========================
   CONTACT — EmailJS
=========================== */
function initContact(d) {
  const s = d.settings || {};
  const form = document.getElementById('contact-form');
  const btn  = document.getElementById('submit-btn');
  const fb   = document.getElementById('form-feedback');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    btn.textContent = 'Sending...';
    btn.disabled = true;
    fb.className = 'form-feedback';
    fb.textContent = '';

    const hasEmailJS = s.emailjsServiceId && s.emailjsTemplateId && s.emailjsPublicKey;

    if (hasEmailJS) {
      // Send via EmailJS
      try {
        await emailjs.sendForm(s.emailjsServiceId, s.emailjsTemplateId, form);
        form.reset();
        fb.className = 'form-feedback success';
        fb.textContent = '✓ Message sent! I\'ll get back to you soon.';
        btn.textContent = 'Message Sent ✓';
      } catch (err) {
        fb.className = 'form-feedback error';
        fb.textContent = 'Failed to send. Please try WhatsApp instead.';
        btn.textContent = 'Send Message';
        btn.disabled = false;
      }
    } else {
      // Fallback: open WhatsApp with pre-filled message
      const name    = document.getElementById('f-name').value;
      const email   = document.getElementById('f-email').value;
      const subject = document.getElementById('f-subject').value;
      const message = document.getElementById('f-message').value;
      const waNum   = (d.about?.whatsapp || '').replace(/\D/g,'');

      if (waNum) {
        const text = encodeURIComponent(`Hi, I'm ${name} (${email}).\n\nSubject: ${subject}\n\n${message}`);
        window.open(`https://wa.me/${waNum}?text=${text}`, '_blank');
        form.reset();
        fb.className = 'form-feedback success';
        fb.textContent = '✓ Opening WhatsApp with your message pre-filled!';
        btn.textContent = 'Sent via WhatsApp ✓';
      } else {
        fb.className = 'form-feedback error';
        fb.textContent = 'Contact not configured yet. Please set up EmailJS in Admin → Settings.';
        btn.textContent = 'Send Message';
        btn.disabled = false;
      }
    }
  });
}

/* ===========================
   NAV
=========================== */
function initNav() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');

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

/* ===========================
   INIT
=========================== */
async function init() {
  portfolioData = await loadData();
  applySettings(portfolioData);
  renderLogo(portfolioData);
  renderHero(portfolioData);
  renderAbout(portfolioData);
  renderSkills(portfolioData);
  renderServices(portfolioData);
  renderProjects(portfolioData);
  renderTestimonials(portfolioData);
  initContact(portfolioData);
  initNav();
}

init();
