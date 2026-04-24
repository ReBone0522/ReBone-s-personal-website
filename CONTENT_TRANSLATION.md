# Content Translation Workflow

这份文档对应 ReBone 网站当前的双语 MVP 结构。

## 目标

- 中文主稿放在 `content/zh/`
- 英文草稿放在 `content/en/`
- 你主要继续改中文
- 需要英文时，用脚本从中文自动生成英文草稿
- 如果某个英文文件不存在，网站前端会自动回退显示中文

## 当前脚本

脚本路径：

- `scripts/translate_content.py`

支持的 provider：

- `openai`
- `openrouter`
- `anthropic`
- `auto`（默认）

`auto` 会按环境变量自动选择：
1. `OPENAI_API_KEY`
2. `OPENROUTER_API_KEY`
3. `ANTHROPIC_API_KEY`

## 默认行为

脚本默认：
- 从 `content/zh/` 读取
- 向 `content/en/` 写入
- 已存在的英文文件不覆盖

这意味着它很适合“先生成第一版英文草稿”，不会把你已经手动修过的英文内容冲掉。

## 常用命令

### 1. 查看将要处理哪些文件

```bash
python3 scripts/translate_content.py --dry-run
```

### 2. 一次性生成所有缺失的英文草稿

```bash
python3 scripts/translate_content.py
```

### 3. 只生成某几个文件

```bash
python3 scripts/translate_content.py home.json solutions.json readme.article.html
```

### 4. 强制覆盖已有英文文件

```bash
python3 scripts/translate_content.py --force
```

### 5. 指定 provider 或 model

```bash
python3 scripts/translate_content.py --provider openrouter
python3 scripts/translate_content.py --provider openai --model gpt-4.1-mini
python3 scripts/translate_content.py --provider anthropic --model claude-3-5-haiku-latest
```

## 推荐工作流

推荐按这个顺序做：

1. 先修改中文主稿
   - `content/zh/...`
2. 运行翻译脚本生成英文草稿
3. 检查英文输出是否自然
4. 对你在意的页面做少量英文人工微调
5. 提交到 `main`

## 哪些页面适合直接自动翻译

更适合直接自动翻的：
- `home.json`
- `solutions.json`
- `updates.json`
- `expressions.json`
- `expressions_visual.json`
- `expressions_sound.json`
- `expressions_fandom.json`

需要更仔细人工看一眼的：
- `readme.article.html`
- `reflections.json`
- `solutions_restraint.json`

原因很简单：这些文件里的语气、节奏和表达密度更接近你的个人文字风格。

## 安全与结构约束

脚本会尽量保持：
- JSON key 完全不变
- JSON 结构不变
- HTML 标签、class、属性、顺序不变
- URL / 邮箱 / 文件路径 / BVID 之类标识尽量不改

对 JSON，脚本会做结构校验。
如果返回结果破坏了原结构，会直接报错，不会默默写坏文件。

## 当前限制

这版脚本现在主要是“生成英文草稿”，还不是“增量精修系统”。
所以要注意：

- 默认不会覆盖现有英文文件
- 如果你手动修过 `content/en/...`，后续再跑脚本时它会跳过
- 只有你明确加 `--force`，才会重写已有英文文件

## 推荐使用方式

如果你只是更新了几页中文，不要每次都全量跑。
更推荐按文件来：

```bash
python3 scripts/translate_content.py home.json expressions.json
```

这样更省成本，也更容易检查结果。
