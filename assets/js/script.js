/* FarmIQ shared shell: header, hamburger nav, footer, language selector, auth state.
   Auth state is backed by Clerk (see clerk-init.js); language dictionary and the
   first-visit modal live in i18n.js. */

const FARMIQ_PAGES = [
  { href: 'index.html', label: 'Home', key: 'Home' },
  { href: 'how-it-works.html', label: 'How It Works', key: 'How It Works' },
  { href: 'weather.html', label: 'Weather & Advisory', key: 'Weather & Advisory' },
  { href: 'assistant.html', label: 'Farm Assistant', key: 'Farm Assistant' },
  { href: 'pricing.html', label: 'Pricing', key: 'Pricing' },
  { href: 'resources.html', label: 'Resources / Blog', key: 'Resources / Blog' },
  { href: 'about.html', label: 'About & Investors', key: 'About & Investors' },
  { href: 'faq.html', label: 'FAQ', key: 'FAQ' },
  { href: 'contact.html', label: 'Contact', key: 'Contact' },
];

function farmiqCurrentPage() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  return path;
}

/* Auth state — Clerk is the source of truth. Synchronous calls reflect
   whatever Clerk has resolved so far (false/null until farmiqInitClerk()
   settles), which is why the header renders optimistically signed-out
   first, then updates once Clerk loads. */
function farmiqIsAuthed() {
  return farmiqClerkIsAuthed();
}
function farmiqUser() {
  const u = farmiqClerkUser();
  if (!u) return null;
  return { name: farmiqClerkDisplayName(), email: u.primaryEmailAddress ? u.primaryEmailAddress.emailAddress : '' };
}

function farmiqRenderHeader() {
  const current = farmiqCurrentPage();

  const header = document.createElement('header');
  header.className = 'site-header';
  const quickLinks = [
    { href: 'weather.html', label: 'Weather & Advisory', key: 'Weather & Advisory' },
    { href: 'pricing.html', label: 'Pricing', key: 'Pricing' },
    { href: 'assistant.html', label: 'Farm Assistant', key: 'Farm Assistant' },
  ].map(p => `<a href="${p.href}" data-i18n="${p.key}" class="${p.href === current ? 'active' : ''}">${p.label}</a>`).join('');

  header.innerHTML = `
    <div class="container">
      <a href="index.html" class="brand" aria-label="FarmIQ home">
        <span class="mark" aria-hidden="true">🌾</span><span>Farm<em>IQ</em></span>
      </a>
      <nav class="header-quicklinks" aria-label="Quick links">${quickLinks}</nav>
      <div class="header-actions" id="farmiq-header-actions">
        <a href="app.html" class="btn btn-primary btn-sm" id="farmiq-header-auth-btn" data-i18n="Sign In">Sign In</a>
        <button class="hamburger" id="farmiq-hamburger" aria-expanded="false" aria-controls="farmiq-nav-panel" aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>`;
  document.body.prepend(header);

  const scrim = document.createElement('div');
  scrim.className = 'nav-scrim';
  scrim.id = 'farmiq-nav-scrim';

  const panel = document.createElement('nav');
  panel.className = 'nav-panel';
  panel.id = 'farmiq-nav-panel';
  panel.setAttribute('aria-label', 'Site navigation');

  const links = FARMIQ_PAGES.map(p => `
    <li><a href="${p.href}" data-i18n="${p.key}" class="${p.href === current ? 'active' : ''}" ${p.href === current ? 'aria-current="page"' : ''}>${p.label}</a></li>
  `).join('');

  const langOptions = FARMIQ_LANGS.map(([code, name]) => `<option value="${code}">${name}</option>`).join('');

  panel.innerHTML = `
    <div class="nav-panel-head">
      <span class="brand"><span class="mark" aria-hidden="true">🌱</span> Menu</span>
      <button class="nav-close" id="farmiq-nav-close" aria-label="Close menu">✕</button>
    </div>
    <ul class="nav-links">${links}</ul>
    <div class="nav-section-label">🌍 Language</div>
    <div style="padding:0 8px">
      <select class="lang-select" id="farmiq-lang-select" aria-label="Select language">${langOptions}</select>
    </div>
    <div style="padding:0 24px" id="farmiq-nav-auth-slot"></div>
    <p class="nav-footer-note" data-i18n="FooterTagline">🛰️ Direct-to-farmer weather intelligence. No middleman, no bundling, no data-selling.</p>
  `;
  document.body.appendChild(scrim);
  document.body.appendChild(panel);

  const hamburger = document.getElementById('farmiq-hamburger');
  const closeBtn = document.getElementById('farmiq-nav-close');

  function openNav() {
    panel.classList.add('open');
    scrim.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    closeBtn.focus();
  }
  function closeNav() {
    panel.classList.remove('open');
    scrim.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.focus();
  }
  hamburger.addEventListener('click', () => {
    panel.classList.contains('open') ? closeNav() : openNav();
  });
  closeBtn.addEventListener('click', closeNav);
  scrim.addEventListener('click', closeNav);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) closeNav();
  });

  const langSelect = document.getElementById('farmiq-lang-select');
  const savedLang = localStorage.getItem('farmiq_lang') || 'en';
  langSelect.value = savedLang;
  langSelect.addEventListener('change', () => {
    farmiqSetLanguage(langSelect.value);
    localStorage.setItem('farmiq_lang_chosen', 'true');
  });
}

/* Called once Clerk resolves (and again on any Clerk auth change) to
   reflect real sign-in state in the header. */
