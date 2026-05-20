# ReBone · 设计系统

> 这是 ReBone 个人网站的设计语言锚点。未来任何修改要先读完这一篇——风格不是装饰偏好，是从用户哲学里推出来的结构性决定。

---

## 由来

经过三轮探索（A–D 装饰风、E–H 简化版、S1–S6 哲学骨架），用户从我提出的 18 个候选里挑出 **4 个**作为整站基石：

| 选定模板 | 哲学锚点 | 应用范围 |
|---|---|---|
| **S3 · Crack（缝隙）** | "找一道缝隙，做一点小事" — 不对称布局：左侧窄栏 + 中间细线 + 右侧主内容 | **首页**；同时**左侧栏格式延伸到全站每一页**，内容按页适配 |
| **S4 · Log（日志）** | "输入、输出间的迭代过程" — 思考是版本化的，每条都有日期 | **Reflections 板块**（替代原 Venn 图） |
| **S5 · Frontispiece（扉页）** | "给未来某个陌生人的启发" — 用排版的礼仪让到访者慢下来 | **手机端**（≤ 768px 媒体查询触发） |
| **现有 homepage frame**（已被快照保存） | hero + 带边框结构化卡片 + 侧栏节奏 | **Project 详情页**（restraint、electromap、visual、sound、fandom 等） |

模板源文件已归档在 [`templates/`](./templates/)：

- `templates/homepage-s3.html` — S3 frame 源稿
- `templates/reflection-log-s4.html` — S4 log 源稿
- `templates/mobile-s5.html` — S5 frontispiece 源稿
- `templates/project-frame.html` — 当时 index.html 的快照（项目页视觉语言来源）

未来如果要回看"原汁原味"的某个模板审美，去这里翻。

---

## 色彩 token（统一全站，B&W）

| Token | 值 | 用途 |
|---|---|---|
| `--bg` | `#FAFAF8` | 页面底色（暖白） |
| `--card` | `#FFFFFF` | 卡片底色 |
| `--ink` | `#1A1A1A` | 主文本、标题 |
| `--ink-2` | `#555555` | 正文段落 |
| `--ink-3` | `#888888` | meta、次级标签 |
| `--ink-4` | `#B5B5B5` | 占位、最弱信息 |
| `--rule` | `#D8D8D8` | 规则线、卡片边框 |
| `--rule-2` | `#ECECEC` | 极弱分隔线 |
| `--banner-bg` | `#2c2c2c` | banner 底色（与图片 luminosity blend） |

定义在 [`assets/css/site-frame.css`](./assets/css/site-frame.css)。**不要新增色调**——任何颜色变化都要先回到这里讨论。

---

## Banner（顶部导航）

每一页都用同一段 banner：
- `background-image: url('../nav-bg.PNG')`（`assets/nav-bg.PNG`）
- `background-blend-mode: luminosity` + `background-color: #2c2c2c` → 把图片去色得到深灰
- 白字 mono 链接 + 中央 nav-links + 右侧 `<div>`（i18n.js 会往这里塞语言切换）

CSS 类：`.banner` / `.banner-inner` / `.brand` / `.nav-links` / `.nav-link`。

---

## 通用左侧栏（rail）

**这是 S3 在全站的延伸**。每页都有，但内容按页适配。

- 宽度：`--rail-width: 8rem`（比 S3 原稿的 ~12rem 收窄）
- `position: sticky; top: 5rem`
- 中间有 1px 竖向 gutter（`.shell-gutter`）连接到主列

每页 rail 装什么：

| 页 | rail 内容 |
|---|---|
| 首页 | ReBone label + 一句简介 + Vol. + On this page mini-TOC |
| Solutions 主页 | Section label + filter 列表 + Vol. |
| Expressions 主页 | Section label + 三大分类锚（Visual / Sound / For Love）+ Vol. |
| Reflections | Section label + 各 region 跳转锚（人类 / 我 / 动物 / ...）+ Vol. |
| README.md | Document label + Kind + Status + Vol. |
| Project 详情页 | Parent breadcrumb + Project 名 + Date + Summary + on-this-page nav + Vol. |
| 404 | Status + Type + 返回首页链接 |

CSS 类：`.rail` / `.rail-label`（mono 小写大写字母）/ `.rail-text` / `.rail-marker` / `.rail-nav`。

---

## 主列布局

`.shell` = grid：`var(--rail-width) 1px minmax(0, 1fr)`，最大宽 `72rem`。

主列结构（按页不同组合）：

1. **`.page-hero`** — eyebrow + 大标题 + 副标 + intro points
2. **section 内容**（章节列表 / 卡片 / 日志行 / 长文）
3. **`.panel`**（updates、inbox 等）
4. **footer** — `<footer class="site-footer">`（i18n.js 会替换 textContent）

---

## 字体栈

```
--font-serif: 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif;
--font-mono:  ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
```

**只允许这两个字体家族。** 标题与正文用 serif；标签、meta、按钮用 mono。**禁用 italic / EB Garamond / Cormorant 等装饰字体**——之前用过被否，太"穿礼服"。

---

## 移动端（≤ 768px）→ S5 Frontispiece

`assets/css/site-frame.css` 里的 `@media (max-width: 768px)` 块定义：

- `.shell` 切到单列，`max-width: 32rem`
- `.rail` 折叠为顶部水平短横条
- `.shell-gutter` 隐藏
- `.page-hero` 居中（扉页感）
- `.section-card` 等折叠为单列
- `.project-cards-grid` 折叠为单列

