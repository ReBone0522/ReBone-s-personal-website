async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
  return response.json();
}

async function loadText(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
  return response.text();
}

async function loadLocalizedJson(fileName) {
  if (window.ReBoneI18n?.loadJson) return window.ReBoneI18n.loadJson(fileName);
  return loadJson(`content/zh/${fileName}`);
}

async function loadLocalizedText(fileName) {
  if (window.ReBoneI18n?.loadText) return window.ReBoneI18n.loadText(fileName);
  return loadText(`content/zh/${fileName}`);
}

function createElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function isEnglishLang() {
  return window.ReBoneI18n?.getCurrentLang?.() === 'en';
}

function applyEnglishReadingMode(root, { article = false } = {}) {
  if (!root || !isEnglishLang()) return;

  if (article) root.classList.add('english-reading-article');

  root.querySelectorAll('p').forEach((el) => {
    if (el.classList.contains('text-xs') || el.classList.contains('text-sm')) return;
    el.classList.add('english-reading-body');
  });

  root.querySelectorAll('li').forEach((el) => {
    el.classList.add('english-reading-list');
  });

  root.querySelectorAll('blockquote').forEach((el) => {
    el.classList.add('english-reading-quote');
  });

  root.querySelectorAll('code').forEach((el) => {
    el.classList.add('english-reading-code');
  });

  root.querySelectorAll('h1, h2, h3, h4').forEach((el) => {
    el.classList.add('english-reading-heading');
  });

  root.querySelectorAll('h1').forEach((el) => {
    el.classList.add('english-reading-display');
  });

  root.querySelectorAll('h2').forEach((el) => {
    el.classList.add('english-reading-section-title');
  });

  root.querySelectorAll('h3, h4').forEach((el) => {
    el.classList.add('english-reading-subtitle');
  });
}

function appendParagraphs(parent, paragraphs, className = 'text-gray-700') {
  for (const paragraph of paragraphs || []) {
    parent.appendChild(createElement('p', className, paragraph));
  }
}

function appendList(parent, items, { ordered = false, className = 'space-y-2 text-sm text-gray-700 list-disc list-inside' } = {}) {
  const list = createElement(ordered ? 'ol' : 'ul', className);
  for (const item of items || []) {
    list.appendChild(createElement('li', '', item));
  }
  parent.appendChild(list);
  return list;
}

function renderHome(home, updates) {
  const heading = document.getElementById('home-heading');
  const introLabel = document.getElementById('home-intro-label');
  const introPoints = document.getElementById('home-intro-points');
  const links = document.getElementById('home-links');
  const updatesLabel = document.getElementById('updates-label');
  const updatesTitle = document.getElementById('updates-title');
  const updatesIntro = document.getElementById('updates-intro');
  const updatesList = document.getElementById('updates-list');
  const credits = document.getElementById('home-credits');

  if (!heading || !introLabel || !introPoints || !links || !updatesIntro || !updatesList || !credits) return;

  heading.textContent = home.heading || '';
  introLabel.textContent = home.intro_label || '';
  introPoints.innerHTML = '';
  for (const point of home.intro_points || []) {
    const li = createElement('li', 'pl-1', point);
    introPoints.appendChild(li);
  }

  links.innerHTML = '';
  for (const item of home.sections || []) {
    const anchor = createElement('a', 'group block');
    anchor.href = item.href;

    const row = createElement('div', 'flex items-center space-x-2');
    row.appendChild(createElement('span', 'text-lg text-black underline group-hover:text-gray-800 transition', item.title));
    row.appendChild(createElement('span', 'text-black text-sm group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform', '↗'));
    anchor.appendChild(row);
    anchor.appendChild(createElement('p', 'text-sm text-gray-500 mt-1', item.description));
    links.appendChild(anchor);
  }

  if (updatesLabel) updatesLabel.textContent = home.updates_label || 'Updates';
  if (updatesTitle) updatesTitle.textContent = home.updates_title || '';
  updatesIntro.textContent = home.updates_intro || '';
  updatesList.innerHTML = '';
  for (const item of updates.items || []) {
    const li = createElement('li', 'border-l-2 border-gray-300 pl-4');
    li.appendChild(createElement('p', 'text-xs text-gray-400 mb-1', item.date || ''));
    const p = createElement('p', 'text-sm text-gray-700');
    const strong = document.createElement('strong');
    if (item.href) {
      const a = createElement('a', 'underline underline-offset-4', item.title || '');
      a.href = item.href;
      strong.appendChild(a);
    } else {
      strong.textContent = item.title || '';
    }
    p.appendChild(strong);
    li.appendChild(p);
    li.appendChild(createElement('p', 'text-sm text-gray-500 mt-1', item.summary || ''));
    updatesList.appendChild(li);
  }

  credits.innerHTML = '';
  for (const line of home.credits || []) {
    credits.appendChild(createElement('p', '', line));
  }
}

