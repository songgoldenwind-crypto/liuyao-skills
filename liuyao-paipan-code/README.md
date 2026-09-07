# 六爻排盘代码模块

一个可独立运行和复用的六爻排盘模块，提供铜钱起卦、手工起卦、64 卦查表、八宫归属、世应、纳甲、六亲、六神、伏神、旬空、常用神煞、历法上下文、命令行工具、HTTP 日历接口和 Vue 卦象组件。

当前版本为 `0.1.1`。爻值输入顺序一律是**初爻到上爻**：

| 数值 | 含义 | 阴阳 | 是否发动 |
| --- | --- | --- | --- |
| `6` | 老阴 | 阴 | 是 |
| `7` | 少阳 | 阳 | 否 |
| `8` | 少阴 | 阴 | 否 |
| `9` | 老阳 | 阳 | 是 |

## 运行要求

- Node.js 20 或更高版本
- Python 3.10 或更高版本
- npm

推荐在 Python 虚拟环境中安装依赖。先安装两种语言的依赖，再执行测试：

```bash
npm ci
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
npm test
```

如果不使用虚拟环境，也可以直接执行：

```bash
python3 -m pip install -r requirements.txt
```

Node 依赖由 `package-lock.json` 锁定，Python 历法依赖固定为 `lunar-python==1.4.8`。

## 命令行排盘

按已知日柱和月支排盘：

```bash
npm run paipan -- --lines 9 7 7 7 7 7 --day 甲子 --month 申
```

按当地民用时间自动计算农历、四柱和节气：

```bash
npm run paipan -- \
  --lines 9 7 7 7 7 7 \
  --at 2026-09-06T23:30:00 \
  --day-boundary zi23
```

安装为依赖后，也可以使用命令 `liuyao-paipan`：

```bash
liuyao-paipan --lines 9 7 7 7 7 7 --day 甲子 --month 申
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `--lines` | 是 | 六个 `6/7/8/9`，顺序为初爻到上爻 |
| `--at` | 否 | `YYYY-MM-DDTHH:mm[:ss]` 格式的当地民用时间 |
| `--day-boundary` | 否 | 日界规则：`midnight`（默认）或 `zi23` |
| `--day` | 否 | 合法六十甲子日柱；与 `--at` 同用时覆盖自动计算的日柱 |
| `--month` | 否 | 单个月支或合法月柱；与 `--at` 同用时覆盖自动计算的月柱 |
| `--help` | 否 | 显示帮助 |

只传 `--lines` 时仍会生成卦盘，但 `calendar` 为 `null`。缺少日柱时，六神默认从青龙起，旬空和按日计算的神煞为空。

`--at` 不接受时区后缀。调用方应传入目标地点的当地民用时间；模块不自动换算时区或真太阳时。

## JavaScript API

包入口导出 `useDivination`、`buildLiuyaoDetail`、64 卦数据、文本工具及输入校验工具：

```js
import {
  HEXAGRAM_DATA,
  buildLiuyaoDetail
} from 'liuyao-paipan-code'

const yaoValues = [9, 7, 7, 7, 7, 7]
const toCode = values => values
  .map(value => value === 7 || value === 9 ? '9' : '6')
  .join('')

const currentHexagram = HEXAGRAM_DATA.find(
  item => item.code === toCode(yaoValues)
)
const changedValues = yaoValues.map(
  value => value === 6 || value === 9 ? 15 - value : value
)
const changedHexagram = HEXAGRAM_DATA.find(
  item => item.code === toCode(changedValues)
)

const detail = buildLiuyaoDetail({
  yaoValues,
  currentHexagram,
  changedHexagram,
  calendar: {
    ganzhi: { day: '甲子', month: '丙申' },
    monthBranch: '申'
  },
  hexagramData: HEXAGRAM_DATA
})
```

`buildLiuyaoDetail()` 会验证六个爻值、本卦编码和变卦编码是否互相一致；输入不一致时返回 `null`。

主要返回字段：

- `palace`：本卦所属八宫、宫位角色和标题。
- `changedPalace`：变卦宫位；无动爻时为 `null`。
- `calendar`：原始历法上下文，并补充 `emptyBranches` 和 `shenSha`。
- `rows`：六行排盘，输出顺序是**上爻到初爻**。
- `rows[].actualChange`：这一位置是否为真实动爻。
- `rows[].hidden`：按缺失六亲规则实际显示的伏神。
- `rows[].hiddenCandidate`：该位置的本宫伏藏候选，供上层断卦规则使用。
- `rows[].current`、`rows[].changed`：本卦和变卦的爻形、纳甲、六亲与世应标记。

## Vue 起卦状态与组件

`useDivination()` 提供六次投币、手工录入、动爻切换和重置。默认通过运行环境的 `crypto.getRandomValues()` 生成三个独立币面：

```js
import { useDivination } from 'liuyao-paipan-code'

const divination = useDivination()

divination.doThrow()
divination.setYaoValues([9, 7, 7, 7, 7, 7])
divination.toggleChanging(0)
divination.reset()
```

测试或复现固定结果时，可以注入返回三个 `0/1` 的 `coinSource`：

```js
const throws = [[0, 0, 0], [1, 1, 1], [0, 1, 1], [0, 1, 0], [1, 0, 0], [1, 1, 0]]
const divination = useDivination({ coinSource: () => throws.shift() })
```

不提供 `coinSource` 时，运行环境必须支持 Web Crypto API。

`setYaoValues()` 只接受六个 `6/7/8/9`，非法输入会抛出 `InputValidationError`。手工录入没有真实投币记录，所以 `coinResults` 保持空数组。`manualChanging` 是由当前爻值自动计算的六个布尔值。

Vue 单文件组件通过子路径导入：

```vue
<script setup>
import HexagramChart from 'liuyao-paipan-code/vue'

