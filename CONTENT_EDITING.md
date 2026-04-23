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

## 现在页面怎么更新

- `index.html` 会直接读取 `content/home.json` 和 `content/updates.json`
- `readme.html` 会直接读取 `content/readme.article.html`
- 所以你以后改的是 content 文件本身，不是整页 HTML

## 目前要注意的一点

现在 live 站点仍然从 `master` 分支发。
所以如果你要在 GitHub 网页里直接改、并且想立刻反映到网站上，先切到 `master` 分支再编辑这些文件。

优先编辑：
- `content/home.json`
- `content/updates.json`
- `content/readme.article.html`

## 以后还能继续升级

如果你希望 README 以后也变成更好写的 Markdown，我可以下一步把 `content/readme.article.html` 再升级成 `content/readme.md`。
