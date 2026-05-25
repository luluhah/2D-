# 测试报告

## 测试环境

- 日期：2026-05-23
- 浏览器目标：Codex in-app browser
- 桌面视口：1366x768
- 移动视口：390x844
- 项目构建：`npm run build`
- 代码检查：`npm run lint`

## 自动检查

- `npm run lint`：通过
- `npm run build`：通过

## 浏览器冒烟测试

- 页面标题为 `Game Asset Forge`：通过
- 工作台主界面可加载：通过
- Prompt 输入框可输入：通过
- 生成按钮可点击：通过
- 可生成 4 张 Mock 素材：通过
- 生成后自动选中新素材：通过
- 素材详情面板可显示：通过
- 历史记录区域可显示：通过
- 批量选择、批量 PNG、Sprite Sheet 控件可显示：通过
- 项目设置区域可显示：通过

## 响应式检查

- 桌面端 1366x768：无横向溢出
- 移动端 390x844：无横向溢出
- 移动端页面内容可纵向滚动查看

## 截图

- 桌面端截图：[qa-desktop.png](./qa-desktop.png)
- 移动端截图：[qa-mobile.png](./qa-mobile.png)
- 主流程截图：[verification-screenshot.png](./verification-screenshot.png)

## 已知限制

- 默认图片生成使用 Mock SVG；已提供阿里云百炼 / DashScope 后端代理，未在测试中使用真实密钥发起调用。
- 本地持久化已迁移到 IndexedDB；旧版 localStorage 数据会在启动时清理。
- 批量 PNG 下载通过浏览器连续触发下载，部分浏览器可能需要允许多文件下载。
- Sprite Sheet 导出要求选中的素材尺寸一致。
- ZIP 导出和真实 API 接入仍属于后续扩展项。