const yaoValues = [9, 7, 7, 7, 7, 7]
</script>

<template>
  <HexagramChart :yao-values="yaoValues" :show-changing="true" />
</template>
```

组件只负责显示卦象，不负责生成历法或完整纳甲排盘。

## 历法函数

程序中可以直接调用 Node 到 Python 的历法桥接：

```js
import { getDivinationContext } from 'liuyao-paipan-code/calendar'

const context = await getDivinationContext(
  { year: 2026, month: 3, day: 17, hour: 15, minute: 39, second: 0 },
  'midnight',
  { timeoutMs: 10_000, outputLimitBytes: 1_048_576 }
)
```

公历年月日必须构成真实日期，年份范围为 `1–9999`；时、分、秒分别限制为 `0–23`、`0–59`、`0–59`。Python 子进程默认最多运行 10 秒，标准输出和错误输出合计最多 1 MiB。

在历法支持范围的最外侧，如果不存在前一个或后一个节令，`solarTerms.prevJie` 或 `solarTerms.nextJie` 返回 `null`。

Python 解释器按以下顺序查找：

1. `LIUYAO_PYTHON`
2. `PYTHON_BIN`
3. `/opt/miniconda3/bin/python3`
4. `python3`

## HTTP 日历接口

HTTP 服务只提供历法上下文，不接收六爻值，也不返回完整纳甲卦盘。完整排盘请使用 CLI 或 JavaScript API。

启动服务：

```bash
npm run server
```

默认监听 `3001` 端口，可以通过 `PORT` 环境变量修改。健康检查地址为 `GET /healthz`。

请求示例：

```bash
curl -X POST http://localhost:3001/api/divination/context \
  -H 'Content-Type: application/json' \
  -d '{
    "time": {
      "year": 2026,
      "month": 3,
      "day": 17,
      "hour": 15,
      "minute": 39,
      "second": 0
    },
    "dayBoundary": "midnight"
  }'
```

成功响应：

```json
{
  "success": true,
  "context": {
    "solar": {
      "year": 2026,
      "month": 3,
      "day": 17,
      "hour": 15,
      "minute": 39,
      "second": 0,
      "text": "2026年3月17日15时39分"
    },
    "lunar": { "text": "丙午年正月廿九日申时" },
    "ganzhi": {
      "year": "丙午",
      "month": "辛卯",
      "day": "庚寅",
      "hour": "甲申"
    },
    "monthBranch": "卯",
    "dayBoundary": "midnight",
    "solarTerms": {
      "prevJie": { "name": "惊蛰", "text": "2026-03-05 21:58:43" },
      "nextJie": { "name": "清明", "text": "2026-04-05 02:39:43" }
    }
  }
}
```

无效日期、字段类型或日界规则返回 HTTP `400`：

```json
{
  "success": false,
  "message": "day 不是有效的公历日期"
}
```

解释器缺失、历法计算失败或超时返回 HTTP `500`。

## 数据与文本

`src/data/hexagrams.js` 保存 64 卦原始文本（以繁体为主）、八卦数据和卦码表。`useDivination()` 返回卦象时会通过 OpenCC 转成简体，并保留卦名“乾”的字形。未经转换的数据仍可通过 `HEXAGRAM_DATA` 读取。

## 验证范围

执行：

```bash
npm run manifest:update
npm test
```

修改仓库文件后先更新 `MANIFEST.json`；测试会同时核对文件清单、大小和 SHA-256。

测试覆盖：

- 全部 `4⁶ = 4096` 种爻值组合。
- 64 卦八宫、宫位角色和世应位置。
- 纳甲排盘的基础样例、伏神候选、旬空和神煞。
- CLI 正常输入、非法日期、非法爻值、非法月支和两种日界。
- 包公开入口、起卦状态、简繁转换和输入一致性。
- Python 入口自身的有效日期、字段类型和日界校验。
- HTTP 成功响应、非法请求和错误状态码。
- Python 子进程超时和输出大小限制。
- Vue 单文件组件解析、脚本、模板和样式编译。

## 目录结构

```text
scripts/paipan.mjs                   命令行完整排盘
server/index.js                      HTTP 日历服务
server/python/divination_context.py  农历、四柱与节气计算
server/utils/divinationCalendar.js   Node/Python 桥接
server/utils/pythonProcess.js        Python 子进程保护
src/index.js                         JavaScript 包入口
src/composables/useDivination.js     投币与手工起卦状态
src/components/HexagramChart.vue     Vue 卦象组件
src/data/hexagrams.js                64 卦与八卦数据
src/utils/inputValidation.js         公共输入校验
src/utils/liuyaoDetail.js            八宫纳甲排盘核心
tests/                               自动化测试
```

## 当前限制

- 历法模块按调用方提供的当地民用时间计算，不自动处理时区、经度或真太阳时。
- HTTP 服务目前只封装历法上下文；完整排盘通过 CLI 或 JavaScript API 调用。
- 继续新增排法或神煞规则时，需要同时增加独立领域样例，避免只验证代码内部一致性。

本模块只包含六爻排盘所需的代码、组件、接口与测试。

## 使用许可

本模块采用 [MIT License](LICENSE)。
