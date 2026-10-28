# 2026personalsite

静态作品集。GitHub 保存代码、字体、3D 场景和公开资源清单；图片和视频从 R2 加载。密钥与素材不进仓库。

## 构建

Node.js 20.11+：

```bash
npm run build
```

输出 dist。构建无需 .env、R2 密钥或本地图片视频；需要 deployment/r2-manifest.json 中的公开链接真实可访问。

本地含完整素材时，`npm run build:standalone` 可生成自包含版本，仅用于排查。

## 绑定现有 Cloudflare Worker

线上 Worker 名称：2026personalsite。

1. 将本仓库代码上传 GitHub 的公开仓库 2026personalsite。
2. Cloudflare → Workers & Pages → 2026personalsite → Settings → Builds → Connect。
3. 选择 GitHub 仓库，生产分支 main，根目录仓库根目录。
4. Build command：`npm run build`。
5. Deploy command：`npx wrangler deploy`。
6. 每次 push main，Cloudflare 自动构建并发布。

wrangler.jsonc 已配置同名 Worker 和 dist 静态文件目录。不需要重建 Pages，也不需要修改现有 workers.dev 地址。

官方文档：https://developers.cloudflare.com/workers/ci-cd/builds/

## 更新媒体

先上传 R2，再更新 deployment/r2-manifest.json 中对应公开链接，最后提交代码。避免覆盖旧对象，必要时使用内容哈希或版本文件名。

## 当前状态

本地已准备代码与构建配置；GitHub 仓库创建、push 和 Cloudflare Git 授权尚未完成。R2 完整对象路径尚待核对。不要把当前配置视为已经联动上线。

## 已确认的仓库

https://github.com/xiaofengche666/2026personalsite

在本地终端运行 `bash scripts/push-github.sh`。首次 Git HTTPS 推送可能要求 GitHub 身份验证；浏览器登录不等于 Git 已登录。脚本不会强制覆盖远端历史，也不会提交 .env。若远端已有 README 导致推送拒绝，请保留报错再处理，不要 force push。

用户提供的图片 URL 确认 R2 使用 images/文件名的目录结构，但其他文件可用性尚未逐个验证。
