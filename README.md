# 六爻 Agent Skills（全平台版）

面向各类 AI Agent 的六爻起卦、排盘与断卦能力包，基于 [Agent Skills](https://agentskills.io/) 开放格式构建。ChatGPT、Claude、Codex、WorkBuddy、Cursor、Gemini、GitHub Copilot、OpenCode、Windsurf、Cline 及其他兼容客户端共用同一套技能规则，各平台元数据和引用语法由安装器与打包脚本生成。

## 包含内容

| 目录 | 用途 |
| --- | --- |
| `skills/liuyao-divination/` | 通用六爻测算：世爻用神人、体用、双原、病药与专题判断 |
| `skills/liuyao/` | 六爻分层断卦：原时定局、日辰主宰、作用层级、动变顺序与真假空亡 |
| `liuyao-paipan-code/` | 六爻起卦、八宫纳甲、世应、六亲、六神、伏神、旬空及历法上下文 |

两套 Skill 各自保留方法边界。`liuyao` 不会默认混入 `liuyao-divination` 的双原、全局调平或流时重定吉凶规则。

## v1.2.0 全专题结果分层

针对婚恋、合作、在职事业、考试审批、出行航运、失物、健康和行情解读可能由单个术数节点直接跳到最终结果的问题，增加跨专题成立阶梯：

- 宽题先锁定一个现实目标；用户没有说明具体子目标时，只判断当前状态、下一阶段和一个决定条件。
- 婚恋与合作分别按接触、互动或磋商、确认或签订、履行与稳定推进；“合”本身不等于爱意、复合、签约或长期关系。
- 在职、考试和审批把流程启动、决定、正式文书与实际生效分开，官父有气不再直接等于升职、录取或获批。
- 出行与航运按准备、启程、途中、到达或返程判断；驿马、父动和险阻象不能单独确定成行或灾害。
- 失物把位置线索、可搜索、发现与取回分开；内外卦和捕盗象只安排排查优先级。
- 健康只断术数状态、是否作用到本人及盘内缓解条件；不由卦象补造器官、病名、治疗效果和预后。
- 行情把市场背景、方向触发、走势展开、个人执行与实际盈亏分开；静卦不补完整价格路径，行情看对也不等于本人获利。

## v1.1.2 财运与静卦收束

针对年度财运静卦被扩写成项目、合同、客户、投资和回款等多种场景的问题，增加专门限制：

- 未说明收入类型时，只判断总体资金流入、承接能力和留存条件，不混写工资、生意、项目和投资。
- 求财按来源条件、财的机会、形成兑现、实际到手、最终留存逐层判断。
- 财爻两现不自动解释为两个渠道；伏藏财源未开放时不写成客户或资金已经启动。
- 六爻皆静时不按十二个月旺衰编排全年事件，只保留当前状态、最有利窗口、最不利窗口和一个兑现条件。
- 静爻逢值、出空或得生先表示状态恢复；没有作用链时，不直接写成订单、成交、回款或落袋。

## v1.1.1 输出收束

根据真实使用中“解读过宽、主次不清”的反馈，`liuyao-divination` 增加结论漏斗和专题事件分层：

- 全盘仍完整检查，但默认只输出一个主判断、一条主因果链和一个最关键限制。
- 候选象义通常只保留最贴题的一项；第二项必须会改变结论，并说明如何用现实信息区分。
- 删除没有具体对象和结果差别的“有压力、会反复、有变化”等泛化句。
- 应期最多列三个不同窗口，并标明各自对应消息、接触、推进、确定或完成中的哪一层。
- 求职题按岗位存在、流程启动、联系面试、录用条件、入职稳定逐层判断，不再由官鬼出现直接跳到 Offer 或入职。

## v1.1.0 规则深化

`liuyao-divination` 在原有体用、双原与病药主线上吸收古籍中的条件规则，并通过旧卦回测校正了容易过度推断的环节：

- 用神按“本卦明现 → 变爻显出 → 本宫伏神”取用；用神多现时逐爻分工，不再按单一旺动空破条件删去其他候选。
- 明确区分爻的存在、受作用和主动作用资格。静爻出空或恢复强度，不自动取得主动生克权。
- 分开处理动空、静空、月破、日冲、合绊与进退；解除一种阻隔后，继续检查其余空破墓合与受克条件。
- 原起卦日固定为定局层。后续流年、流月、流日和流时只增加触发条件，不替换原日重判原局。
- 多动爻保留全部真实动变，按“触发 → 受作用 → 动变 → 后续”组织事件顺序。
- 求职、考试、出行、失物、健康和市场占断补入专题边界，区分职位与文书、出行条件与成行结果、市场走势与本人获利。

完整变化和兼容性说明见 [CHANGELOG.md](CHANGELOG.md)。

## 兼容范围

本仓库同时覆盖本地 Agent、IDE Agent、云端对话产品、插件市场和 Skills API。没有列出的兼容客户端也可通过开放标准目录或自定义安装目录使用。

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
| WorkBuddy | `~/.codebuddy/skills` 或上传 WorkBuddy ZIP | `.codebuddy/skills` |

所有客户端读取 `skills/` 下的同一份源文件，不维护内容不同的平台分叉。目录约定不同的客户端可用 `--agent custom` 指定准确位置。

## 一键安装

需要 Python 3.10+。先克隆仓库：

```bash
git clone https://github.com/songgoldenwind-crypto/liuyao-skills.git
cd liuyao-skills
```

推荐安装方式会同时部署到全部已适配 Agent 的原生用户目录：

```bash
python3 scripts/install.py --agent all --scope user
```

仅安装到开放标准通用目录：

```bash
python3 scripts/install.py
```

只为一个 Agent 安装到项目中：

```bash
python3 scripts/install.py --agent cursor --scope project --target /path/to/project
```

安装到 WorkBuddy 用户目录：

```bash
python3 scripts/install.py --agent workbuddy --scope user
```

适配任意自定义 Agent 目录：

```bash
python3 scripts/install.py --agent custom --destination /path/to/agent/skills
```

可以加 `--skill liuyao` 或 `--skill liuyao-divination` 只装一套；已有同名目录时安装器会停止，确认需要替换后加 `--force`。Windows 可把命令中的 `python3` 换成 `py`。

## 各平台分发

### WorkBuddy

从 [最新 Release](https://github.com/songgoldenwind-crypto/liuyao-skills/releases/latest) 下载 `liuyao-workbuddy.zip` 或 `liuyao-divination-workbuddy.zip`，在 WorkBuddy 的“专家·技能·连接器 → 技能 → 添加技能 → 上传技能”中分别导入。

WorkBuddy 专用包包含中英文展示说明、版本、作者和工具白名单，并将参考资料转换为 WorkBuddy 的 `@references/...` 引用形式。它用于 WorkBuddy 本地上传及开放平台解析；其他 Agent 继续使用标准包。

### Claude Code 插件市场

在 Claude Code 中执行：

```text
/plugin marketplace add songgoldenwind-crypto/liuyao-skills
/plugin install liuyao-skills@liuyao-skills
```

仓库同时提供 `.claude-plugin/plugin.json` 与 `.claude-plugin/marketplace.json`，两个 Skill 会以插件命名空间加载。

### Claude 网页、桌面端与 Cowork

从 [最新 Release](https://github.com/songgoldenwind-crypto/liuyao-skills/releases/latest) 下载 `liuyao.zip` 或 `liuyao-divination.zip`，在 `Customize > Skills` 中分别上传。ZIP 内保留了 Claude 要求的顶层 Skill 文件夹。

### OpenAI 平台

账户中如有 `插件 > Skills > 创建 > 从电脑上传` 入口，可从 [最新 Release](https://github.com/songgoldenwind-crypto/liuyao-skills/releases/latest) 下载两个 `.skill` 文件并分别上传。个人 Skill 在桌面端与网页/移动端可能需要分别添加。

仓库还包含原生 `.codex-plugin/plugin.json` 和 `.agents/plugins/marketplace.json`。ChatGPT 工作区管理员可在 `管理 > 插件 > 添加 > 导入市场` 中填入仓库 URL，并把路径留空：

```text
https://github.com/songgoldenwind-crypto/liuyao-skills
```

导入后可在 ChatGPT 网页、桌面和移动端以及 Codex 中安装。个人账户能否直接搜索到它取决于公开插件目录的审核与上架状态；仓库中的插件包已经具备提交和工作区导入所需结构。OpenAI Skills API 也可直接接收 Release 中的标准 ZIP。

### 通用上传包

生成所有分发文件：

```bash
python3 scripts/package-skills.py
```

`dist/*.skill` 与 `dist/*-agent.zip` 的 `SKILL.md` 位于压缩包根目录，分别供 Skill 文件上传入口和标准 ZIP 导入；`dist/liuyao.zip`、`dist/liuyao-divination.zip` 带顶层 Skill 文件夹，供 Claude 上传；`dist/*-workbuddy.zip` 带 WorkBuddy 元数据和 `@references` 引用；`dist/liuyao-skills-plugin.zip` 同时包含 OpenAI 与 Claude 插件清单。

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
├── .agents/plugins/marketplace.json   # OpenAI 市场适配
├── .claude-plugin/                    # Claude 市场适配
├── .codex-plugin/plugin.json          # OpenAI 插件适配
├── skills/
│   ├── liuyao-divination/
│   └── liuyao/
├── liuyao-paipan-code/
├── scripts/
│   ├── install.py
│   ├── package-skills.py
│   ├── test-distribution.py
│   ├── workbuddy_compat.py
│   └── validate-skills.mjs
├── CHANGELOG.md
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

验证覆盖 Skill 元数据和本地链接、全部 Agent 安装目录、WorkBuddy 元数据及引用转换、覆盖保护、上传包结构、4096 种爻值组合、64 卦宫位与世应、CLI、Python、HTTP、Vue 组件和异常输入。

## 使用许可

本仓库采用 [MIT License](LICENSE)。在保留版权声明和许可声明的前提下，可以使用、复制、修改、合并、发布、分发、再许可和销售软件副本。
