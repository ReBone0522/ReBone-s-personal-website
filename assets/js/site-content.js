async function loadJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
  return response.json();
}

async function loadText(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
  return response.text();
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
    const li = document.createElement('li');
    li.className = 'pl-1';
    li.textContent = point;
    introPoints.appendChild(li);
  }

  links.innerHTML = '';
  for (const item of home.sections || []) {
    const anchor = document.createElement('a');
    anchor.href = item.href;
    anchor.className = 'group block';
    anchor.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="text-lg text-black underline group-hover:text-gray-800 transition">${item.title}</span>
        <span class="text-black text-sm group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
      </div>
      <p class="text-sm text-gray-500 mt-1">${item.description}</p>
    `;
    links.appendChild(anchor);
  }

  updatesIntro.textContent = home.updates_intro || '';
  updatesList.innerHTML = '';
  for (const item of (updates.items || [])) {
    const li = document.createElement('li');
    li.className = 'border-l-2 border-gray-300 pl-4';
    const title = item.href
      ? `<a href="${item.href}" class="underline underline-offset-4">${item.title}</a>`
      : item.title;
    li.innerHTML = `
      <p class="text-xs text-gray-400 mb-1">${item.date || ''}</p>
      <p class="text-sm text-gray-700"><strong>${title || ''}</strong></p>
      <p class="text-sm text-gray-500 mt-1">${item.summary || ''}</p>
    `;
    updatesList.appendChild(li);
  }

  credits.innerHTML = '';
  for (const line of home.credits || []) {
    const p = document.createElement('p');
    p.textContent = line;
    credits.appendChild(p);
  }
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

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([initHome(), initReadme()]);
});
