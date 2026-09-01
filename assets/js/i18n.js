/* FarmIQ i18n — static translation dictionary + first-visit language modal.
   No translation API/backend: every string below is hand-translated and
   swapped in on the client via data-i18n attributes. Coverage focuses on
   the navigation, hero, and other content every visitor sees first —
   extend FARMIQ_DICT with more keys as more page copy is tagged. */

const FARMIQ_LANGS = [
  ['en', 'English'], ['es', 'Español'], ['fr', 'Français'], ['de', 'Deutsch'],
  ['it', 'Italiano'], ['nl', 'Nederlands'], ['pl', 'Polski'], ['ro', 'Română'],
  ['sv', 'Svenska'], ['da', 'Dansk'], ['fi', 'Suomi'], ['pt', 'Português'],
];

const FARMIQ_I18N_KEYS = {
  'Home': 'Home',
  'How It Works': 'How It Works',
  'Farmer App / Sign In': 'Farmer App / Sign In',
  'Weather & Advisory': 'Weather & Advisory',
  'Farm Assistant': 'Farm Assistant',
  'Pricing': 'Pricing',
  'Resources / Blog': 'Resources / Blog',
  'About & Investors': 'About & Investors',
  'FAQ': 'FAQ',
  'Contact': 'Contact',
  'Sign In': 'Sign In',
  'Sign Out': 'Sign Out',
  'Try Farmer App': 'Try Farmer App',
  'See Pricing': 'See Pricing',
  'Smarter Crop Timing.': 'Smarter Crop Timing.',
  'Direct to You.': 'Direct to You.',
  'HeroSub': '15-day forecasts, AI advisory, and a farm assistant — at the price of a bag of seed per month. No middleman, no enterprise pricing.',
  'FooterTagline': 'Weather and crop advisory, direct to farmers.',
  'ModalTitle': 'Choose your language',
  'ModalSub': 'FarmIQ is available in 12 languages. You can change this anytime from the menu.',
  'Continue': 'Continue',
};

