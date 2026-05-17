# Real Sky I18n Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Pocket Planetarium 升级为使用真实亮星、观测地点/时间和中英文切换的浏览器星图。

**Architecture:** 保持现有 Vite + TypeScript + Canvas 架构，新增 i18n、真实星表、坐标转换和太阳系封装模块。渲染层仍接收投影后的星表，主应用负责把地点、时间、语言和观测卡片状态组合起来。

**Tech Stack:** Vite、TypeScript、Vitest、Canvas、astronomy-engine、静态亮星数据、localStorage。

---

## 文件结构

- `src/types.ts`：扩展 `Star`、`AppState`，新增 `Locale`、`ObserverLocation`、`SkyObjectKind`。
- `src/i18n/messages.ts`：中文和英文文案字典。
- `src/i18n/locale.ts`：语言检测、切换、持久化。
- `src/sky/realCatalog.ts`：真实亮星静态数据。
- `src/sky/coordinates.ts`：儒略日、恒星时、赤经赤纬到地平坐标、屏幕投影。
- `src/sky/solarSystem.ts`：封装 `astronomy-engine`，返回太阳、月亮、行星。
- `src/sky/catalog.ts`：从真实星表和天空上下文生成可渲染 `StarCatalog`。
- `src/main.ts`：加入语言、地点、时间控件。
- `src/styles.css`：补充双语、地点时间控件样式。
- `README.md`：说明真实数据来源、精度边界和双语使用。
- `test/i18n.test.ts`、`test/coordinates.test.ts`、`test/realCatalog.test.ts`、`test/solarSystem.test.ts`、更新 `test/catalog.test.ts`。

## Task 1: i18n 文案与语言持久化

**Files:**
- Create: `src/i18n/messages.ts`
- Create: `src/i18n/locale.ts`
- Create: `test/i18n.test.ts`
- Modify: `src/types.ts`

- [ ] 写失败测试：中文和英文文案 key 完全一致，浏览器语言 `zh-CN` 选择中文，`fr-FR` 默认英文，localStorage 中选择优先。
- [ ] 运行 `npm test -- test/i18n.test.ts`，预期因模块不存在失败。
- [ ] 实现 `Locale` 类型、`messages`、`detectLocale`、`loadLocale`、`saveLocale`、`toggleLocale`。
- [ ] 运行 `npm test -- test/i18n.test.ts`，预期通过。
- [ ] 提交 `feat: add bilingual message catalog`。

## Task 2: 坐标转换

**Files:**
- Create: `src/sky/coordinates.ts`
- Create: `test/coordinates.test.ts`

- [ ] 写失败测试：J2000 儒略日为 `2451545.0`；赤纬等于观测纬度且时角为 0 时高度角接近 90；地平线以下对象 `visible` 为 false。
- [ ] 运行 `npm test -- test/coordinates.test.ts`，预期因模块不存在失败。
- [ ] 实现 `toJulianDate`、`getLocalSiderealTimeDegrees`、`equatorialToHorizontal`、`projectHorizontal`。
- [ ] 运行 `npm test -- test/coordinates.test.ts`，预期通过。
- [ ] 提交 `feat: add sky coordinate projection`。

## Task 3: 真实亮星星表

**Files:**
- Create: `src/sky/realCatalog.ts`
- Modify: `src/sky/catalog.ts`
- Modify: `test/catalog.test.ts`
- Create: `test/realCatalog.test.ts`

- [ ] 写失败测试：真实星表包含 Sirius、Vega、Polaris；每颗星有合法赤经、赤纬、星等；`createCatalog` 返回可见星且 seed 不再影响真实数据。
- [ ] 运行相关测试，预期失败。
- [ ] 实现 `BRIGHT_STARS` 和 `createCatalogForSky(context)`，保留 `createCatalog()` 作为香港当前时间默认适配。
- [ ] 运行 `npm test -- test/realCatalog.test.ts test/catalog.test.ts`，预期通过。
- [ ] 提交 `feat: use real bright star catalog`。

## Task 4: 太阳系天体

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/sky/solarSystem.ts`
- Create: `test/solarSystem.test.ts`

- [ ] 安装 `astronomy-engine`。
- [ ] 写失败测试：给定时间地点时返回太阳、月亮、火星等稳定结构；计算失败时返回空数组。
- [ ] 运行 `npm test -- test/solarSystem.test.ts`，预期因模块不存在失败。
- [ ] 实现 `getSolarSystemObjects`，把天体转换为可渲染对象。
- [ ] 运行 `npm test -- test/solarSystem.test.ts`，预期通过。
- [ ] 提交 `feat: add solar system sky objects`。

## Task 5: 主界面接入真实星图与双语

**Files:**
- Modify: `src/main.ts`
- Modify: `src/styles.css`
- Modify: `src/types.ts`

- [ ] 写或更新最小 UI 逻辑测试不可行时，先依赖已有模块测试，手动实现后用浏览器冒烟验证。
- [ ] 扩展 `AppState`：`locale`、`observer`、`observedAt`、错误提示。
- [ ] 加入语言切换、城市选择、纬度/经度输入、日期时间输入、现在按钮。
- [ ] 所有 UI 文案从 `messages[state.locale]` 读取。
- [ ] 渲染时调用真实 `createCatalogForSky` 和 `getSolarSystemObjects`。
- [ ] 提交 `feat: wire real sky bilingual controls`。

## Task 6: 文档、验证与上传

**Files:**
- Modify: `README.md`

- [ ] README 增加真实星图、数据来源、精度边界、中英文切换说明。
- [ ] 运行 `npm test`。
- [ ] 运行 `npm run build`。
- [ ] 浏览器冒烟测试：切换语言、修改地点/时间、Canvas 非空、保存观测。
- [ ] 提交 `docs: describe real sky bilingual mode`。
- [ ] 更新 GitHub 仓库远端。