function renderSolutions(data) {
  const title = document.getElementById('solutions-title');
  const intro = document.getElementById('solutions-intro');
  const filters = document.getElementById('solutions-filters');
  const cards = document.getElementById('solutions-cards');
  if (!title || !intro || !filters || !cards) return;

  title.textContent = data.title || 'Solutions';
  intro.textContent = data.intro || '';

  filters.innerHTML = '';
  for (const label of data.filters || []) {
    const isPrimary = label === (data.filters || [])[0];
    const btn = createElement('button', isPrimary
      ? 'px-4 py-2 bg-gray-800 text-white text-sm rounded'
      : 'px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300', label);
    btn.type = 'button';
    filters.appendChild(btn);
  }

  cards.innerHTML = '';
  for (const card of data.cards || []) {
    const anchor = createElement('a', 'block group');
    anchor.href = card.href;

    const article = createElement('article', 'bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer');
    const imageWrap = createElement('div', 'h-48 overflow-hidden');
    const img = document.createElement('img');
    img.src = card.image;
    img.alt = card.image_alt || card.title || '';
    img.className = 'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105';
    imageWrap.appendChild(img);
    article.appendChild(imageWrap);

    const body = createElement('div', 'p-6');
    const header = createElement('div', 'flex justify-between items-start gap-3 mb-2');
    header.appendChild(createElement('h3', 'text-xl font-semibold', card.title));
    const tags = createElement('div', 'flex flex-wrap gap-2 justify-end');
    for (const tag of card.tags || []) {
      tags.appendChild(createElement('span', 'text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded', tag));
    }
    header.appendChild(tags);
    body.appendChild(header);
    body.appendChild(createElement('p', 'text-sm text-gray-500 mb-4', card.date || ''));

    const content = createElement('div', 'space-y-3 text-sm text-gray-700 leading-relaxed');
    content.appendChild(createElement('p', '', card.summary || ''));
    if (card.quote) {
      content.appendChild(createElement('div', 'p-3 bg-gray-50 border-l-4 border-gray-400 italic text-gray-600', card.quote));
    }
    body.appendChild(content);
    article.appendChild(body);
    anchor.appendChild(article);
    cards.appendChild(anchor);
  }
}

