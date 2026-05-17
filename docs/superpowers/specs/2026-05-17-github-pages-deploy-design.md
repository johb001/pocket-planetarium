# GitHub Pages 部署设计说明

## 目标

让 Pocket Planetarium 拥有公开可访问的在线页面，而不需要访问者 clone 仓库或本地运行。

## 方案

使用 `gh-pages` 分支承载 Vite 构建后的静态资源，并将 GitHub Pages source 配置为该分支根目录。仓库名是 `pocket-planetarium`，因此 Vite 的生产 `base` 使用 `/pocket-planetarium/`，保证 CSS、JS 和图片资源在 Pages 子路径下能正确加载。

## 交互和 UI

本次不改变页面功能和视觉，只增加部署能力和文档中的在线访问说明。

## 架构变更

- `vite.config.ts`：根据生产构建设置 `base: "/pocket-planetarium/"`。
- `gh-pages` 分支：保存 `dist/` 构建产物，作为 GitHub Pages 的发布源。
- `README.md`：加入在线访问地址和部署说明。

## 验证

- 自动化测试检查 Vite 配置包含正确 base。
- 自动化测试检查 README 记录 `gh-pages` 发布路径，并要求发布前运行 `npm test` 和 `npm run build`。
- 本地运行 `npm test`。
- 本地运行 `npm run build`，检查 `dist/index.html` 的资源路径包含 `/pocket-planetarium/`。
- 推送后用 GitHub CLI 确认 Pages source 和线上页面状态。

## 预期链接

`https://johb001.github.io/pocket-planetarium/`
