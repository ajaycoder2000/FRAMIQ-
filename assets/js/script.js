/* FarmIQ shared shell: header, hamburger nav, footer, language selector, auth state */

const FARMIQ_PAGES = [
  { href: 'index.html', label: 'Home' },
  { href: 'how-it-works.html', label: 'How It Works' },
  { href: 'app.html', label: 'Farmer App / Sign In' },
  { href: 'weather.html', label: 'Weather & Advisory' },
  { href: 'assistant.html', label: 'Farm Assistant' },
  { href: 'pricing.html', label: 'Pricing' },
  { href: 'resources.html', label: 'Resources / Blog' },
  { href: 'about.html', label: 'About & Investors' },
  { href: 'faq.html', label: 'FAQ' },
  { href: 'contact.html', label: 'Contact' },
];

const FARMIQ_LANGS = [
  ['en', 'English'], ['es', 'Español'], ['fr', 'Français'], ['de', 'Deutsch'],
  ['it', 'Italiano'], ['nl', 'Nederlands'], ['pl', 'Polski'], ['ro', 'Română'],
  ['sv', 'Svenska'], ['da', 'Dansk'], ['fi', 'Suomi'], ['pt', 'Português'],
];

function farmiqCurrentPage() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  return path;
}

function farmiqIsAuthed() {
  try { return localStorage.getItem('farmiq_authed') === 'true'; } catch (e) { return false; }
}

function farmiqUser() {
  try { return JSON.parse(localStorage.getItem('farmiq_user') || 'null'); } catch (e) { return null; }
}

function farmiqRenderHeader() {
  const current = farmiqCurrentPage();
  const authed = farmiqIsAuthed();
  const user = farmiqUser();

  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <div class="container">
      <a href="index.html" class="brand" aria-label="FarmIQ home">
        <span class="mark" aria-hidden="true">🌾</span> FarmIQ
      </a>
      <div class="header-actions">
        ${authed ? `<span class="pill unlocked" title="${user ? user.name : 'Farmer'}">🧑‍🌾 ${user ? user.name.split(' ')[0] : 'Farmer'}</span>` : ''}
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
    <li><a href="${p.href}" class="${p.href === current ? 'active' : ''}" ${p.href === current ? 'aria-current="page"' : ''}>${p.label}</a></li>
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
    ${authed ? `<div style="padding:0 24px"><button class="btn btn-outline btn-block btn-sm" id="farmiq-logout">Sign Out</button></div>` : ''}
    <p class="nav-footer-note">🛰️ Direct-to-farmer weather intelligence. No middleman, no bundling, no data-selling.</p>
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
    localStorage.setItem('farmiq_lang', langSelect.value);
    farmiqApplyTranslation(langSelect.value);
  });

  const logoutBtn = document.getElementById('farmiq-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('farmiq_authed');
      localStorage.removeItem('farmiq_user');
      window.location.href = 'app.html';
    });
  }
}

function farmiqRenderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  const linkCol = (title, items) => `
    <div><h4>${title}</h4><ul>${items.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('')}</ul></div>`;

  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <a href="index.html" class="brand"><span class="mark" aria-hidden="true">🌾</span> FarmIQ</a>
          <p style="margin-top:12px;max-width:32ch">Weather intelligence and crop advisory, priced for the farmer actually using it. No middleman, no institutional bundling.</p>
        </div>
        ${linkCol('Product', [['weather.html','Weather & Advisory'],['assistant.html','Farm Assistant'],['pricing.html','Pricing'],['how-it-works.html','How It Works']])}
        ${linkCol('Company', [['about.html','About & Investors'],['resources.html','Resources / Blog'],['faq.html','FAQ'],['contact.html','Contact']])}
        ${linkCol('Get Started', [['app.html','Sign In'],['app.html','Try Farmer App'],['pricing.html','See Pricing']])}
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
        <span>Privacy · Terms · GDPR-conscious location handling</span>
      </div>
    </div>`;
  document.body.appendChild(footer);

  const fl = document.getElementById('farmiq-footer-lang');
  fl.value = localStorage.getItem('farmiq_lang') || 'en';
  fl.addEventListener('change', () => {
    localStorage.setItem('farmiq_lang', fl.value);
    farmiqApplyTranslation(fl.value);
  });
}

/* --- Lightweight whole-site translation --- */
const FARMIQ_DICT = {
  es: { 'Try Farmer App': 'Probar App', 'See Pricing': 'Ver Precios', 'Sign in': 'Iniciar sesión' },
  fr: { 'Try Farmer App': 'Essayer l’app', 'See Pricing': 'Voir les tarifs', 'Sign in': 'Se connecter' },
  de: { 'Try Farmer App': 'App testen', 'See Pricing': 'Preise ansehen', 'Sign in': 'Anmelden' },
  it: { 'Try Farmer App': 'Prova l’app', 'See Pricing': 'Vedi i prezzi', 'Sign in': 'Accedi' },
  nl: { 'Try Farmer App': 'Probeer de app', 'See Pricing': 'Bekijk prijzen', 'Sign in': 'Inloggen' },
  pl: { 'Try Farmer App': 'Wypróbuj appkę', 'See Pricing': 'Zobacz cennik', 'Sign in': 'Zaloguj się' },
  ro: { 'Try Farmer App': 'Încearcă aplicația', 'See Pricing': 'Vezi prețurile', 'Sign in': 'Autentificare' },
  sv: { 'Try Farmer App': 'Testa appen', 'See Pricing': 'Se priser', 'Sign in': 'Logga in' },
  da: { 'Try Farmer App': 'Prøv appen', 'See Pricing': 'Se priser', 'Sign in': 'Log ind' },
  fi: { 'Try Farmer App': 'Kokeile sovellusta', 'See Pricing': 'Katso hinnat', 'Sign in': 'Kirjaudu sisään' },
  pt: { 'Try Farmer App': 'Testar o app', 'See Pricing': 'Ver preços', 'Sign in': 'Entrar' },
};

function farmiqApplyTranslation(langCode) {
  const dict = FARMIQ_DICT[langCode];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict && dict[key]) {
      el.textContent = dict[key];
    } else if (el.dataset.i18nOriginal) {
      el.textContent = el.dataset.i18nOriginal;
    }
  });
}

function farmiqInitI18nTags() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.dataset.i18nOriginal = el.textContent;
  });
  const savedLang = localStorage.getItem('farmiq_lang') || 'en';
  if (savedLang !== 'en') farmiqApplyTranslation(savedLang);
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
}

/* Redirect helper for pages requiring auth-gated content sections */
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