function renderRestraint(data) {
  const titleEls = document.querySelectorAll('[data-restraint-title]');
  const eyebrow = document.getElementById('restraint-eyebrow');
  const date = document.getElementById('restraint-date');
  const summary = document.getElementById('restraint-summary');
  const breadcrumb = document.getElementById('restraint-breadcrumb');
  const nav = document.getElementById('restraint-side-nav');
  const content = document.getElementById('restraint-content');
  if (!eyebrow || !date || !summary || !breadcrumb || !nav || !content) return;

  for (const el of titleEls) el.textContent = data.meta.title || '';
  eyebrow.textContent = data.meta.eyebrow || '';
  date.textContent = data.meta.date || '';
  summary.textContent = data.meta.summary || '';
  breadcrumb.textContent = data.meta.breadcrumb || '';

  nav.innerHTML = '';
  for (const item of data.nav || []) {
    const a = createElement('a', 'block px-3 py-2 rounded-lg hover:bg-gray-100 nav-item', item.label);
    a.href = `#${item.id}`;
    nav.appendChild(a);
  }

  content.innerHTML = '';
  for (const section of data.sections || []) {
    const sectionEl = createElement('section', 'content-section mb-12 space-y-6');
    sectionEl.id = section.id;

    if (section.layout === 'overview') {
      const card = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm');
      const grid = createElement('div', 'grid gap-8 lg:grid-cols-[1.25fr_0.75fr] items-start');
      const left = document.createElement('div');
      left.appendChild(createElement('p', 'text-sm text-gray-500 mb-2', section.eyebrow || ''));
      left.appendChild(createElement('h2', 'text-3xl font-semibold text-gray-900 mb-4', section.headline || section.title));
      appendParagraphs(left, section.paragraphs, 'text-gray-700 mb-4');
      if (section.quote) left.appendChild(createElement('div', 'border-l-4 border-gray-400 bg-gray-50 px-4 py-3 italic text-gray-700', section.quote));
      grid.appendChild(left);
      if (section.image) {
        const img = document.createElement('img');
        img.src = section.image.src;
        img.alt = section.image.alt || '';
        img.className = 'w-full rounded-2xl border border-gray-200 object-cover';
        grid.appendChild(img);
      }
      card.appendChild(grid);
      sectionEl.appendChild(card);

      const statsGrid = createElement('div', 'grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-6');
      for (const stat of section.stats || []) {
        const statCard = createElement('div', 'bg-white border border-gray-200 rounded-xl p-5');
        statCard.appendChild(createElement('p', 'text-sm text-gray-500 mb-2', stat.title));
        if (stat.text) statCard.appendChild(createElement('p', 'text-sm text-gray-700', stat.text));
        if (stat.items) appendList(statCard, stat.items, { className: 'space-y-2 text-sm text-gray-700' });
        statsGrid.appendChild(statCard);
      }
      sectionEl.appendChild(statsGrid);
    }

    if (section.layout === 'two-column-note') {
      const grid = createElement('div', 'grid gap-6 lg:grid-cols-[1.05fr_0.95fr] items-start');
      const left = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-4');
      left.appendChild(createElement('h2', 'text-2xl font-semibold text-gray-900', section.title));
      appendParagraphs(left, section.paragraphs, 'text-gray-700');
      grid.appendChild(left);
      const figure = createElement('figure', 'bg-white border border-gray-200 rounded-2xl p-5 shadow-sm');
      const img = document.createElement('img');
      img.src = section.note_image.src;
      img.alt = section.note_image.alt || '';
      img.className = 'w-full rounded-xl border border-gray-200';
      figure.appendChild(img);
      figure.appendChild(createElement('figcaption', 'text-sm text-gray-500 mt-3', section.note_image.caption || ''));
      grid.appendChild(figure);
      sectionEl.appendChild(grid);
    }

    if (section.layout === 'research') {
      const primary = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm');
      primary.appendChild(createElement('h2', 'text-2xl font-semibold text-gray-900 mb-4', section.title));
      primary.appendChild(createElement('p', 'text-gray-700 mb-4', section.intro || ''));
      const cols = createElement('div', 'grid gap-4 md:grid-cols-2');
      for (const col of section.risk_columns || []) {
        const box = createElement('div', 'rounded-xl border border-gray-200 bg-gray-50 p-5');
        box.appendChild(createElement('p', 'text-sm text-gray-500 mb-2', col.title));
        appendList(box, col.items, { className: 'space-y-2 text-sm text-gray-700 list-disc list-inside' });
        cols.appendChild(box);
      }
      primary.appendChild(cols);
      const caseBox = createElement('div', 'mt-6 rounded-xl border border-gray-200 p-5');
      caseBox.appendChild(createElement('p', 'text-sm text-gray-500 mb-2', section.case_box.title));
      caseBox.appendChild(createElement('p', 'text-gray-700 mb-3', section.case_box.text));
      const link = createElement('a', 'text-sm underline underline-offset-4 text-gray-700', section.case_box.link.label);
      link.href = section.case_box.link.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      caseBox.appendChild(link);
      primary.appendChild(caseBox);
      sectionEl.appendChild(primary);

      const sub = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm');
      sub.appendChild(createElement('h3', 'text-xl font-semibold text-gray-900 mb-4', section.subsection.title));
      appendParagraphs(sub, section.subsection.paragraphs, 'text-gray-700 mb-4');
      sectionEl.appendChild(sub);
    }

    if (section.layout === 'care-log') {
      const introCard = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm');
      introCard.appendChild(createElement('h2', 'text-2xl font-semibold text-gray-900 mb-4', section.title));
      appendParagraphs(introCard, section.intro_paragraphs, 'text-gray-700 mb-4');
      sectionEl.appendChild(introCard);
      const grid = createElement('div', 'grid gap-6 lg:grid-cols-2');
      for (const card of section.cards || []) {
        const box = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-4');
        box.appendChild(createElement('h3', 'text-xl font-semibold text-gray-900', card.title));
        appendParagraphs(box, card.paragraphs, 'text-gray-700');
        if (card.quote) box.appendChild(createElement('div', 'border-l-4 border-gray-400 bg-gray-50 px-4 py-3 italic text-gray-700', card.quote));
        grid.appendChild(box);
      }
      sectionEl.appendChild(grid);
    }

    if (section.layout === 'product-study') {
      const card = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm');
      card.appendChild(createElement('h2', 'text-2xl font-semibold text-gray-900 mb-4', section.title));
      card.appendChild(createElement('p', 'text-gray-700 mb-6', section.intro || ''));
      const grid = createElement('div', 'grid gap-4 md:grid-cols-3');
      for (const item of section.cards || []) {
        const box = createElement('div', 'rounded-xl border border-gray-200 bg-gray-50 p-5');
        box.appendChild(createElement('p', 'font-semibold text-gray-900 mb-2', item.title));
        box.appendChild(createElement('p', 'text-sm text-gray-700', item.text));
        grid.appendChild(box);
      }
      card.appendChild(grid);
      const closing = createElement('div', 'mt-6 rounded-xl border border-gray-200 p-5');
      closing.appendChild(createElement('p', 'text-gray-700', section.closing || ''));
      card.appendChild(closing);
      sectionEl.appendChild(card);
    }

    if (section.layout === 'prototype') {
      const card = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm');
      card.appendChild(createElement('h2', 'text-2xl font-semibold text-gray-900 mb-6', section.title));
      const wrap = createElement('div', 'space-y-8');
      (section.versions || []).forEach((version, index) => {
        const block = createElement('div', index ? 'border-t border-gray-200 pt-8' : '');
        const header = createElement('div', 'flex items-center justify-between gap-4 mb-3');
        header.appendChild(createElement('h3', 'text-xl font-semibold text-gray-900', version.title));
        header.appendChild(createElement('span', 'text-sm text-gray-500', version.tag || ''));
        block.appendChild(header);
        block.appendChild(createElement('p', 'text-gray-700 mb-4', version.intro || ''));
        appendList(block, version.items, { className: 'space-y-2 text-sm text-gray-700 list-disc list-inside' });
        wrap.appendChild(block);
      });
      card.appendChild(wrap);
      sectionEl.appendChild(card);
    }

    if (section.layout === 'notes') {
      const card = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-5');
      card.appendChild(createElement('h2', 'text-2xl font-semibold text-gray-900', section.title));
      appendParagraphs(card, section.paragraphs, 'text-gray-700');
      card.appendChild(createElement('div', 'border-l-4 border-gray-400 bg-gray-50 px-4 py-3 italic text-gray-700', section.quote || ''));
      sectionEl.appendChild(card);
    }

    if (section.layout === 'production') {
      const card = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm');
      card.appendChild(createElement('h2', 'text-2xl font-semibold text-gray-900 mb-6', section.title));
      const stack = createElement('div', 'space-y-6');
      for (const block of section.blocks || []) {
        if (block.title && block.items) {
          const el = document.createElement('div');
          el.appendChild(createElement('h3', 'text-lg font-semibold text-gray-900 mb-3', block.title));
          appendList(el, block.items, { className: 'space-y-2 text-sm text-gray-700 list-disc list-inside' });
          stack.appendChild(el);
        }
        if (block.cards) {
          const grid = createElement('div', 'grid gap-4 md:grid-cols-2');
          for (const item of block.cards) {
            const box = createElement('div', 'rounded-xl border border-gray-200 bg-gray-50 p-5');
            box.appendChild(createElement('h3', 'text-lg font-semibold text-gray-900 mb-3', item.title));
            appendList(box, item.items, { className: 'space-y-2 text-sm text-gray-700 list-disc list-inside' });
            grid.appendChild(box);
          }
          stack.appendChild(grid);
        }
        if (block.stages) {
          const wrapper = document.createElement('div');
          wrapper.appendChild(createElement('h3', 'text-lg font-semibold text-gray-900 mb-3', block.title));
          const stageGrid = createElement('div', 'grid gap-4 md:grid-cols-2');
          for (const stage of block.stages) {
            const box = createElement('div', 'rounded-xl border border-gray-200 p-5');
            box.appendChild(createElement('p', 'font-semibold text-gray-900 mb-2', stage.title));
            box.appendChild(createElement('p', 'text-sm text-gray-700', stage.text));
            stageGrid.appendChild(box);
          }
          wrapper.appendChild(stageGrid);
          const compareGrid = createElement('div', 'grid gap-4 md:grid-cols-2 mt-4');
          for (const comp of block.compare || []) {
            const box = createElement('div', 'rounded-xl border border-gray-200 bg-gray-50 p-5');
            box.appendChild(createElement('p', 'font-semibold text-gray-900 mb-2', comp.title));
            appendList(box, comp.items, { className: 'space-y-2 text-sm text-gray-700 list-disc list-inside' });
            compareGrid.appendChild(box);
          }
          wrapper.appendChild(compareGrid);
          stack.appendChild(wrapper);
        }
        if (block.title && block.support_cards) {
          const wrapper = document.createElement('div');
          wrapper.appendChild(createElement('h3', 'text-lg font-semibold text-gray-900 mb-3', block.title));
          const grid = createElement('div', 'grid gap-4 md:grid-cols-2 xl:grid-cols-4');
          for (const item of block.support_cards) {
            const box = createElement('div', 'rounded-xl border border-gray-200 p-5');
            box.appendChild(createElement('p', 'font-semibold text-gray-900 mb-2', item.title));
            box.appendChild(createElement('p', 'text-sm text-gray-700', item.text));
            grid.appendChild(box);
          }
          wrapper.appendChild(grid);
          wrapper.appendChild(createElement('p', 'text-sm text-gray-700 mt-4', block.closing || ''));
          stack.appendChild(wrapper);
        }
      }
      card.appendChild(stack);
      sectionEl.appendChild(card);
    }

    if (section.layout === 'thanks') {
      const card = createElement('div', 'bg-white border border-gray-200 rounded-2xl p-8 shadow-sm');
      card.appendChild(createElement('h2', 'text-2xl font-semibold text-gray-900 mb-5', section.title));
      const wrap = createElement('div', 'space-y-3 text-gray-700');
      for (const item of section.items || []) wrap.appendChild(createElement('p', '', item));
      card.appendChild(wrap);
      sectionEl.appendChild(card);
    }

    content.appendChild(sectionEl);
  }

  applyEnglishReadingMode(content);

  const sections = document.querySelectorAll('.content-section');
  const navItems = document.querySelectorAll('.nav-item');
  function updateActiveNav() {
    let current = data.nav?.[0]?.id || '';
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 140) current = section.id;
    });
    navItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('href') === `#${current}`);
    });
  }
  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();
}

