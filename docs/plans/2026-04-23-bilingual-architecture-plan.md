# ReBone 网站中英双语架构方案

> 这份文档对应当前 GitHub Pages 静态站 + 前端读取 content 文件的结构，目标是在不破坏现有维护方式的前提下，把网站升级成稳定的中英双语站。

**目标：** 让 ReBone 网站支持中文 / English 双语切换，同时保留“主要编辑 content 文件，不频繁改 HTML”的维护方式。

**结论：** 可做，而且最适合当前网站的方案不是“访客打开页面时实时机器翻译”，而是“中文为主稿 + 本地脚本自动生成英文草稿 + 前端切换两套现成内容”。

**为什么选这个方案：**
- 当前站点是 GitHub Pages 静态站，没有后端。
- 当前已明确避开依赖 GitHub Actions 的重构路线。
- 当前页面已经大量 content-driven，很适合按语言目录组织内容。
- ReBone 的文本风格比较重要，尤其是 README / Reflections / 项目说明，不能把访客看到的版本完全交给浏览器即时翻译。

---

## 1. 当前站点状态

### 1.1 当前顶层页面

当前根目录页面：

- `index.html`
- `solutions.html`
- `solutions_restraint.html`
- `expressions.html`
- `expressions_visual.html`
- `expressions_sound.html`
- `expressions_fandom.html`
- `expressions_fandom_satsuriku.html`
- `expressions_fandom_series.html`
- `expressions_hcs_series.html`
- `expressions_intersections.html`
- `reflections.html`
- `readme.html`
- `404.html`

### 1.2 当前 content-driven 覆盖范围

当前已经 content-driven 的内容文件：

- `content/home.json`
- `content/updates.json`
- `content/readme.article.html`
- `content/solutions.json`
- `content/solutions_restraint.json`
- `content/expressions.json`
- `content/expressions_visual.json`
- `content/expressions_sound.json`
- `content/expressions_fandom.json`
- `content/reflections.json`

### 1.3 当前还偏硬编码的页面

这些页面后续最好再接入 content 层，否则双语时会有额外重复劳动：

- `expressions_fandom_satsuriku.html`
- `expressions_fandom_series.html`
- `expressions_hcs_series.html`
- `expressions_intersections.html`
- `404.html`

---

## 2. 三种双语方案对比

### 方案 A：完全依赖浏览器翻译

做法：
- 网站不改结构
- 让用户自己使用 Chrome / Safari 翻译功能

优点：
- 几乎零开发

问题：
- 不可控
- 文字风格变化不可预估
- README / Reflections / 项目页很容易失真
- 不是正式的站点双语设计

结论：
- 只能当临时补充，不适合作为正式方案

### 方案 B：用户打开页面时即时调用翻译 API

做法：
- 页面加载中文 content
- 点击 EN 后前端调翻译 API，再渲染英文

优点：
- 看起来很“自动”

问题：
- 前端直调 API 会暴露 key，除非加后端
- 页面打开会变慢
- 成本与调用次数不可控
- 同一段文本每次可能翻译不同
- 站点稳定性依赖外部 API

结论：
- 技术上可行，工程上不适合现在这套站

### 方案 C：中文主稿 + 本地自动生成英文草稿 + 前端切换双语内容

做法：
- 中文内容依然是唯一主编辑源
- 用本地脚本读取中文 content，自动生成英文 content 草稿
- 站点前端只负责切换 `zh` / `en` 两套已存在内容

优点：
- 打开速度稳定
- 无需后端
- 不暴露 API key
- 翻译结果可人工微调
- 与当前 content-driven 架构高度一致

结论：
- 这是推荐方案

---

## 3. 推荐架构

### 3.1 路由策略

推荐先用“同一路径 + 页面内切语言”的方案：

- `https://rebone0522.com/solutions.html`
- `https://rebone0522.com/reflections.html`
- `https://rebone0522.com/readme.html`

页面内有语言状态：
- `zh`
- `en`

语言来源优先级：
1. URL 参数 `?lang=en`
2. `localStorage`
3. 默认 `zh`

推荐原因：
- 改动最小
- 不需要重做整套路由
- 很适合当前静态站
- 后续如果要做 `/en/` 路由，再升级也不晚

### 3.2 内容目录结构

推荐把 content 分成语言子目录，而不是继续把所有语言塞进同一个 JSON。

推荐结构：

```text
content/
  zh/
    home.json
    updates.json
    solutions.json
    solutions_restraint.json
    expressions.json
    expressions_visual.json
    expressions_sound.json
    expressions_fandom.json
    reflections.json
    readme.article.html
    site.json
  en/
    home.json
    updates.json
    solutions.json
    solutions_restraint.json
    expressions.json
    expressions_visual.json
    expressions_sound.json
    expressions_fandom.json
    reflections.json
    readme.article.html
    site.json
```

不推荐把结构写成：

```json
{
  "title": {
    "zh": "视觉艺术",
    "en": "Visual Art"
  }
}
```

