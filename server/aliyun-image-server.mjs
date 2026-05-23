import http from "node:http";
import { existsSync, readFileSync } from "node:fs";

function loadLocalEnv() {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) {
      continue;
    }

    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^["']|["']$/g, "");
      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

loadLocalEnv();

const port = Number(process.env.PORT || 8787);
const apiKey = process.env.ALI_API_KEY || process.env.DASHSCOPE_API_KEY;
const model = process.env.ALI_IMAGE_MODEL || "wan2.7-image";
const endpoint =
  process.env.ALI_IMAGE_ENDPOINT ||
  "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";
const serverVersion = "2026-05-23.2";

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function buildPrompt(params) {
  const backgroundText =
    params.background === "transparent"
      ? "透明背景，单个主体"
      : params.background === "solid"
        ? "简洁纯色背景"
        : "简单游戏场景背景";
  const negativeText = params.negativePrompt ? `避免：${params.negativePrompt}` : "";

  return [
    params.prompt,
    `素材类型：${params.type}`,
    `风格：${params.style}`,
    `用途：2D 游戏素材，可用于游戏原型和资源库`,
    backgroundText,
    params.palette ? `主色调：${params.palette}` : "",
    negativeText,
  ]
    .filter(Boolean)
    .join("，");
}

function createAssetName(params, index, prefix = "asset") {
  const safePrefix = prefix.trim().replaceAll(/\s+/g, "-").toLowerCase() || "asset";
  const timestamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `${safePrefix}_${params.type}_${params.style}_${params.size}_${timestamp}_${index + 1}`;
}

async function imageUrlToDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`图片下载失败：${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "image/png";
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return `data:${contentType};base64,${base64}`;
}

function pickImageUrls(payload) {
  const candidates = [
    payload?.output?.choices?.flatMap((choice) =>
      choice?.message?.content?.map((item) => item?.image).filter(Boolean),
    ),
    payload?.output?.results?.map((item) => item?.url || item?.image_url).filter(Boolean),
    payload?.output?.images?.map((item) => item?.url || item?.image_url).filter(Boolean),
    payload?.output?.image_url ? [payload.output.image_url] : [],
  ];

  return candidates.flat().filter(Boolean);
}

async function generateAssets(params, options = {}) {
  if (!apiKey) {
    throw new Error("服务端缺少 ALI_API_KEY 或 DASHSCOPE_API_KEY");
  }

  console.log(
    `[generate] model=${model} endpoint=${endpoint} count=${params.count} prompt=${params.prompt?.slice(0, 40)}`,
  );

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: {
        messages: [
          {
            role: "user",
            content: [{ text: buildPrompt(params) }],
          },
        ],
      },
      parameters: {
        n: Math.min(params.count || 1, 4),
        size: "1K",
        watermark: false,
      },
    }),
  });

  const payload = await response.json();
  console.log("[aliyun-response]", response.status, JSON.stringify(payload).slice(0, 1200));
  if (!response.ok) {
    const detail = payload?.message || payload?.code || JSON.stringify(payload);
    throw new Error(`阿里云接口错误 ${response.status}：${detail}`);
  }

  const imageUrls = pickImageUrls(payload);
  if (imageUrls.length === 0) {
    throw new Error("阿里云接口未返回图片 URL");
  }

  const dataUrls = await Promise.all(imageUrls.map((url) => imageUrlToDataUrl(url)));
  return dataUrls.map((imageUrl, index) => ({
    id: crypto.randomUUID(),
    name: createAssetName(params, index, options.namingPrefix),
    imageUrl,
    prompt: params.prompt,
    negativePrompt: params.negativePrompt,
    type: params.type,
    style: params.style,
    size: params.size,
    background: params.background,
    palette: params.palette,
    favorite: false,
    createdAt: Date.now() + index,
  }));
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (request.method === "GET" && request.url === "/api/health") {
    sendJson(response, 200, {
      ok: true,
      version: serverVersion,
      model,
      endpoint,
      apiKeyLoaded: Boolean(apiKey),
      cwd: process.cwd(),
    });
    return;
  }

  if (request.method !== "POST" || request.url !== "/api/generate-assets") {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  try {
    const body = await readJson(request);
    const assets = await generateAssets(body.params, body.options);
    sendJson(response, 200, { assets });
  } catch (error) {
    console.error(error);
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "图片生成失败",
    });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Aliyun image proxy listening on http://127.0.0.1:${port}`);
  console.log(`Server version: ${serverVersion}`);
  console.log(`Aliyun image model: ${model}`);
  console.log(`Aliyun API key loaded: ${apiKey ? "yes" : "no"}`);
});