function renderExpressions(data) {
  const title = document.getElementById('expressions-title');
  const intro = document.getElementById('expressions-intro');
  const categories = document.getElementById('expressions-categories');
  const previewLabel = document.getElementById('expressions-preview-label');
  const previewLinkLabel = document.getElementById('expressions-preview-link-label');
  const previewTitle = document.getElementById('previewTitle');
  const previewText = document.getElementById('previewText');
  const previewItems = document.getElementById('previewItems');
  const previewTags = document.getElementById('previewTags');
  const previewLink = document.getElementById('previewLink');
  if (!title || !intro || !categories) return;

  title.textContent = data.title || 'Expressions';
  intro.innerHTML = '';
  (data.intro || []).forEach((paragraph, index) => {
    intro.appendChild(createElement('p', index === data.intro.length - 1 ? 'text-sm text-gray-500' : 'text-gray-700', paragraph));
  });
  if (previewLabel) previewLabel.textContent = data.preview_label || 'Preview';
  if (previewLinkLabel) previewLinkLabel.textContent = data.preview_link_label || '进入这个分类';

  categories.innerHTML = '';
  for (const item of data.categories || []) {
    const card = createElement('a', `category-card block rounded-2xl border border-gray-200 bg-gray-50 p-6${item.active ? ' active' : ''}`);
    card.href = item.href;
    card.dataset.section = item.id;

    const row = createElement('div', 'flex items-start justify-between gap-4');
    const left = document.createElement('div');
    left.appendChild(createElement('p', 'text-xs uppercase tracking-[0.25em] text-gray-400 mb-2', item.eyebrow));
    left.appendChild(createElement('h3', 'text-xl font-semibold mb-2', item.title));
    left.appendChild(createElement('p', 'text-sm text-gray-600', item.card_description));
    row.appendChild(left);
    row.appendChild(createElement('span', 'text-gray-400 text-lg', '↗'));
    card.appendChild(row);
    categories.appendChild(card);
  }

  const cardEls = () => document.querySelectorAll('#expressions-categories [data-section]');

  function renderPreview(sectionId) {
    const item = (data.categories || []).find(x => x.id === sectionId);
    if (!item) return;
    previewTitle.textContent = item.title;
    previewText.textContent = item.preview_text;
    previewItems.innerHTML = '';
    for (const entry of item.items || []) {
      previewItems.appendChild(createElement('div', 'rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700', entry));
    }
    previewTags.innerHTML = '';
    for (const tag of item.tags || []) {
      previewTags.appendChild(createElement('span', 'preview-pill', tag));
    }
    previewLink.href = item.href;
    cardEls().forEach(el => el.classList.remove('active'));
    const active = document.querySelector(`#expressions-categories [data-section="${sectionId}"]`);
    if (active) active.classList.add('active');
  }

  cardEls().forEach(card => {
    const section = card.dataset.section;
    card.addEventListener('mouseenter', () => renderPreview(section));
    card.addEventListener('focus', () => renderPreview(section));
    card.addEventListener('click', () => renderPreview(section));
  });

  renderPreview((data.categories || []).find(x => x.active)?.id || data.categories?.[0]?.id);
}