function farmiqUpdateHeaderAuth() {
  const actions = document.getElementById('farmiq-header-actions');
  const authSlot = document.getElementById('farmiq-nav-auth-slot');
  if (!actions || !authSlot) return;

  const existingPill = actions.querySelector('.pill');
  if (existingPill) existingPill.remove();
  const headerAuthBtn = document.getElementById('farmiq-header-auth-btn');

  if (farmiqIsAuthed()) {
    if (headerAuthBtn) headerAuthBtn.hidden = true;

    const pill = document.createElement('span');
    pill.className = 'pill unlocked';
    pill.title = farmiqUser().name;
    pill.textContent = `🧑‍🌾 ${farmiqUser().name}`;
    actions.prepend(pill);

    authSlot.innerHTML = `<button class="btn btn-outline btn-block btn-sm" id="farmiq-logout" data-i18n="Sign Out">Sign Out</button>`;
    document.getElementById('farmiq-logout').addEventListener('click', () => {
      window.Clerk.signOut().then(() => { window.location.href = 'app.html'; });
    });
  } else {
    if (headerAuthBtn) headerAuthBtn.hidden = false;
    authSlot.innerHTML = '';
  }
  farmiqApplyTranslation(localStorage.getItem('farmiq_lang') || 'en');
}

function farmiqRenderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  const linkCol = (title, items) => `
    <div><h4>${title}</h4><ul>${items.map(([href, label, key]) => `<li><a href="${href}"${key ? ` data-i18n="${key}"` : ''}>${label}</a></li>`).join('')}</ul></div>`;

  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <a href="index.html" class="brand"><span class="mark" aria-hidden="true">🌾</span> FarmIQ</a>
          <p style="margin-top:12px;max-width:32ch" data-i18n="FooterTagline">Weather and crop advisory, direct to farmers.</p>
        </div>
        ${linkCol('Product', [['weather.html','Weather & Advisory','Weather & Advisory'],['assistant.html','Farm Assistant','Farm Assistant'],['pricing.html','Pricing','Pricing'],['how-it-works.html','How It Works','How It Works']])}
        ${linkCol('Company', [['about.html','About & Investors','About & Investors'],['resources.html','Resources / Blog','Resources / Blog'],['faq.html','FAQ','FAQ'],['contact.html','Contact','Contact']])}
        ${linkCol('Legal', [['privacy.html','Privacy Policy'],['terms.html','Terms of Service']])}
        ${linkCol('Get Started', [['app.html','Sign In','Sign In'],['app.html','Get Your Free Forecast','Get Your Free Forecast'],['pricing.html','See Pricing','See Pricing']])}
        <div>
          <h4>Language</h4>
          <select class="lang-select" id="farmiq-footer-lang" aria-label="Select language">
            ${FARMIQ_LANGS.map(([code,name]) => `<option value="${code}">${name}</option>`).join('')}
          </select>
          <h4 style="margin-top:22px">Contact</h4>
          <p style="margin:0;font-size:.9rem">support@farmiq.app</p>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 FarmIQ. Built for farmers, not funds.</span>
        <span>
          <a href="privacy.html">Privacy</a> ·
          <a href="terms.html">Terms</a> ·
          GDPR-conscious location handling
        </span>
      </div>
    </div>`;
  document.body.appendChild(footer);

  const fl = document.getElementById('farmiq-footer-lang');
  fl.value = localStorage.getItem('farmiq_lang') || 'en';
  fl.addEventListener('change', () => {
    farmiqSetLanguage(fl.value);
    localStorage.setItem('farmiq_lang_chosen', 'true');
  });
}

function farmiqInitShell() {
  const skip = document.createElement('a');
  skip.href = '#main';
  skip.className = 'skip-link';
  skip.textContent = 'Skip to content';
  document.body.prepend(skip);

  farmiqRenderHeader();
  farmiqRenderFooter();
  farmiqInitI18nTags();
  farmiqShowLanguageModal();

  farmiqInitScrollEffects();
  farmiqInitReveal();
  farmiqInitScene();

  farmiqInitClerk().then((clerk) => {
    farmiqUpdateHeaderAuth();
    document.dispatchEvent(new CustomEvent('farmiq:auth-ready'));
    if (!clerk) return;
    clerk.addListener(() => {
      farmiqUpdateHeaderAuth();
      document.dispatchEvent(new CustomEvent('farmiq:auth-changed'));
    });
  });
}

/* Header gains a solid background once the hero scrolls away. */
function farmiqInitScrollEffects() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* Sections fade up as they enter the viewport. */
function farmiqInitReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  items.forEach(el => io.observe(el));
}

/* Boot the WebGL hero scene when the page has a canvas for it. */
function farmiqInitScene() {
  const canvas = document.getElementById('farmiq-canvas');
  if (!canvas || typeof FARMIQ_SCENE === 'undefined') return;
  // Three.js loads async from CDN; poll briefly, then give up silently
  // (the CSS gradient fallback already renders behind the canvas).
  const mode = canvas.dataset.mode || 'hero';
  let tries = 0;
  (function waitForThree() {
    if (window.THREE) { FARMIQ_SCENE.init(canvas, mode); return; }
    if (tries++ > 100) return;
    setTimeout(waitForThree, 60);
  })();
}

/* Redirect helper for pages requiring auth-gated content sections.
   Call once immediately (renders the locked state instantly) and again
   after 'farmiq:auth-ready' / 'farmiq:auth-changed' fires. */
function farmiqRequireAuthUI(lockedEl, unlockedEl) {
  if (farmiqIsAuthed()) {
    if (lockedEl) lockedEl.hidden = true;
    if (unlockedEl) unlockedEl.hidden = false;
  } else {
    if (lockedEl) lockedEl.hidden = false;
    if (unlockedEl) unlockedEl.hidden = true;
  }
}

document.addEventListener('DOMContentLoaded', farmiqInitShell);
