# 六爻 Skills

基于 [Agent Skills](https://agentskills.io/) 开放格式的六爻起卦、排盘与断卦 Skills。仓库只维护一份 `SKILL.md` 源文件，通过通用目录、各 Agent 原生目录、上传包和插件市场适配不同客户端。

## 包含内容

| 目录 | 用途 |
| --- | --- |
| `skills/liuyao-divination/` | 通用六爻测算：世爻用神人、体用、双原、病药与专题判断 |
| `skills/liuyao/` | 六爻分层断卦：原时定局、日辰主宰、作用层级、动变顺序与真假空亡 |
| `liuyao-paipan-code/` | 六爻起卦、八宫纳甲、世应、六亲、六神、伏神、旬空及历法上下文 |

两套 Skill 各自保留方法边界。`liuyao` 不会默认混入 `liuyao-divination` 的双原、全局调平或流时重定吉凶规则。

## 支持的 Agent 与渠道

| Agent / 渠道 | 用户级目录或分发方式 | 项目级目录 |
| --- | --- | --- |
| 通用 Agent Skills 客户端 | `~/.agents/skills` 或自定义目录 | `.agents/skills` |
| Codex CLI、App、Cloud、IDE | `~/.agents/skills` | `.agents/skills` |
| ChatGPT 网页、桌面、移动端 | Skill 上传 / OpenAI 插件 / 工作区 GitHub 市场 | — |
| Claude Code、Claude Agent SDK | `~/.claude/skills` 或 Claude 插件市场 | `.claude/skills` |
| Claude 网页、桌面端、Cowork | 在 `Customize > Skills` 上传 ZIP | — |
| Cursor | `~/.cursor/skills` | `.cursor/skills` |
| Gemini CLI | `~/.gemini/skills` | `.gemini/skills` |
| GitHub Copilot（CLI、编码代理、代码审查、IDE） | `~/.copilot/skills` | `.github/skills` |
| OpenCode | `~/.config/opencode/skills` | `.opencode/skills` |
| Windsurf | `~/.codeium/windsurf/skills` | `.windsurf/skills` |
| Cline | `~/.cline/skills` | `.cline/skills` |

其他读取 Agent Skills 的客户端可使用通用目录；目录约定不同的客户端可用 `--agent custom` 指定准确位置。因此兼容范围不依赖硬编码的产品名单。

## 一键安装

需要 Python 3.10+。先克隆仓库：

```bash
git clone https://github.com/songgoldenwind-crypto/liuyao-skills.git
cd liuyao-skills
```

安装到开放标准用户目录，适合 Codex 和识别 `.agents/skills` 的客户端：

```bash
python3 scripts/install.py
```

同时安装到全部已适配 Agent 的原生用户目录：

```bash
python3 scripts/install.py --agent all --scope user
```

只为一个 Agent 安装到项目中：

```bash
python3 scripts/install.py --agent cursor --scope project --target /path/to/project
```

适配任意自定义 Agent 目录：

```bash
python3 scripts/install.py --agent custom --destination /path/to/agent/skills
```

可以加 `--skill liuyao` 或 `--skill liuyao-divination` 只装一套；已有同名目录时安装器会停止，确认需要替换后加 `--force`。Windows 可把命令中的 `python3` 换成 `py`。

## 插件与在线端

### Claude Code 插件市场

在 Claude Code 中执行：

```text
/plugin marketplace add songgoldenwind-crypto/liuyao-skills
/plugin install liuyao-skills@liuyao-skills
```

仓库同时提供 `.claude-plugin/plugin.json` 与 `.claude-plugin/marketplace.json`，两个 Skill 会以插件命名空间加载。

### Claude 网页、桌面端与 Cowork

从 [最新 Release](https://github.com/songgoldenwind-crypto/liuyao-skills/releases/latest) 下载 `liuyao.zip` 或 `liuyao-divination.zip`，在 `Customize > Skills` 中分别上传。ZIP 内保留了 Claude 要求的顶层 Skill 文件夹。

### ChatGPT 与 Codex 插件

账户中如有 `插件 > Skills > 创建 > 从电脑上传` 入口，可从 [最新 Release](https://github.com/songgoldenwind-crypto/liuyao-skills/releases/latest) 下载两个 `.skill` 文件并分别上传。个人 Skill 在桌面端与网页/移动端可能需要分别添加。

仓库还包含原生 `.codex-plugin/plugin.json` 和 `.agents/plugins/marketplace.json`。ChatGPT 工作区管理员可在 `管理 > 插件 > 添加 > 导入市场` 中填入仓库 URL，并把路径留空：

```text
https://github.com/songgoldenwind-crypto/liuyao-skills
```

导入后可在 ChatGPT 网页、桌面和移动端以及 Codex 中安装。个人账户能否直接搜索到它取决于公开插件目录的审核与上架状态；仓库中的插件包已经具备提交和工作区导入所需结构。

### 通用上传包

生成所有分发文件：

```bash
python3 scripts/package-skills.py
```

`dist/*.skill` 与 `dist/*-agent.zip` 的 `SKILL.md` 位于压缩包根目录，分别供 Skill 文件上传入口和标准 ZIP 导入；`dist/liuyao.zip`、`dist/liuyao-divination.zip` 带顶层 Skill 文件夹，供 Claude 上传；`dist/liuyao-skills-plugin.zip` 同时包含 OpenAI 与 Claude 插件清单。

## 安装排盘模块

排盘模块需要 Node.js 20+、Python 3.10+ 和 npm：

```bash
cd liuyao-paipan-code
npm ci
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
npm link
npm test
```

安装后可以直接调用：

```bash
liuyao-paipan --lines 9 7 7 7 7 7 --day 甲子 --month 申
```

完整的 CLI、JavaScript API、Vue 组件及 HTTP 接口说明见 [`liuyao-paipan-code/README.md`](liuyao-paipan-code/README.md)。

## 仓库结构

```text
.
├── .agents/plugins/marketplace.json
├── .claude-plugin/
├── .codex-plugin/plugin.json
├── skills/
│   ├── liuyao-divination/
│   └── liuyao/
├── liuyao-paipan-code/
├── scripts/
│   ├── install.py
│   ├── package-skills.py
│   ├── test-distribution.py
│   └── validate-skills.mjs
└── LICENSE
```

## 验证

```bash
node scripts/validate-skills.mjs
python3 scripts/test-distribution.py

cd liuyao-paipan-code
npm ci
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
npm test
```

验证覆盖 Skill 元数据和本地链接、全部 Agent 安装目录、覆盖保护、上传包结构、4096 种爻值组合、64 卦宫位与世应、CLI、Python、HTTP、Vue 组件和异常输入。

## 使用许可

本仓库源码仅允许用于非商业研究。任何商业使用、商业集成、收费服务或以营利为目的的分发均被禁止，完整条款见 [LICENSE](LICENSE)。