function renderReflections(data) {
  const title = document.getElementById('reflections-title');
  const subtitle = document.getElementById('reflections-subtitle');
  const intro = document.getElementById('reflections-intro');
  const footnote = document.getElementById('reflections-footnote');
  const hint = document.getElementById('reflections-hint');
  const tooltip = document.getElementById('tooltip');
  const panel = document.getElementById('contentPanel');
  const panelTitle = document.getElementById('panelTitle');
  const panelContent = document.getElementById('panelContent');
  const closeBtn = document.getElementById('closePanelBtn');
  const venn = document.getElementById('vennDiagram');
  if (!title || !subtitle || !intro || !footnote || !hint || !tooltip || !panel || !panelTitle || !panelContent || !venn) return;

  title.textContent = data.title || 'Reflections';
  subtitle.textContent = data.subtitle || '';
  intro.innerHTML = '';
  (data.intro || []).forEach(text => intro.appendChild(createElement('p', 'mb-2', text)));
  footnote.textContent = data.footnote || '';
  hint.textContent = data.hint || '';

  const regionTextMap = {
    human: data.regions?.human?.title || '人类',
    me: data.regions?.me?.title || '我',
    animal: data.regions?.animal?.title || '动物',
    social: data.regions?.social?.title || '社交',
    interact: data.regions?.interact?.title || '交互',
    'human-animal': data.regions?.['human-animal']?.title || '人类×动物',
    life: data.regions?.life?.title || '生命',
  };
  document.querySelectorAll('#vennDiagram [data-section]').forEach(el => {
    const sectionId = el.dataset.section;
    if (el.classList.contains('circle-label') || el.classList.contains('intersection')) {
      el.textContent = regionTextMap[sectionId] || el.textContent;
    }
  });

  function showContent(sectionId) {
    const section = data.regions?.[sectionId];
    if (!section) return;
    panelTitle.textContent = section.title;
    panelContent.innerHTML = '';
    for (const item of section.items || []) {
      const wrap = createElement('div', 'content-item');
      if (item.subtitle) wrap.appendChild(createElement('h4', '', item.subtitle));
      const p = createElement('p', 'whitespace-pre-line', item.text || '');
      wrap.appendChild(p);
      if (item.date) wrap.appendChild(createElement('p', 'date-tag', item.date));
      panelContent.appendChild(wrap);
    }
    panel.classList.add('show');
    panel.scrollIntoView({ behavior: 'smooth' });
  }

  closeBtn?.addEventListener('click', () => panel.classList.remove('show'));

  document.querySelectorAll('#vennDiagram [data-section]').forEach(el => {
    el.addEventListener('mouseenter', e => {
      const section = data.regions?.[e.currentTarget.dataset.section];
      if (!section) return;
      tooltip.innerHTML = `<strong>${section.title}</strong><br><span style="color:#9ca3af">${(section.keywords || []).join(' · ')}</span>`;
      tooltip.classList.add('show');
      const rect = e.currentTarget.getBoundingClientRect();
      const container = venn.getBoundingClientRect();
      tooltip.style.left = `${rect.left - container.left + rect.width / 2 - 80}px`;
      tooltip.style.top = `${rect.top - container.top - 50}px`;
    });
    el.addEventListener('mouseleave', () => tooltip.classList.remove('show'));
    el.addEventListener('click', e => showContent(e.currentTarget.dataset.section));
  });
}

function renderVisualArchive(data) {
  const parent = document.getElementById('visual-breadcrumb-parent');
  const current = document.getElementById('visual-breadcrumb-current');
  const eyebrow = document.getElementById('visual-eyebrow');
  const title = document.getElementById('visual-title');
  const intro = document.getElementById('visual-intro');
  const works = document.getElementById('visual-works');
  if (!parent || !current || !eyebrow || !title || !intro || !works) return;

  parent.textContent = data.breadcrumb?.parent || 'Expressions';
  current.textContent = data.breadcrumb?.current || '';
  eyebrow.textContent = data.eyebrow || '';
  title.textContent = data.title || '';
  intro.innerHTML = '';
  appendParagraphs(intro, data.intro, 'text-gray-700');

  works.innerHTML = '';
  for (const item of data.works || []) {
    const article = createElement('article', 'bg-white rounded-2xl border border-gray-200 overflow-hidden');
    if (item.image?.src) {
      const img = document.createElement('img');
      img.src = item.image.src;
      img.alt = item.image.alt || item.title || '';
      img.className = 'h-72 w-full object-cover';
      article.appendChild(img);
    } else {
      const dark = item.image?.theme === 'dark';
      article.appendChild(createElement(
        'div',
        `h-72 flex items-center justify-center text-sm tracking-[0.2em] ${dark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`,
        item.image?.label || 'IMAGE PLACEHOLDER'
      ));
    }

    const body = createElement('div', 'p-6');
    const header = createElement('div', 'flex items-center justify-between gap-4 mb-3');
    header.appendChild(createElement('h3', 'text-xl font-semibold', item.title || ''));
    header.appendChild(createElement('span', 'text-xs text-gray-500', item.date || ''));
    body.appendChild(header);
    body.appendChild(createElement('p', 'text-sm text-gray-600 mb-4', item.summary || ''));
    if (item.quote) body.appendChild(createElement('blockquote', 'border-l-4 border-gray-300 pl-4 text-sm text-gray-600 italic', item.quote));
    article.appendChild(body);
    works.appendChild(article);
  }

  if (data.reserved) {
    const reserved = createElement('article', 'bg-white rounded-2xl border border-dashed border-gray-300 p-6 lg:col-span-2');
    const row = createElement('div', 'flex flex-col md:flex-row md:items-center md:justify-between gap-4');
    const left = document.createElement('div');
    left.appendChild(createElement('p', 'text-xs uppercase tracking-[0.25em] text-gray-400 mb-2', data.reserved.eyebrow || 'Reserved'));
    left.appendChild(createElement('h3', 'text-xl font-semibold mb-2', data.reserved.title || ''));
    left.appendChild(createElement('p', 'text-sm text-gray-600', data.reserved.text || ''));
    row.appendChild(left);
    row.appendChild(createElement('span', 'text-sm text-gray-400', data.reserved.tag || ''));
    reserved.appendChild(row);
    works.appendChild(reserved);
  }
}