const FARMIQ_DICT = {
  es: {
    'Home': 'Inicio', 'How It Works': 'Cómo Funciona', 'Farmer App / Sign In': 'App / Iniciar Sesión',
    'Weather & Advisory': 'Clima y Asesoría', 'Farm Assistant': 'Asistente Agrícola', 'Pricing': 'Precios',
    'Resources / Blog': 'Recursos / Blog', 'About & Investors': 'Nosotros e Inversores', 'FAQ': 'Preguntas Frecuentes',
    'Contact': 'Contacto', 'Sign In': 'Iniciar sesión', 'Sign Out': 'Cerrar sesión',
    'Try Farmer App': 'Probar la App', 'See Pricing': 'Ver Precios',
    'Smarter Crop Timing.': 'Decisiones de Cultivo Más Inteligentes.', 'Direct to You.': 'Directo a Ti.',
    'HeroSub': 'Pronósticos de 15 días, asesoría con IA y un asistente agrícola — al precio de una bolsa de semillas al mes. Sin intermediarios, sin precios empresariales.',
    'FooterTagline': 'Clima y asesoría agrícola, directo a los agricultores.',
    'ModalTitle': 'Elige tu idioma', 'ModalSub': 'FarmIQ está disponible en 12 idiomas. Puedes cambiarlo en cualquier momento desde el menú.', 'Continue': 'Continuar',
  },
  fr: {
    'Home': 'Accueil', 'How It Works': 'Comment Ça Marche', 'Farmer App / Sign In': 'App / Connexion',
    'Weather & Advisory': 'Météo et Conseils', 'Farm Assistant': 'Assistant Agricole', 'Pricing': 'Tarifs',
    'Resources / Blog': 'Ressources / Blog', 'About & Investors': 'À Propos et Investisseurs', 'FAQ': 'FAQ',
    'Contact': 'Contact', 'Sign In': 'Se connecter', 'Sign Out': 'Se déconnecter',
    'Try Farmer App': 'Essayer l’App', 'See Pricing': 'Voir les Tarifs',
    'Smarter Crop Timing.': 'Un Calendrier de Culture Plus Intelligent.', 'Direct to You.': 'Directement à Vous.',
    'HeroSub': 'Prévisions à 15 jours, conseils par IA et un assistant agricole — au prix d’un sac de semences par mois. Sans intermédiaire, sans tarifs d’entreprise.',
    'FooterTagline': 'Météo et conseils agricoles, directement pour les agriculteurs.',
    'ModalTitle': 'Choisissez votre langue', 'ModalSub': 'FarmIQ est disponible en 12 langues. Vous pouvez la changer à tout moment depuis le menu.', 'Continue': 'Continuer',
  },
  de: {
    'Home': 'Startseite', 'How It Works': 'So Funktioniert’s', 'Farmer App / Sign In': 'App / Anmelden',
    'Weather & Advisory': 'Wetter & Beratung', 'Farm Assistant': 'Farm-Assistent', 'Pricing': 'Preise',
    'Resources / Blog': 'Ressourcen / Blog', 'About & Investors': 'Über Uns & Investoren', 'FAQ': 'FAQ',
    'Contact': 'Kontakt', 'Sign In': 'Anmelden', 'Sign Out': 'Abmelden',
    'Try Farmer App': 'App Testen', 'See Pricing': 'Preise Ansehen',
    'Smarter Crop Timing.': 'Intelligentere Anbauplanung.', 'Direct to You.': 'Direkt an Dich.',
    'HeroSub': '15-Tage-Prognosen, KI-Beratung und ein Farm-Assistent — zum Preis eines Saatgutsacks im Monat. Kein Zwischenhändler, keine Unternehmenspreise.',
    'FooterTagline': 'Wetter und Anbauberatung, direkt für Landwirte.',
    'ModalTitle': 'Wähle deine Sprache', 'ModalSub': 'FarmIQ ist in 12 Sprachen verfügbar. Du kannst sie jederzeit im Menü ändern.', 'Continue': 'Weiter',
  },
  it: {
    'Home': 'Home', 'How It Works': 'Come Funziona', 'Farmer App / Sign In': 'App / Accedi',
    'Weather & Advisory': 'Meteo e Consulenza', 'Farm Assistant': 'Assistente Agricolo', 'Pricing': 'Prezzi',
    'Resources / Blog': 'Risorse / Blog', 'About & Investors': 'Chi Siamo e Investitori', 'FAQ': 'FAQ',
    'Contact': 'Contatti', 'Sign In': 'Accedi', 'Sign Out': 'Esci',
    'Try Farmer App': 'Prova l’App', 'See Pricing': 'Vedi i Prezzi',
    'Smarter Crop Timing.': 'Tempistiche di Coltivazione Più Intelligenti.', 'Direct to You.': 'Direttamente a Te.',
    'HeroSub': 'Previsioni a 15 giorni, consulenza IA e un assistente agricolo — al prezzo di un sacco di sementi al mese. Senza intermediari, senza tariffe aziendali.',
    'FooterTagline': 'Meteo e consulenza agricola, direttamente per gli agricoltori.',
    'ModalTitle': 'Scegli la tua lingua', 'ModalSub': 'FarmIQ è disponibile in 12 lingue. Puoi cambiarla in qualsiasi momento dal menu.', 'Continue': 'Continua',
  },
  nl: {
    'Home': 'Home', 'How It Works': 'Hoe Het Werkt', 'Farmer App / Sign In': 'App / Inloggen',
    'Weather & Advisory': 'Weer & Advies', 'Farm Assistant': 'Boerderij-assistent', 'Pricing': 'Prijzen',
    'Resources / Blog': 'Bronnen / Blog', 'About & Investors': 'Over Ons & Investeerders', 'FAQ': 'Veelgestelde Vragen',
    'Contact': 'Contact', 'Sign In': 'Inloggen', 'Sign Out': 'Uitloggen',
    'Try Farmer App': 'Probeer de App', 'See Pricing': 'Bekijk Prijzen',
    'Smarter Crop Timing.': 'Slimmere Gewastiming.', 'Direct to You.': 'Rechtstreeks Naar Jou.',
    'HeroSub': '15-daagse voorspellingen, AI-advies en een boerderij-assistent — voor de prijs van een zak zaaigoed per maand. Geen tussenhandel, geen enterprise-prijzen.',
    'FooterTagline': 'Weer en gewasadvies, rechtstreeks voor boeren.',
    'ModalTitle': 'Kies je taal', 'ModalSub': 'FarmIQ is beschikbaar in 12 talen. Je kunt dit altijd wijzigen via het menu.', 'Continue': 'Doorgaan',
  },
  pl: {
    'Home': 'Strona Główna', 'How It Works': 'Jak To Działa', 'Farmer App / Sign In': 'Aplikacja / Logowanie',
    'Weather & Advisory': 'Pogoda i Doradztwo', 'Farm Assistant': 'Asystent Rolniczy', 'Pricing': 'Cennik',
    'Resources / Blog': 'Zasoby / Blog', 'About & Investors': 'O Nas i Inwestorzy', 'FAQ': 'FAQ',
    'Contact': 'Kontakt', 'Sign In': 'Zaloguj się', 'Sign Out': 'Wyloguj się',
    'Try Farmer App': 'Wypróbuj Aplikację', 'See Pricing': 'Zobacz Cennik',
    'Smarter Crop Timing.': 'Mądrzejsze Planowanie Upraw.', 'Direct to You.': 'Bezpośrednio Do Ciebie.',
    'HeroSub': '15-dniowe prognozy, doradztwo AI i asystent rolniczy — w cenie worka nasion miesięcznie. Bez pośredników, bez cen korporacyjnych.',
    'FooterTagline': 'Pogoda i doradztwo uprawowe, bezpośrednio dla rolników.',
    'ModalTitle': 'Wybierz swój język', 'ModalSub': 'FarmIQ jest dostępny w 12 językach. Możesz to zmienić w każdej chwili z menu.', 'Continue': 'Dalej',
  },
  ro: {
    'Home': 'Acasă', 'How It Works': 'Cum Funcționează', 'Farmer App / Sign In': 'Aplicație / Autentificare',
    'Weather & Advisory': 'Vreme și Consultanță', 'Farm Assistant': 'Asistent Agricol', 'Pricing': 'Prețuri',
    'Resources / Blog': 'Resurse / Blog', 'About & Investors': 'Despre Noi și Investitori', 'FAQ': 'Întrebări Frecvente',
    'Contact': 'Contact', 'Sign In': 'Autentificare', 'Sign Out': 'Deconectare',
    'Try Farmer App': 'Încearcă Aplicația', 'See Pricing': 'Vezi Prețurile',
    'Smarter Crop Timing.': 'Planificare Mai Inteligentă a Culturilor.', 'Direct to You.': 'Direct Către Tine.',
    'HeroSub': 'Prognoze pe 15 zile, consultanță AI și un asistent agricol — la prețul unui sac de semințe pe lună. Fără intermediari, fără prețuri enterprise.',
    'FooterTagline': 'Vreme și consultanță agricolă, direct pentru fermieri.',
    'ModalTitle': 'Alege-ți limba', 'ModalSub': 'FarmIQ este disponibil în 12 limbi. Poți schimba oricând din meniu.', 'Continue': 'Continuă',
  },
  sv: {
    'Home': 'Hem', 'How It Works': 'Så Fungerar Det', 'Farmer App / Sign In': 'App / Logga In',
    'Weather & Advisory': 'Väder & Rådgivning', 'Farm Assistant': 'Gårdsassistent', 'Pricing': 'Priser',
    'Resources / Blog': 'Resurser / Blogg', 'About & Investors': 'Om Oss & Investerare', 'FAQ': 'Vanliga Frågor',
    'Contact': 'Kontakt', 'Sign In': 'Logga in', 'Sign Out': 'Logga ut',
    'Try Farmer App': 'Testa Appen', 'See Pricing': 'Se Priser',
    'Smarter Crop Timing.': 'Smartare Odlingstiming.', 'Direct to You.': 'Direkt Till Dig.',
    'HeroSub': '15-dagarsprognoser, AI-rådgivning och en gårdsassistent — till priset av en säck utsäde i månaden. Ingen mellanhand, inga företagspriser.',
    'FooterTagline': 'Väder och odlingsrådgivning, direkt till bönder.',
    'ModalTitle': 'Välj ditt språk', 'ModalSub': 'FarmIQ finns på 12 språk. Du kan ändra det när som helst i menyn.', 'Continue': 'Fortsätt',
  },
  da: {
    'Home': 'Hjem', 'How It Works': 'Sådan Fungerer Det', 'Farmer App / Sign In': 'App / Log Ind',
    'Weather & Advisory': 'Vejr & Rådgivning', 'Farm Assistant': 'Gårdassistent', 'Pricing': 'Priser',
    'Resources / Blog': 'Ressourcer / Blog', 'About & Investors': 'Om Os & Investorer', 'FAQ': 'Ofte Stillede Spørgsmål',
    'Contact': 'Kontakt', 'Sign In': 'Log ind', 'Sign Out': 'Log ud',
    'Try Farmer App': 'Prøv Appen', 'See Pricing': 'Se Priser',
    'Smarter Crop Timing.': 'Klogere Afgrødetiming.', 'Direct to You.': 'Direkte Til Dig.',
    'HeroSub': '15-dages prognoser, AI-rådgivning og en gårdassistent — til prisen af en sæk frø om måneden. Ingen mellemmand, ingen erhvervspriser.',
    'FooterTagline': 'Vejr og afgrøderådgivning, direkte til landmænd.',
    'ModalTitle': 'Vælg dit sprog', 'ModalSub': 'FarmIQ findes på 12 sprog. Du kan ændre det når som helst i menuen.', 'Continue': 'Fortsæt',
  },
  fi: {
    'Home': 'Etusivu', 'How It Works': 'Näin Se Toimii', 'Farmer App / Sign In': 'Sovellus / Kirjaudu',
    'Weather & Advisory': 'Sää ja Neuvonta', 'Farm Assistant': 'Tila-avustaja', 'Pricing': 'Hinnoittelu',
    'Resources / Blog': 'Resurssit / Blogi', 'About & Investors': 'Meistä ja Sijoittajat', 'FAQ': 'UKK',
    'Contact': 'Yhteystiedot', 'Sign In': 'Kirjaudu sisään', 'Sign Out': 'Kirjaudu ulos',
    'Try Farmer App': 'Kokeile Sovellusta', 'See Pricing': 'Katso Hinnat',
    'Smarter Crop Timing.': 'Älykkäämpi Viljelyn Ajoitus.', 'Direct to You.': 'Suoraan Sinulle.',
    'HeroSub': '15 päivän ennusteet, tekoälyneuvonta ja tila-avustaja — siemenpussin hintaan kuukaudessa. Ei välikäsiä, ei yrityshinnoittelua.',
    'FooterTagline': 'Sää ja viljelyneuvonta, suoraan viljelijöille.',
    'ModalTitle': 'Valitse kielesi', 'ModalSub': 'FarmIQ on saatavilla 12 kielellä. Voit vaihtaa sen milloin tahansa valikosta.', 'Continue': 'Jatka',
  },
  pt: {
    'Home': 'Início', 'How It Works': 'Como Funciona', 'Farmer App / Sign In': 'App / Entrar',
    'Weather & Advisory': 'Clima e Consultoria', 'Farm Assistant': 'Assistente Agrícola', 'Pricing': 'Preços',
    'Resources / Blog': 'Recursos / Blog', 'About & Investors': 'Sobre Nós e Investidores', 'FAQ': 'Perguntas Frequentes',
    'Contact': 'Contato', 'Sign In': 'Entrar', 'Sign Out': 'Sair',
    'Try Farmer App': 'Testar o App', 'See Pricing': 'Ver Preços',
    'Smarter Crop Timing.': 'Timing de Cultivo Mais Inteligente.', 'Direct to You.': 'Direto Para Você.',
    'HeroSub': 'Previsões de 15 dias, consultoria com IA e um assistente agrícola — pelo preço de um saco de sementes por mês. Sem intermediários, sem preços empresariais.',
    'FooterTagline': 'Clima e consultoria agrícola, direto para os agricultores.',
    'ModalTitle': 'Escolha o seu idioma', 'ModalSub': 'O FarmIQ está disponível em 12 idiomas. Você pode mudar isso a qualquer momento no menu.', 'Continue': 'Continuar',
  },
};