原因：
- 当前内容已经比较多，这样改会让每个文件变得很重
- 编辑体验会差
- 翻译脚本也更难增量更新
- diff 可读性变差

### 3.3 全局语言状态

建议新增一个轻量全局语言工具，职责只有这些：

- 读取当前语言
- 设置当前语言
- 生成语言对应的 content 路径
- 在切换时重新触发当前页面加载
- 把语言状态写入 `localStorage`

建议新增文件：

- `assets/js/i18n.js`

建议保留：
- `assets/js/site-content.js`

`site-content.js` 需要改为：
- 不再写死 `content/home.json`
- 改成通过当前语言解析路径，例如：
  - `content/zh/home.json`
  - `content/en/home.json`

### 3.4 全站语言切换 UI

建议加在导航右侧，形式尽量轻：

```text
中文 / EN
```

推荐位置：
- 当前导航右侧 `README.md` 后面
- 所有页面统一

推荐行为：
- 当前语言高亮
- 点击立即切换页面内容
- 不跳离当前页面

### 3.5 缺失语言的回退机制

推荐支持“英文未完成时回退中文”。

规则：
- 先尝试读取 `content/en/...`
- 如果 404，则回退到 `content/zh/...`
- 可选：页面角落显示一个很轻的提示，例如：`English draft not ready; showing Chinese content.`

这样好处是：
- 双语可以分批上线
- 不需要所有页面一次性翻完
- 先把切换机制搭起来，再逐页补英文

---

## 4. 推荐的数据组织方式

### 4.1 site.json 用作全局站点级文案

当前已有：
- `content/site.json`

建议升级为：
- `content/zh/site.json`
- `content/en/site.json`

用来放所有跨页面共享的站点级文案，例如：
- 导航文案
- 页脚文案
- 语言切换按钮文案
- 404 页文案
- 一些通用提示语

例如：

```json
{
  "nav": {
    "brand": "ReBone",
    "solutions": "Solutions",
    "expressions": "Expressions",
    "reflections": "Reflections",
    "readme": "README.md"
  },
  "footer": "© 2025 ReBone. All rights reserved.",
  "language_switch": {
    "zh": "中文",
    "en": "EN"
  }
}
```

### 4.2 README 的处理方式

README 现在是：
- `content/readme.article.html`

双语后建议：
- `content/zh/readme.article.html`
- `content/en/readme.article.html`

原因：
- README 结构已经是 HTML，不适合强行拆成 JSON
- 保持双份 HTML 最直接
- 翻译时更容易逐段人工修正

### 4.3 页面 meta 的处理方式

当前 `<title>`、`meta description`、`og:title`、`og:description` 大多仍写在 HTML 里。

如果正式做双语，建议后续把“页面头信息”也纳入语言结构，否则切 EN 时页面正文变英文，但浏览器标题和分享摘要还是中文。

推荐两种路线：

路线 1：先不动 meta
- 成本最低
- 先解决正文双语
- 适合第一阶段上线

路线 2：补一个每页 metadata 文件
- 更完整
- 例如 `content/zh/page-meta.json` / `content/en/page-meta.json`
- 切换语言时同步更新 `document.title` 和 meta description

推荐：
- 第一阶段先做正文与导航双语
- 第二阶段再补 meta 双语

---

## 5. 自动翻译工作流设计

### 5.1 推荐工作流

推荐流程：

1. ReBone 继续只改中文内容
2. 本地执行翻译脚本
3. 生成或更新英文内容草稿
4. 对关键页面做人工微调
5. 提交到 `main`

### 5.2 为什么不建议“每次保存自动翻译线上内容”

因为当前站点：
- 没有后端
- 不适合把翻译服务暴露在浏览器端
- GitHub Actions 路线之前已明确受限

所以最合理的是：
- 本地脚本执行翻译
- 翻译结果写入 `content/en/`

### 5.3 推荐脚本位置

建议新增：

- `scripts/translate_content.py`
- `translation-config.json` 或 `scripts/translation_map.json`

脚本职责：
- 扫描 `content/zh/`
- 针对 JSON 做字段级翻译
- 针对 `readme.article.html` 做 HTML 保结构翻译
- 把结果输出到 `content/en/`
- 支持“跳过已人工修订的字段”

### 5.4 自动翻译结果的管理方式

建议英文文件支持三种状态：

1. **机器草稿**
   - 第一次自动生成
2. **人工修订**
   - 某些句子手动改过
3. **锁定字段**
   - 翻译脚本后续不再覆盖

最简单的实现方式不是往 JSON 里加很多状态字段，而是：
- 脚本默认只更新缺失项
- 对人工修订过的英文文件不强制覆盖
- 如需重新翻译，再加 `--force`

---

## 6. 实施顺序

### 第一阶段：先把语言基础设施搭起来

目标：
- 网站支持 `zh / en` 状态
- 导航里出现语言切换
- content 路径可按语言读取

