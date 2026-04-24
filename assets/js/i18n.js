const ReBoneI18n = (() => {
  const SUPPORTED_LANGS = ['zh', 'en'];
  const DEFAULT_LANG = 'zh';
  const STORAGE_KEY = 'rebone-site-lang';
  let siteConfigCache = null;

  function normalizeLang(value) {
    if (!value) return DEFAULT_LANG;
    const normalized = String(value).toLowerCase().trim();
    return SUPPORTED_LANGS.includes(normalized) ? normalized : DEFAULT_LANG;
  }

  function getQueryLang() {
    const params = new URLSearchParams(window.location.search);
    return normalizeLang(params.get('lang'));
  }

  function getSavedLang() {
    try {
      return normalizeLang(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      return DEFAULT_LANG;
    }
  }

  function getCurrentLang() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('lang')) return getQueryLang();
    return getSavedLang();
  }

  function updateDocumentLang(lang) {
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    document.documentElement.dataset.lang = lang;
  }

  function syncUrl(lang) {
    const url = new URL(window.location.href);
    if (lang === DEFAULT_LANG) {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', lang);
    }
    window.history.replaceState({}, '', url.toString());
  }

  function setCurrentLang(lang, { reload = true } = {}) {
    const next = normalizeLang(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    syncUrl(next);
    updateDocumentLang(next);
    if (reload) window.location.reload();
    return next;
  }

  async function fetchResource(path) {
    const response = await fetch(path);
    if (!response.ok) {
      const error = new Error(`Failed to load ${path}: ${response.status}`);
      error.status = response.status;
      error.path = path;
      throw error;
    }
    return response;
  }

  function getContentPath(fileName, lang = getCurrentLang()) {
    return `content/${lang}/${fileName}`;
  }

  async function loadJson(fileName) {
    const currentLang = getCurrentLang();
    const localizedExists = hasLocalizedFile(fileName, currentLang);
    if (currentLang !== DEFAULT_LANG && localizedExists === false) {
      console.warn(`[i18n] Missing ${fileName} for ${currentLang}, fallback to zh.`);
      return await (await fetchResource(getContentPath(fileName, DEFAULT_LANG))).json();
    }

    try {
      return await (await fetchResource(getContentPath(fileName, currentLang))).json();
    } catch (error) {
      if (currentLang !== DEFAULT_LANG && error.status === 404) {
        console.warn(`[i18n] Missing ${fileName} for ${currentLang}, fallback to zh.`);
        return await (await fetchResource(getContentPath(fileName, DEFAULT_LANG))).json();
      }
      throw error;
    }
  }

  async function loadText(fileName) {
    const currentLang = getCurrentLang();
    const localizedExists = hasLocalizedFile(fileName, currentLang);
    if (currentLang !== DEFAULT_LANG && localizedExists === false) {
      console.warn(`[i18n] Missing ${fileName} for ${currentLang}, fallback to zh.`);
      return await (await fetchResource(getContentPath(fileName, DEFAULT_LANG))).text();
    }

    try {
      return await (await fetchResource(getContentPath(fileName, currentLang))).text();
    } catch (error) {
      if (currentLang !== DEFAULT_LANG && error.status === 404) {
        console.warn(`[i18n] Missing ${fileName} for ${currentLang}, fallback to zh.`);
        return await (await fetchResource(getContentPath(fileName, DEFAULT_LANG))).text();
      }
      throw error;
    }
  }

  function defaultSiteConfig() {
    return {
      nav: {
        brand: 'ReBone',
        solutions: 'Solutions',
        expressions: 'Expressions',
        reflections: 'Reflections',
        readme: 'README.md'
      },
      footer: getCurrentLang() === 'en' ? '© 2025 ReBone. All rights reserved.' : '© 2025 ReBone. 保留所有权利。',
      language_switch: {
        zh: '中文',
        en: 'EN'
      },
      available_content: ['site.json']
    };
  }

  function hasLocalizedFile(fileName, lang = getCurrentLang()) {
    if (lang === DEFAULT_LANG) return true;
    const available = siteConfigCache?.available_content;
    if (!Array.isArray(available)) return null;
    return available.includes(fileName);
  }

  function createLanguageSwitch(site) {
    const currentLang = getCurrentLang();
    const wrapper = document.createElement('span');
    wrapper.dataset.languageSwitch = 'true';
    wrapper.className = 'inline-flex items-center gap-1.5 ml-3 text-white text-sm align-middle';

    const zhButton = document.createElement('button');
    zhButton.type = 'button';
    zhButton.textContent = site.language_switch?.zh || '中文';
    zhButton.className = currentLang === 'zh' ? 'underline underline-offset-4 font-semibold' : 'opacity-80 hover:opacity-100';
    zhButton.addEventListener('click', () => setCurrentLang('zh'));

    const slash = document.createElement('span');
    slash.textContent = '/';
    slash.className = 'opacity-70';

    const enButton = document.createElement('button');
    enButton.type = 'button';
    enButton.textContent = site.language_switch?.en || 'EN';
    enButton.className = currentLang === 'en' ? 'underline underline-offset-4 font-semibold' : 'opacity-80 hover:opacity-100';
    enButton.addEventListener('click', () => setCurrentLang('en'));

    wrapper.appendChild(zhButton);
    wrapper.appendChild(slash);
    wrapper.appendChild(enButton);
    return wrapper;
  }

  function applySiteChrome(site) {
    updateDocumentLang(getCurrentLang());

    const nav = document.querySelector('nav');
    if (nav) {
      const brand = nav.querySelector('a[href="index.html"]');
      const solutions = nav.querySelector('a[href="solutions.html"]');
      const expressions = nav.querySelector('a[href="expressions.html"]');
      const reflections = nav.querySelector('a[href="reflections.html"]');
      const readme = nav.querySelector('a[href="readme.html"]');
      if (brand) brand.textContent = site.nav?.brand || 'ReBone';
      if (solutions) solutions.textContent = site.nav?.solutions || 'Solutions';
      if (expressions) expressions.textContent = site.nav?.expressions || 'Expressions';
      if (reflections) reflections.textContent = site.nav?.reflections || 'Reflections';
      if (readme) readme.textContent = site.nav?.readme || 'README.md';

      const navLinksContainer = nav.querySelector('div');
      if (navLinksContainer) {
        const existingSwitch = navLinksContainer.querySelector('[data-language-switch="true"]');
        if (existingSwitch) existingSwitch.remove();
        navLinksContainer.appendChild(createLanguageSwitch(site));
      }
    }

    const footer = document.querySelector('footer');
    if (footer && site.footer) {
      footer.textContent = site.footer;
    }
  }

  async function initSiteChrome() {
    let site = defaultSiteConfig();
    try {
      site = await loadJson('site.json');
    } catch (error) {
      console.warn('[i18n] Failed to load site.json, using defaults.', error);
    }
    siteConfigCache = site;
    applySiteChrome(site);
    return site;
  }

  return {
    DEFAULT_LANG,
    SUPPORTED_LANGS,
    getCurrentLang,
    setCurrentLang,
    getContentPath,
    loadJson,
    loadText,
    initSiteChrome,
    updateDocumentLang,
  };
})();

window.ReBoneI18n = ReBoneI18n;