不写第二套移动版 HTML，全部用 CSS 媒体查询切换。

---

## 内容绑定契约（务必保留的 ID）

`assets/js/site-content.js` 用**固定 ID** 把 `content/*.json` 注入 DOM。改 HTML 时这些 ID 一个都不能丢。

### 首页（`index.html`）
`home-content-root` / `home-heading` / `home-intro-label` / `home-intro-points` / `home-links` / `updates-label` / `updates-list` / `updates-more` / `inbox-title` / `inbox-intro` / `inbox-draft` / `inbox-button` / `home-credits`

### Section 主页
- **Solutions**：`solutions-page-root` / `solutions-title` / `solutions-intro` / `solutions-filters` / `solutions-cards`
- **Expressions**：`expressions-page-root` / `expressions-title` / `expressions-intro` / `expressions-categories` / `expressions-rail-nav`（新）
- **Reflections**：`reflections-page-root` / `reflections-title` / `reflections-subtitle` / `reflections-intro` / `reflections-footnote` / `reflections-rail-nav`（新）/ `reflections-log`（新）
- **README**：`readme-article`

### Project 详情页
- **Restraint / Electromap**：`restraint-page-root` + `data-content-file` 属性 / `restraint-eyebrow` / `data-restraint-title` / `restraint-date` / `restraint-summary` / `restraint-breadcrumb` / `restraint-side-nav` / `restraint-content`
- **Visual**：`visual-page-root` / `visual-breadcrumb-parent` / `visual-breadcrumb-current` / `visual-eyebrow` / `visual-title` / `visual-intro` / `visual-works`
- **Sound**：`sound-page-root` / `sound-breadcrumb-parent` / `sound-breadcrumb-current` / `sound-eyebrow` / `sound-title` / `sound-intro` / `sound-notice-title` / `sound-notice-body` / `sound-notice-footnote` / `sound-side-nav` / `sound-sections`
- **Fandom**：`fandom-page-root` / `fandom-breadcrumb-parent` / `fandom-breadcrumb-current` / `fandom-eyebrow` / `fandom-title` / `fandom-intro` / `fandom-sections`

### i18n 钩子
- `<nav>` 元素必须存在；里面要有 `<a href="index.html">`、`<a href="solutions.html">`、`<a href="expressions.html">`、`<a href="reflections.html">`、`<a href="readme.html">`
- nav 内第一个 `<div>` 会被 `applySiteChrome()` 塞入语言切换 `<span data-language-switch="true">`
- `<footer>` 元素的 `textContent` 会被 `site.json` 的 `footer` 字段替换

---

## 修改流程

1. **改样式** → 优先改 `assets/css/site-frame.css`（CSS 变量、shell、rail、卡片样式）。避免在每页里写 inline `<style>`。
2. **改某页布局** → 改对应 HTML，**ID 不能丢**，引入 `site-frame.css`，不要再用旧的 Tailwind soup。
3. **改内容** → 改 `content/zh/*.json` 与 `content/en/*.json`，不要动 HTML。
4. **改渲染逻辑** → 改 `assets/js/site-content.js`。渲染函数与页面 ID 是一对一的契约。
5. **加新 Tailwind 类** → 运行 `npm run build:css` 重新生成 `assets/tailwind.css`。
6. **加新页面** → 复制 `templates/homepage-s3.html` 或 `templates/project-frame.html` 当起点，按上面的 ID/rail 规则填。

---

## 关键文件

| 路径 | 角色 |
|---|---|
| `assets/css/site-frame.css` | **设计系统主文件**——所有共享样式 |
| `assets/tailwind.css` | Tailwind 预编译输出（保留作为工具类层） |
| `assets/tailwind.input.css` | Tailwind 源 + `[data-lang="en"]` 排版调整 |
| `assets/js/site-content.js` | 各页渲染逻辑 |
| `assets/js/i18n.js` | 语言切换 + 站点 chrome 注入 |
| `assets/nav-bg.PNG` | banner 背景图（用 luminosity blend 去色） |
| `content/{zh,en}/*.json` | 所有内容（双语对应） |
| `templates/` | 4 个选定模板源稿（设计参考，不在生产环境引用） |

---

## 不要做的事

- ❌ 加 italic / 装饰花体字
- ❌ 加 emoji / decorative symbols（包括 ✨ 🌿 等"小点缀"）
- ❌ 加纹理（gingham、linen weave、stitched border 之类）
- ❌ 在某一页里偷偷换色——色调全站统一
- ❌ 用 box-shadow 制造"漂浮感"——B&W 系统不依赖阴影
- ❌ 加 italic 副标题
- ❌ 用 rounded-2xl 等大圆角——本系统是方角（小圆角 2px 兼容性允许）
- ❌ 引入新字体家族——只用 Noto Serif SC + 系统 mono

---

## 验证

```
python3 -m http.server 4173
open http://localhost:4173/
```

走一遍：
1. 每个 section（Solutions / Expressions / Reflections / README）能正常加载并显示
2. 每个 project 详情页 side-nav（在左侧 rail 里）能跳转，IntersectionObserver 高亮当前 section
3. 顶部 EN / 中文 切换正常工作
4. Reflections 不再有 Venn，而是 log 形式按 region 分组
5. 浏览器窗口拉到 ≤ 768px，左侧栏折叠到顶部，主列收窄到扉页风格