function renderSoundArchive(data) {
  const parent = document.getElementById('sound-breadcrumb-parent');
  const current = document.getElementById('sound-breadcrumb-current');
  const eyebrow = document.getElementById('sound-eyebrow');
  const title = document.getElementById('sound-title');
  const intro = document.getElementById('sound-intro');
  const noticeTitle = document.getElementById('sound-notice-title');
  const noticeBody = document.getElementById('sound-notice-body');
  const noticeFootnote = document.getElementById('sound-notice-footnote');
  const sideNav = document.getElementById('sound-side-nav');
  const sectionsRoot = document.getElementById('sound-sections');
  if (!parent || !current || !eyebrow || !title || !intro || !noticeTitle || !noticeBody || !noticeFootnote || !sideNav || !sectionsRoot) return;

  parent.textContent = data.breadcrumb?.parent || 'Expressions';
  current.textContent = data.breadcrumb?.current || '';
  eyebrow.textContent = data.eyebrow || '';
  title.textContent = data.title || '';
  intro.innerHTML = '';
  appendParagraphs(intro, data.intro, 'text-gray-700');

  noticeTitle.textContent = data.notice?.title || '';
  noticeBody.innerHTML = '';
  (data.notice?.paragraphs || []).forEach((paragraph, index) => {
    const p = createElement('p', '', paragraph);
    if (index === (data.notice?.paragraphs || []).length - 1 && data.notice?.contact) {
      const link = createElement('a', 'underline underline-offset-4', data.notice.contact.label || '');
      link.href = data.notice.contact.href;
      p.appendChild(link);
    }
    noticeBody.appendChild(p);
  });
  noticeFootnote.textContent = data.notice?.footnote || '';

  sideNav.innerHTML = '';
  sectionsRoot.innerHTML = '';

  const createAudioCard = (item) => {
    const article = createElement('article', 'bg-white rounded-2xl border border-gray-200 p-5');
    const row = createElement('div', 'flex gap-4 items-start');
    row.appendChild(createElement('div', 'w-20 h-20 rounded-lg border border-dashed border-gray-300 bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] shrink-0', item.cover_label || '封面位'));
    const content = createElement('div', 'min-w-0 w-full');
    content.appendChild(createElement('h4', 'text-lg font-semibold mb-1', item.title || ''));
    if (item.quote) content.appendChild(createElement('p', 'text-sm text-gray-600 mb-1', item.quote));
    if (item.origin) content.appendChild(createElement('p', 'text-xs text-gray-500 mb-1', item.origin));
    if (item.credit) content.appendChild(createElement('p', 'text-xs text-gray-500 mb-2', item.credit));
    if (item.date) content.appendChild(createElement('p', 'text-xs text-gray-400 mb-2', item.date));
    row.appendChild(content);
    article.appendChild(row);
    if (item.audio?.src) {
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.preload = 'metadata';
      audio.className = 'w-full mt-3';
      const source = document.createElement('source');
      source.src = item.audio.src;
      if (item.audio.type) source.type = item.audio.type;
      audio.appendChild(source);
      article.appendChild(audio);
    }
    return article;
  };

  for (const section of data.sections || []) {
    const navLink = createElement('a', 'side-link block rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50', section.side_label || section.title || '');
    navLink.href = `#${section.id}`;
    navLink.dataset.sideLink = section.id;
    sideNav.appendChild(navLink);

    const sectionEl = createElement('section', 'scroll-mt-24');
    sectionEl.id = section.id;
    const header = createElement('div', 'flex items-end justify-between gap-4 mb-4');
    const left = document.createElement('div');
    left.appendChild(createElement('p', 'text-xs uppercase tracking-[0.25em] text-gray-400 mb-2', section.section_label || ''));
    left.appendChild(createElement('h3', 'text-2xl font-semibold', section.title || ''));
    header.appendChild(left);
    if (section.tag) header.appendChild(createElement('span', 'text-sm text-gray-400', section.tag));
    sectionEl.appendChild(header);

    if (section.note) sectionEl.appendChild(createElement('p', 'text-sm text-gray-600 mb-5', section.note));

    if (section.items?.length) {
      const grid = createElement('div', 'grid grid-cols-1 md:grid-cols-2 gap-6');
      section.items.forEach(item => grid.appendChild(createAudioCard(item)));
      sectionEl.appendChild(grid);
    }

    if (section.footnote) sectionEl.appendChild(createElement('p', 'text-xs text-gray-500 mt-5', section.footnote));

    if (section.wish || section.pricing) {
      const wrapper = createElement('div', 'bg-white rounded-2xl border border-gray-200 p-6 space-y-6 text-sm text-gray-700');
      if (section.wish) {
        const wish = createElement('div');
        wish.appendChild(createElement('p', 'font-semibold mb-3', section.wish.title || ''));
        wish.appendChild(createElement('p', 'text-gray-600 mb-3', section.wish.description || ''));
        const inputGrid = createElement('div', 'grid grid-cols-1 md:grid-cols-2 gap-3');
        const track = document.createElement('input');
        track.id = 'wishTrack';
        track.type = 'text';
        track.placeholder = section.wish.track_placeholder || '';
        track.className = 'rounded-lg border border-gray-300 px-3 py-2';
        inputGrid.appendChild(track);
        const artist = document.createElement('input');
        artist.id = 'wishArtist';
        artist.type = 'text';
        artist.placeholder = section.wish.artist_placeholder || '';
        artist.className = 'rounded-lg border border-gray-300 px-3 py-2';
        inputGrid.appendChild(artist);
        wish.appendChild(inputGrid);
        const note = document.createElement('textarea');
        note.id = 'wishNote';
        note.placeholder = section.wish.note_placeholder || '';
        note.className = 'mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 min-h-24';
        wish.appendChild(note);
        const actions = createElement('div', 'mt-3 flex flex-wrap gap-3');
        const button = createElement('button', 'rounded-lg bg-black text-white px-4 py-2 hover:bg-gray-800', section.wish.button_label || '提交许愿（邮件）');
        button.id = 'sendWish';
        button.type = 'button';
        actions.appendChild(button);
        actions.appendChild(createElement('span', 'text-xs text-gray-500 self-center', section.wish.hint || ''));
        wish.appendChild(actions);
        wrapper.appendChild(wish);
      }

      if (section.pricing) {
        const pricing = createElement('div');
        pricing.appendChild(createElement('p', 'font-semibold mb-3', section.pricing.title || ''));
        const overflow = createElement('div', 'overflow-x-auto');
        const table = createElement('table', 'min-w-full text-sm border border-gray-200 rounded-xl overflow-hidden');
        const thead = createElement('thead', 'bg-gray-50 text-gray-700');
        const headRow = document.createElement('tr');
        (section.pricing.columns || []).forEach(label => {
          headRow.appendChild(createElement('th', 'text-left px-4 py-3 border-b border-gray-200', label));
        });
        thead.appendChild(headRow);
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        (section.pricing.rows || []).forEach((row, rowIndex, rows) => {
          const tr = document.createElement('tr');
          row.forEach(cell => {
            tr.appendChild(createElement('td', `px-4 py-3${rowIndex < rows.length - 1 ? ' border-b border-gray-100' : ''}`, cell));
          });
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        overflow.appendChild(table);
        pricing.appendChild(overflow);
        if (section.pricing.timeline) {
          pricing.appendChild(createElement('div', 'rounded-xl bg-gray-50 border border-gray-200 p-4 text-xs text-gray-600 mt-4', section.pricing.timeline));
        }
        if (section.pricing.contact) {
          const contact = createElement('div', 'rounded-xl bg-black text-white px-4 py-3 text-sm inline-block mt-4');
          const prefix = document.createTextNode(section.pricing.contact_label || '联系方式：');
          contact.appendChild(prefix);
          const link = createElement('a', 'underline underline-offset-4', section.pricing.contact.label || '');
          link.href = section.pricing.contact.href;
          contact.appendChild(link);
          pricing.appendChild(contact);
        }
        wrapper.appendChild(pricing);
      }
      sectionEl.appendChild(wrapper);
    }

    sectionsRoot.appendChild(sectionEl);
  }

  const allAudios = Array.from(document.querySelectorAll('#sound-sections audio'));
  allAudios.forEach(currentAudio => {
    currentAudio.addEventListener('play', () => {
      allAudios.forEach(other => {
        if (other !== currentAudio && !other.paused) other.pause();
      });
    });
  });

  const sideLinks = Array.from(document.querySelectorAll('#sound-side-nav [data-side-link]'));
  const sectionEls = (data.sections || []).map(section => document.getElementById(section.id)).filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      sideLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.sideLink === id);
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0.01 });
  sectionEls.forEach(sec => observer.observe(sec));
  if (!sideLinks.some(link => link.classList.contains('active')) && sideLinks[0]) {
    sideLinks[0].classList.add('active');
  }

  const sendWish = document.getElementById('sendWish');
  if (sendWish) {
    sendWish.addEventListener('click', () => {
      const track = (document.getElementById('wishTrack')?.value || '').trim();
      const artist = (document.getElementById('wishArtist')?.value || '').trim();
      const note = (document.getElementById('wishNote')?.value || '').trim();
      const subject = encodeURIComponent(data.sections?.find(section => section.id === 'wish-order')?.wish?.mail_subject || '曲目许愿');
      const mailTo = data.sections?.find(section => section.id === 'wish-order')?.wish?.mail_to || 'wuruohan0522@gmail.com';
      const body = encodeURIComponent(`曲目名称：${track || '（未填）'}\n作者/作曲：${artist || '（未填）'}\n\n补充：${note || '（无）'}`);
      window.location.href = `mailto:${mailTo}?subject=${subject}&body=${body}`;
    });
  }
}

