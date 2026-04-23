# Content Editing Workflow

这套中间层已经改成前端直接读取 content 文件，不依赖 GitHub Actions 构建。

## 你以后主要改这些文件

- `content/home.json`
  - 首页欢迎语
  - 首页意义说明
  - 四个导航入口描述
  - 小告示栏说明文字
  - 页尾致谢

- `content/updates.json`
  - 网站正式公开后的更新记录
  - 现在默认是空列表，不会显示更新条目

- `content/readme.article.html`
  - README 页正文
  - 这里只放正文，不放导航、页脚、meta

- `content/solutions.json`
  - Solutions 页标题与简介
  - 分类按钮文字
  - 项目卡片的标题、tag、日期、摘要、引用

- `content/solutions_restraint.json`
  - 约束手套详情页的目录、项目概要、背景调查、陪伴日志、原型迭代、生产计划、致谢
  - 这是结构化 JSON，不需要改整页 HTML

- `content/expressions.json`
  - Expressions 页标题、引言、分类卡片、右侧 preview 内容

- `content/reflections.json`
  - Reflections 页标题、说明文字、提示语，以及各个区域（人类 / 我 / 动物 / 社交 / 交互 / 人类×动物 / 生命）的内容

- `content/expressions_visual.json`
  - Expressions → 视觉艺术 子页的标题、说明、作品卡片、预留位

- `content/expressions_sound.json`
  - Expressions → 音乐 子页的标题、授权说明、八音盒曲目、原创曲目、许愿 / 订购规则

- `content/expressions_fandom.json`
  - Expressions → 为爱发电 子页的标题、游戏实况入口、同人分类卡片

## 现在页面怎么更新

- `index.html` 会读取 `content/home.json` 和 `content/updates.json`
- `readme.html` 会读取 `content/readme.article.html`
- `solutions.html` 会读取 `content/solutions.json`
- `solutions_restraint.html` 会读取 `content/solutions_restraint.json`
- `expressions.html` 会读取 `content/expressions.json`
- `expressions_visual.html` 会读取 `content/expressions_visual.json`
- `expressions_sound.html` 会读取 `content/expressions_sound.json`
- `expressions_fandom.html` 会读取 `content/expressions_fandom.json`
- `reflections.html` 会读取 `content/reflections.json`

所以你以后改的是 content 文件本身，不是整页 HTML。

## 现在 live 站点的发布分支

现在 GitHub Pages 已经确认从 `main` 分支发布。
所以如果你要在 GitHub 网页里直接改、并且想让网站更新，编辑 `main` 分支里的这些 content 文件就可以。

优先编辑：
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

## 以后还能继续升级

如果你希望：
- README 以后也变成更好写的 Markdown
- Expressions / Reflections 的子页面也继续接入 content 文件
- 项目详情页再加更多图片、折叠块、引用来源结构

我可以继续往这套内容层里扩。
