#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
repo='https://github.com/xiaofengche666/2026personalsite.git'
if [ ! -d .git ]; then
  git init -b main
fi
if ! git config user.name >/dev/null; then
  read -r -p 'Git commit 用户名：' commit_name
  git config user.name "$commit_name"
fi
if ! git config user.email >/dev/null; then
  read -r -p 'Git commit 邮箱（可用 GitHub noreply 邮箱）：' commit_email
  git config user.email "$commit_email"
fi
current_branch=$(git symbolic-ref --short HEAD)
if [ "$current_branch" != 'main' ]; then
  echo '当前分支不是 main，为避免修改已有分支，已停止。'
  exit 1
fi
if git remote get-url origin >/dev/null 2>&1; then
  current_remote=$(git remote get-url origin)
  if [ "$current_remote" != "$repo" ] && [ "$current_remote" != 'git@github.com:xiaofengche666/2026personalsite.git' ]; then
    echo 'origin 指向其他仓库，已停止；不会覆盖原仓库配置。'
    exit 1
  fi
else
  git remote add origin "$repo"
fi
if [ -n "$(git ls-files '.env' '.env.*' | sed '/^\.env\.example$/d')" ]; then
  echo '发现已被 Git 跟踪的 .env 文件，已停止。请先从 Git 跟踪中移除密钥文件。'
  exit 1
fi
git check-ignore -q .env || { echo '.env 未被忽略，已停止。'; exit 1; }
# 只暂存明确的网站代码；不暂存素材目录、密钥、ZIP 或预览文件。
git add .gitignore .env.example README.md package.json wrangler.jsonc index.html project.html scripts deployment/r2-manifest.json deployment/r2-cors.json assets/css assets/js assets/fonts assets/misc
# 防止提交此前已暂存的其他文件。
while IFS= read -r -d '' file; do
  case "$file" in
    .gitignore|.env.example|README.md|package.json|wrangler.jsonc|index.html|project.html|scripts/*|deployment/r2-manifest.json|deployment/r2-cors.json|assets/css/*|assets/js/*|assets/fonts/*|assets/misc/*) ;;
    *) echo "发现非代码范围的暂存文件，停止：$file"; exit 1 ;;
  esac
done < <(git diff --cached --name-only -z)
if ! git diff --cached --quiet; then
  git commit -m 'Configure portfolio with R2 media and Cloudflare Git deployment'
fi
# 不使用 force；远端若已有不同历史，Git 会安全拒绝，届时保留错误信息处理。
git push -u origin main
