# 提交检查清单

## 需要上传到 GitHub

- `src/`
- `server/`
- `docs/`
- `.env.example`
- `.gitignore`
- `.prettierrc`
- `eslint.config.js`
- `index.html`
- `package.json`
- `package-lock.json`
- `README.md`
- `tsconfig.app.json`
- `tsconfig.json`
- `tsconfig.node.json`
- `vite.config.ts`

## 不要上传到 GitHub

- `node_modules/`
- `dist/`
- `.env`
- `.env.local`
- 任何真实 API Key

## 提交前自测

```bash
npm install
npm run lint
npm run build
npm run dev -- --host 127.0.0.1
```

## 真实 API 自测

```bash
npm run dev:api
```

检查：

```text
http://127.0.0.1:8787/api/health
```

确认 `apiKeyLoaded` 是 `true` 后，再启动前端真实 API 模式。
