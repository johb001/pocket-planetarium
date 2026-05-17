# Pocket Planetarium

Pocket Planetarium 是一个口袋星象馆：主界面用全屏 Canvas 展示真实亮星、太阳、月亮和可见行星，控制 dock 用于切换语言、设置观测地点/时间、管理星座线、标签和观测记录。

在线访问：

https://johb001.github.io/pocket-planetarium/

## 功能

- 真实亮星星表：包含 Sirius、Vega、Polaris 等常见亮星。
- 地点与时间：支持城市快捷项、纬度/经度输入、日期时间和“现在”按钮。
- 太阳系天体：使用 `astronomy-engine` 计算太阳、月亮和行星的近似位置。
- 中英文切换：页面文案支持中文和 English，并记住用户选择。
- 观测卡片：可保存当前星图状态并从列表恢复。

## 环境要求

- Node.js 18 或更高版本
- npm 9 或更高版本

## 安装

```bash
npm install
```

## 本地开发

```bash
npm run dev
```

启动后按终端提示打开本地地址。开发服务器默认绑定到 `127.0.0.1`。

## 测试

```bash
npm test
```

测试覆盖语言切换、真实星表、坐标转换、太阳系对象、命中测试、时间状态和观测记录逻辑。

## 构建

```bash
npm run build
```

构建流程会先执行 TypeScript 检查，再由 Vite 输出生产资源到 `dist/`。

## 部署

项目发布到 GitHub Pages，线上地址为 `https://johb001.github.io/pocket-planetarium/`。源码保留在 `master`，构建产物发布到 `gh-pages` 分支；发布前应依次运行 `npm test` 和 `npm run build`。Vite 的生产资源路径配置为 `/pocket-planetarium/`，用于匹配 GitHub Pages 的仓库子路径。

## 使用方式

1. 打开应用后，星图会铺满窗口。
2. 在控制 dock 顶部切换 `中文 / English`。
3. 选择城市，或手动输入纬度和经度。
4. 调整日期时间，或点击“现在”查看当前天空。
5. 开关星座线和标签来控制信息密度。
6. 点击星星、太阳、月亮或行星查看详情。
7. 保存观测记录后，可从记录列表恢复当时的夜间时间和选中对象。

## 数据来源与精度边界

恒星数据来自项目内置的真实亮星子集，字段参考 HYG Database / Astronomy Nexus 的星表结构，包含赤经、赤纬、视星等、颜色指数和距离等信息。为了保持浏览器体验轻量，本项目不会在运行时下载完整大型 CSV。

太阳、月亮和行星位置使用 `astronomy-engine` 在浏览器内计算。该项目适合教育、演示和作品集展示，不承诺科学观测级精度；完整 88 星座边界、专业历算校验和高精度观测规划不在当前版本范围内。

## 样式说明

- `src/styles.css` 提供全屏 Canvas、半透明控制 dock、移动端触控尺寸和常见控件状态。
- 控制 dock 复用 `src/assets/field-panel.png` 作为低调纹理。
- 视觉基调混合暖色、冷绿和深色底，不依赖单一蓝紫配色，也不包含营销页或装饰性光斑。
