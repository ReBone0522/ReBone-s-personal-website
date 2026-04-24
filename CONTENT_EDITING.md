# Content Editing Workflow

这套内容层现在已经进入双语 MVP 结构。

- 中文主稿：`content/zh/`
- 英文内容：`content/en/`
- 当前前端会按语言读取对应目录；如果英文文件不存在，会自动回退到中文。

## 你以后主要改这些文件

### 中文主稿（优先编辑）

- `content/zh/home.json`
  - 首页欢迎语
  - 首页意义说明
  - 四个导航入口描述
  - 小告示栏说明文字
  - 页尾致谢

- `content/zh/updates.json`
  - 网站正式公开后的更新记录
  - 现在默认是空列表，不会显示更新条目

- `content/zh/readme.article.html`
  - README 页正文
  - 这里只放正文，不放导航、页脚、meta

- `content/zh/solutions.json`
  - Solutions 页标题与简介
  - 分类按钮文字
  - 项目卡片的标题、tag、日期、摘要、引用

- `content/zh/solutions_restraint.json`
  - 约束手套详情页的目录、项目概要、背景调查、陪伴日志、原型迭代、生产计划、致谢
  - 这是结构化 JSON，不需要改整页 HTML

- `content/zh/expressions.json`
  - Expressions 页标题、引言、分类卡片、右侧 preview 内容

- `content/zh/reflections.json`
  - Reflections 页标题、说明文字、提示语，以及各个区域（人类 / 我 / 动物 / 社交 / 交互 / 人类×动物 / 生命）的内容

- `content/zh/expressions_visual.json`
  - Expressions → 视觉艺术 子页的标题、说明、作品卡片、预留位

- `content/zh/expressions_sound.json`
  - Expressions → 音乐 子页的标题、授权说明、八音盒曲目、原创曲目、许愿 / 订购规则

- `content/zh/expressions_fandom.json`
  - Expressions → 为爱发电 子页的标题、游戏实况入口、同人分类卡片

### 英文内容（可手动微调）

- `content/en/site.json` 当前已存在，用于导航与页脚等站点级文案
- 其他英文文件后续可以逐步补进 `content/en/`
- 如果某个英文文件缺失，前端会自动显示中文版本

## 现在页面怎么更新

- `index.html` 会按语言读取 `content/{lang}/home.json` 和 `content/{lang}/updates.json`
- `readme.html` 会按语言读取 `content/{lang}/readme.article.html`
- `solutions.html` 会按语言读取 `content/{lang}/solutions.json`
- `solutions_restraint.html` 会按语言读取 `content/{lang}/solutions_restraint.json`
- `expressions.html` 会按语言读取 `content/{lang}/expressions.json`
- `expressions_visual.html` 会按语言读取 `content/{lang}/expressions_visual.json`
- `expressions_sound.html` 会按语言读取 `content/{lang}/expressions_sound.json`
- `expressions_fandom.html` 会按语言读取 `content/{lang}/expressions_fandom.json`
- `reflections.html` 会按语言读取 `content/{lang}/reflections.json`

所以你以后主要改的是 `content/zh/` 里的内容文件，不是整页 HTML。

## 现在 live 站点的发布分支

现在 GitHub Pages 已经确认从 `main` 分支发布。
所以如果你要在 GitHub 网页里直接改、并且想让网站更新，编辑 `main` 分支里的这些 content 文件就可以。

优先编辑：
- `content/zh/home.json`
- `content/zh/updates.json`
- `content/zh/readme.article.html`
- `content/zh/solutions.json`
- `content/zh/solutions_restraint.json`
- `content/zh/expressions.json`
- `content/zh/expressions_visual.json`
- `content/zh/expressions_sound.json`
- `content/zh/expressions_fandom.json`
- `content/zh/reflections.json`

## 以后还能继续升级

如果你希望：
- 自动根据中文内容生成英文草稿
- README 以后也变成更好写的 Markdown
- Expressions / Reflections 的子页面也继续接入 content 文件
- 项目详情页再加更多图片、折叠块、引用来源结构

我可以继续往这套双语内容层里扩。

## 英文草稿怎么自动生成

当前已经有翻译脚本：
- `scripts/translate_content.py`

翻译工作流说明：
- `CONTENT_TRANSLATION.md`

最常用命令：

```bash
python3 scripts/translate_content.py --dry-run
python3 scripts/translate_content.py
python3 scripts/translate_content.py home.json solutions.json readme.article.html
```

默认行为：
- 从 `content/zh/` 读
- 向 `content/en/` 写
- 已存在的英文文件默认不覆盖