function farmiqApplyTranslation(langCode) {
  const dict = FARMIQ_DICT[langCode];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict && dict[key]) {
      el.textContent = dict[key];
    } else {
      el.textContent = el.dataset.i18nOriginal || FARMIQ_I18N_KEYS[key] || el.textContent;
    }
  });
}

function farmiqInitI18nTags() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    if (!el.dataset.i18nOriginal) el.dataset.i18nOriginal = el.textContent;
  });
  const savedLang = localStorage.getItem('farmiq_lang') || 'en';
  if (savedLang !== 'en') farmiqApplyTranslation(savedLang);
}

function farmiqSetLanguage(code) {
  localStorage.setItem('farmiq_lang', code);
  farmiqApplyTranslation(code);
  document.querySelectorAll('.lang-select').forEach(sel => { sel.value = code; });
}

/* Full-screen first-visit language modal — the first thing a new visitor sees. */
function farmiqShowLanguageModal() {
  if (localStorage.getItem('farmiq_lang_chosen')) return;

  const overlay = document.createElement('div');
  overlay.className = 'lang-modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Choose your language');

  const grid = FARMIQ_LANGS.map(([code, name]) => `
    <button type="button" class="lang-modal-opt" data-lang="${code}">${name}</button>
  `).join('');

  overlay.innerHTML = `
    <div class="lang-modal-card">
      <div class="eyebrow">🌍 Welcome to FarmIQ</div>
      <h2 id="lang-modal-title" style="font-size:1.6rem">Choose your language</h2>
      <p style="max-width:44ch">FarmIQ is available in 12 languages. You can change this anytime from the menu.</p>
      <div class="lang-modal-grid">${grid}</div>
      <button type="button" class="btn btn-secondary btn-sm" id="lang-modal-skip" style="margin-top:18px">Continue in English</button>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  function choose(code) {
    localStorage.setItem('farmiq_lang_chosen', 'true');
    if (code && code !== 'en') farmiqSetLanguage(code);
    else localStorage.setItem('farmiq_lang', 'en');
    overlay.remove();
    document.body.style.overflow = '';
  }

  overlay.querySelectorAll('.lang-modal-opt').forEach(btn => {
    btn.addEventListener('click', () => choose(btn.dataset.lang));
  });
  document.getElementById('lang-modal-skip').addEventListener('click', () => choose('en'));
}