要改的核心文件：
- `assets/js/site-content.js`
- 新增 `assets/js/i18n.js`
- 当前所有 content-driven 页面 HTML：
  - `index.html`
  - `solutions.html`
  - `solutions_restraint.html`
  - `expressions.html`
  - `expressions_visual.html`
  - `expressions_sound.html`
  - `expressions_fandom.html`
  - `reflections.html`
  - `readme.html`

需要新增的内容目录：
- `content/zh/`
- `content/en/`

### 第二阶段：迁移现有 content-driven 内容

目标：
- 先把已有 content-driven 页面切到新目录结构

具体迁移：
- `content/home.json` → `content/zh/home.json`
- `content/updates.json` → `content/zh/updates.json`
- `content/readme.article.html` → `content/zh/readme.article.html`
- 其余 JSON 同理

然后生成第一版：
- `content/en/...`

### 第三阶段：补剩余硬编码页面

目标：
- 让双语覆盖更完整

优先顺序：
1. `expressions_hcs_series.html`
2. `expressions_fandom_satsuriku.html`
3. `expressions_fandom_series.html`
4. `expressions_intersections.html`
5. `404.html`

原因：
- 如果这些页面继续硬编码，双语切换时会出现一部分是可切换的，一部分还是固定中文

### 第四阶段：补翻译脚本

目标：
- 中文改完后，一键生成英文草稿

建议新增：
- `scripts/translate_content.py`
- 文档：`CONTENT_TRANSLATION.md`

### 第五阶段：补 SEO / 分享层双语

目标：
- `document.title`
- `meta description`
- `og:title`
- `og:description`

---

## 7. 推荐的最小可行版本（MVP）

如果要尽量快上线，我建议先做这个最小版本：

### MVP 包含

- 语言切换按钮
- `localStorage` 记忆语言
- `content/zh/` + `content/en/` 双目录
- 以下页面支持双语：
  - `index.html`
  - `solutions.html`
  - `solutions_restraint.html`
  - `expressions.html`
  - `expressions_visual.html`
  - `expressions_sound.html`
  - `expressions_fandom.html`
  - `reflections.html`
  - `readme.html`
- 英文缺失时回退中文

### MVP 暂时不做

- `/en/` 独立路由
- 自动切换全部 meta 标签
- 未 content-driven 的子页面双语
- 在线实时翻译

这是最划算的一版。

---

## 8. 成本与风险

### 8.1 开发成本

如果按当前仓库做，双语基础设施本身不算重。
真正费时间的是内容迁移和英文校对。

### 8.2 最大风险

不是技术，而是文字质量。

尤其是：
- `README`
- `Reflections`
- `Solutions` 里带你个人语气的段落

这些内容如果完全机器翻译，会出现：
- 意思大致对
- 但语气不对
- 节奏不对
- 读起来不像你

所以推荐策略是：
- 信息型页面可以多依赖自动翻译
- 风格型页面保留人工修正空间

### 8.3 可维护性风险

如果一开始就想做：
- 实时翻译
- 独立英文路由
- 全量 SEO 双语
- 所有子页面一次性迁移

会把这件事做得过重。

所以推荐分阶段推进。

---

## 9. 最终建议

### 推荐方案一句话版

把网站做成：

**中文主稿 + `content/zh` / `content/en` 双目录 + 前端语言切换 + 本地翻译脚本生成英文草稿**

### 为什么这是最适合 ReBone 网站的设计

因为它同时满足：
- 结构稳定
- 文字可继续自己改
- 不依赖后端
- 不拖慢首屏
- 允许自动翻译
- 又不把你的文字风格完全交给机器

---

## 10. 如果下一步开始实施，建议顺序

### 第一步先做

先做基础设施：
- 新建 `content/zh/` 和 `content/en/`
- 加语言切换按钮
- 改 `site-content.js` 支持按语言读 content
- 让已 content-driven 的页面支持双语切换

### 第二步再做

补翻译工作流：
- 新建 `scripts/translate_content.py`
- 让中文内容一键生成英文草稿

### 第三步最后做

清理剩余硬编码页面并补 SEO 双语

---

## 11. 预计改动文件清单

### 一定会改

- `assets/js/site-content.js`
- `index.html`
- `solutions.html`
- `solutions_restraint.html`
- `expressions.html`
- `expressions_visual.html`
- `expressions_sound.html`
- `expressions_fandom.html`
- `reflections.html`
- `readme.html`
- `CONTENT_EDITING.md`

### 建议新增

- `assets/js/i18n.js`
- `content/zh/...`
- `content/en/...`
- `scripts/translate_content.py`
- `CONTENT_TRANSLATION.md`

### 建议后续再改

- `expressions_hcs_series.html`
- `expressions_fandom_satsuriku.html`
- `expressions_fandom_series.html`
- `expressions_intersections.html`
- `404.html`

---

## 12. 执行判断

如果现在开始做，我建议不要一口气做全站。
最合理的是先做一个“真实可用的 MVP 双语框架”，优先覆盖已经 content-driven 的页面。

这样做的结果会是：
- 结构先对
- 以后扩页面不会返工
- 你可以先看到网站实际切中英的样子
- 后面再决定英文要不要精修到什么程度
