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

function createElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
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
  window.removeEventListener('scroll', updateActiveNav);
  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();
}

async function initHome() {
  if (!document.getElementById('home-content-root')) return;
  try {
    const [home, updates] = await Promise.all([
      loadJson('content/home.json'),
      loadJson('content/updates.json'),
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
    article.innerHTML = await loadText('content/readme.article.html');
  } catch (error) {
    console.error(error);
  }
}

async function initSolutions() {
  if (!document.getElementById('solutions-page-root')) return;
  try {
    const data = await loadJson('content/solutions.json');
    renderSolutions(data);
  } catch (error) {
    console.error(error);
  }
}

async function initRestraint() {
  if (!document.getElementById('restraint-page-root')) return;
  try {
    const data = await loadJson('content/solutions_restraint.json');
    renderRestraint(data);
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([initHome(), initReadme(), initSolutions(), initRestraint()]);
});