function renderFandomArchive(data) {
  const parent = document.getElementById('fandom-breadcrumb-parent');
  const current = document.getElementById('fandom-breadcrumb-current');
  const eyebrow = document.getElementById('fandom-eyebrow');
  const title = document.getElementById('fandom-title');
  const intro = document.getElementById('fandom-intro');
  const sectionsRoot = document.getElementById('fandom-sections');
  if (!parent || !current || !eyebrow || !title || !intro || !sectionsRoot) return;

  parent.textContent = data.breadcrumb?.parent || 'Expressions';
  current.textContent = data.breadcrumb?.current || '';
  eyebrow.textContent = data.eyebrow || '';
  title.textContent = data.title || '';
  intro.innerHTML = '';
  appendParagraphs(intro, data.intro, 'text-gray-700');

  sectionsRoot.innerHTML = '';
  for (const section of data.sections || []) {
    const sectionEl = document.createElement('section');
    const header = createElement('div', 'flex items-end justify-between gap-4 mb-4');
    const left = document.createElement('div');
    left.appendChild(createElement('p', 'text-xs uppercase tracking-[0.25em] text-gray-400 mb-2', section.section_label || ''));
    left.appendChild(createElement('h3', 'text-2xl font-semibold', section.title || ''));
    header.appendChild(left);
    if (section.tag) header.appendChild(createElement('span', 'text-sm text-gray-400', section.tag));
    sectionEl.appendChild(header);

    if (section.featured && section.summary_card) {
      const article = createElement('article', 'bg-white rounded-2xl border border-gray-200 overflow-hidden entry-hover');
      const grid = createElement('div', 'grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]');
      const featured = createElement('a', 'bg-gray-900 text-white p-6 flex flex-col justify-between min-h-64 hover:bg-gray-800 transition');
      featured.href = section.featured.href;
      featured.appendChild(createElement('p', 'text-xs tracking-[0.2em] text-gray-300 uppercase', section.featured.status || ''));
      const featuredBody = document.createElement('div');
      featuredBody.appendChild(createElement('h4', 'text-2xl font-semibold mb-2', section.featured.title || ''));
      featuredBody.appendChild(createElement('p', 'text-sm text-gray-200', section.featured.description || ''));
      featured.appendChild(featuredBody);
      const cta = createElement('span', 'inline-flex items-center gap-2 text-sm underline underline-offset-4', section.featured.cta || '进入系列页');
      cta.appendChild(createElement('span', '', '↗'));
      featured.appendChild(cta);
      grid.appendChild(featured);

      const summary = createElement('div', 'p-6');
      const summaryHeader = createElement('div', 'flex items-center justify-between gap-4 mb-3');
      summaryHeader.appendChild(createElement('h4', 'text-xl font-semibold', section.summary_card.title || ''));
      summaryHeader.appendChild(createElement('span', 'text-xs text-gray-500', section.summary_card.tag || ''));
      summary.appendChild(summaryHeader);
      summary.appendChild(createElement('p', 'text-sm text-gray-600 mb-4', section.summary_card.text || ''));
      const bullets = createElement('div', 'space-y-2 text-sm text-gray-600 mb-5');
      (section.summary_card.bullets || []).forEach(item => bullets.appendChild(createElement('p', '', `· ${item}`)));
      summary.appendChild(bullets);
      grid.appendChild(summary);
      article.appendChild(grid);
      sectionEl.appendChild(article);
    }

    if (section.cards?.length) {
      const grid = createElement('div', 'grid grid-cols-1 md:grid-cols-2 gap-6');
      for (const card of section.cards) {
        if (card.type === 'link') {
          const anchor = createElement('a', 'bg-white rounded-2xl border border-gray-200 p-6 entry-hover block');
          anchor.href = card.href;
          anchor.appendChild(createElement('p', 'text-xs uppercase tracking-[0.2em] text-gray-400 mb-2', card.eyebrow || ''));
          anchor.appendChild(createElement('h4', 'text-2xl font-semibold mb-2', card.title || ''));
          anchor.appendChild(createElement('p', 'text-sm text-gray-600 mb-4', card.description || ''));
          const tags = createElement('div', 'flex flex-wrap gap-2 text-xs text-gray-500 mb-4');
          (card.tags || []).forEach(tag => tags.appendChild(createElement('span', 'px-2 py-1 border border-gray-200 rounded-full', tag)));
          anchor.appendChild(tags);
          anchor.appendChild(createElement('span', 'text-sm underline underline-offset-4', `${card.cta || '进入作品详情'} ↗`));
          grid.appendChild(anchor);
        } else {
          const article = createElement('article', 'bg-white rounded-2xl border border-dashed border-gray-300 p-6');
          article.appendChild(createElement('p', 'text-xs uppercase tracking-[0.2em] text-gray-400 mb-2', card.eyebrow || ''));
          article.appendChild(createElement('h4', 'text-2xl font-semibold mb-2', card.title || ''));
          article.appendChild(createElement('p', 'text-sm text-gray-600', card.description || ''));
          grid.appendChild(article);
        }
      }
      sectionEl.appendChild(grid);
    }

    sectionsRoot.appendChild(sectionEl);
  }
}

