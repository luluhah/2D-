# Game Asset Forge

一个面向 2D 游戏开发流程的素材生成工作台。用户可以输入文本描述，选择素材类型、风格、尺寸、背景、调色板和生成数量，快速得到可预览、收藏、管理和导出的 2D 游戏素材。

## 项目背景

本项目对应七牛云 × XEngineer 暑期实训营议题「2D 游戏素材生成」。目标不是只做一个“AI 生成图片按钮”，而是围绕游戏素材的真实使用流程，提供从需求输入、参数控制、结果预览、历史管理到素材导出的完整前端体验。

## 技术栈

- React
- TypeScript
- Vite
- CSS Modules
- lucide-react
- localStorage
- Canvas / Blob API

## 本地运行

```bash
npm install
npm run dev -- --host 127.0.0.1
```

浏览器访问：

```text
http://127.0.0.1:5173/
```

构建与检查：

```bash
npm run lint
npm run build
```

## 真实图片生成 API

项目默认使用 Mock 生成。若要切换到阿里云百炼 / DashScope 图片生成：

1. 准备本地环境变量文件 `.env.local`。
2. 写入服务端 API Key 和前端模式开关：

```bash
ALI_API_KEY=你的阿里云百炼或DashScope API Key
ALI_IMAGE_MODEL=wan2.7-image
VITE_GENERATOR_MODE=aliyun
```

3. 启动后端代理：

```bash
npm run dev:api
```

4. 另开一个终端启动前端：

```bash
npm run dev -- --host 127.0.0.1
```

前端会请求 `/api/generate-assets`，Vite 会把请求代理到本地 Node 服务。API Key 只在服务端进程中读取，不会被打包进浏览器代码。

注意：不要使用 `VITE_ALI_API_KEY` 存储密钥。所有 `VITE_` 前缀变量都会暴露给前端。

排错：

- 打开 `http://127.0.0.1:8787/api/health`，确认 `apiKeyLoaded` 为 `true`。
- 启动 `npm run dev:api` 后应看到 `Server version`、`Aliyun image model`、`Aliyun API key loaded` 三行日志。
- 如果前端返回 500，请查看 `dev:api` 终端中的 `[aliyun-response]` 日志，里面会显示阿里云接口返回的具体错误。
- 如果前端端口变成 `5174`，仍然可以使用，因为 Vite 会代理 `/api` 到 `8787`。
- 真实 API 返回的图片不会写入 localStorage，避免 base64 大图超过浏览器存储上限；刷新后可重新生成或使用 Mock 模式演示持久化。

## 测试记录

测试报告见：[docs/test-report.md](docs/test-report.md)

## 核心功能

- Prompt 输入与负向提示词
- 随机示例填充
- 素材类型选择：角色、道具、图标、地块、场景、UI
- 风格选择：像素风、手绘风、卡通风、低多边形、暗黑奇幻、科幻
- 尺寸选择：32x32、64x64、128x128、256x256、512x512
- 背景选择：透明、纯色、简单场景
- 调色板选择
- Mock 素材生成
- 生成结果网格
- 素材详情预览
- 收藏、删除、历史记录
- 从历史记录恢复生成参数
- 单张 PNG 下载
- 批量 PNG 下载
- Sprite Sheet 导出
- 素材元信息 JSON 导出
- localStorage 本地持久化
- 项目设置：项目名、默认风格、默认尺寸、命名前缀
- 生成失败后重试

## Mock 与真实 API 替换思路

当前项目使用 `AssetGenerator` 统一生成接口：

```ts
export type AssetGenerator = {
  generate(params: GenerateParams): Promise<Asset[]>;
};
```

MVP 阶段由 `mockGenerator` 返回稳定可演示的 SVG 素材。项目也提供了阿里云百炼 / DashScope 后端代理，`generatorService` 可通过 `VITE_GENERATOR_MODE=aliyun` 切换到真实接口：

```ts
fetch("/api/generate-assets", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(params),
});
```

这样前端 UI、状态管理和导出流程不需要重写，只替换生成服务即可。

## 素材来源说明

当前演示素材由前端根据参数动态生成 SVG 占位图，不依赖第三方图片资源。这样可以避免素材版权问题，也能保证演示时稳定可用。

## 项目亮点

- 以游戏素材生产流程为中心，而不是简单图片生成页。
- React + TypeScript 拆分清晰，核心类型覆盖生成参数、素材数据和生成状态。
- Mock 生成与真实 API 通过统一接口隔离，便于后续扩展。
- 已提供阿里云百炼 / DashScope 后端代理示例，API Key 不进入前端包。
- 使用 localStorage 支持无后端历史记录。
- 使用 Canvas / Blob API 支持 PNG、Sprite Sheet 和元信息导出。
- 项目级设置会影响默认参数和素材命名规则，便于维持一组素材的一致性。
- 工作台式布局适合前端面试展示交互、状态管理和工程组织能力。
