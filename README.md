# 六爻 Skills

面向 Codex 的六爻起卦、排盘与断卦 Skills。仓库包含两套边界清晰的推断体系，以及为它们提供基础卦盘的本地排盘模块。

## 包含内容

| 目录 | 用途 |
| --- | --- |
| `skills/liuyao-divination/` | 通用六爻测算：世爻用神人、体用、双原、病药与专题判断 |
| `skills/liuyao/` | 六爻分层断卦：原时定局、日辰主宰、作用层级、动变顺序与真假空亡 |
| `liuyao-paipan-code/` | 六爻起卦、八宫纳甲、世应、六亲、六神、伏神、旬空及历法上下文 |

两套 Skill 各自保留方法边界。`liuyao` 不会默认混入 `liuyao-divination` 的双原、全局调平或流时重定吉凶规则。

## 安装 Skills

克隆仓库：

```bash
git clone https://github.com/songgoldenwind-crypto/liuyao-skills.git
cd liuyao-skills
```

复制两个 Skill 到个人 Skills 目录：

```bash
mkdir -p ~/.codex/skills
cp -R skills/liuyao-divination ~/.codex/skills/
cp -R skills/liuyao ~/.codex/skills/
```

重新启动 Codex 或开始新任务后即可使用，可以直接提出“六爻起卦并断卦”或指定其中一套方法。

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
├── skills/
│   ├── liuyao-divination/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── scripts/
│   └── liuyao/
│       ├── SKILL.md
│       └── references/
├── liuyao-paipan-code/
├── scripts/validate-skills.mjs
└── LICENSE
```

## 验证

```bash
node scripts/validate-skills.mjs

cd liuyao-paipan-code
npm ci
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
npm test
```

Skill 校验会检查元数据、目录名称和本地 Markdown 链接。排盘模块测试覆盖全部 4096 种爻值组合、64 卦宫位与世应、CLI、Python、HTTP、Vue 组件和异常输入。

## 使用许可

本仓库源码仅允许用于非商业研究。任何商业使用、商业集成、收费服务或以营利为目的的分发均被禁止，完整条款见 [LICENSE](LICENSE)。