async function initHome() {
  if (!document.getElementById('home-content-root')) return;
  try {
    const [home, updates] = await Promise.all([
      loadLocalizedJson('home.json'),
      loadLocalizedJson('updates.json'),
    ]);
    renderHome(home, updates);
  } catch (error) {
    console.error(error);
  }
}

async function initReadme() {
  const article = document.getElementById('readme-article');
  if (!article) return;
  try {
    article.innerHTML = await loadLocalizedText('readme.article.html');
    applyEnglishReadingMode(article, { article: true });
  } catch (error) {
    console.error(error);
  }
}

async function initSolutions() {
  if (!document.getElementById('solutions-page-root')) return;
  try {
    const data = await loadLocalizedJson('solutions.json');
    renderSolutions(data);
  } catch (error) {
    console.error(error);
  }
}

async function initRestraint() {
  if (!document.getElementById('restraint-page-root')) return;
  try {
    const data = await loadLocalizedJson('solutions_restraint.json');
    renderRestraint(data);
  } catch (error) {
    console.error(error);
  }
}

async function initExpressions() {
  if (!document.getElementById('expressions-page-root')) return;
  try {
    const data = await loadLocalizedJson('expressions.json');
    renderExpressions(data);
  } catch (error) {
    console.error(error);
  }
}

async function initVisualArchive() {
  if (!document.getElementById('visual-page-root')) return;
  try {
    const data = await loadLocalizedJson('expressions_visual.json');
    renderVisualArchive(data);
  } catch (error) {
    console.error(error);
  }
}

async function initSoundArchive() {
  if (!document.getElementById('sound-page-root')) return;
  try {
    const data = await loadLocalizedJson('expressions_sound.json');
    renderSoundArchive(data);
  } catch (error) {
    console.error(error);
  }
}

async function initFandomArchive() {
  if (!document.getElementById('fandom-page-root')) return;
  try {
    const data = await loadLocalizedJson('expressions_fandom.json');
    renderFandomArchive(data);
  } catch (error) {
    console.error(error);
  }
}

async function initReflections() {
  if (!document.getElementById('reflections-page-root')) return;
  try {
    const data = await loadLocalizedJson('reflections.json');
    renderReflections(data);
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  if (window.ReBoneI18n?.initSiteChrome) {
    await window.ReBoneI18n.initSiteChrome();
  }

  await Promise.all([
    initHome(),
    initReadme(),
    initSolutions(),
    initRestraint(),
    initExpressions(),
    initVisualArchive(),
    initSoundArchive(),
    initFandomArchive(),
    initReflections(),
  ]);
});
