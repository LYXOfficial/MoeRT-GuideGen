import { execSync } from "node:child_process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * 应用版本号 v26.10.30.126 形式：v + yy.mm.dd + 本项目的第 n 个提交。
 * - dev（一律常驻不重启）固定返回 v.dev：构建时刻算出来的数字在 5173
 *   只算一次，之后再多提交也不会变，显示过期数字不如直接标明开发版；
 *   resolveConfig 在加载本文件前已把 NODE_ENV 置为 development/production，
 *   这里可以直接按它区分。
 * - 生产构建优先问 GitHub API 要总数（单请求，同时拿到最新提交日期），
 *   本地仓库是浅克隆、落后、甚至不存在都不影响——数字永远以 GitHub 为准。
 * - API 不可达（无网络 / 无权限 / 非 GitHub 仓库）时回落到本地
 *   `git rev-list --count HEAD`（浅克隆会先尝试 fetch --unshallow 拉全）。
 * - 都拿不到时退化为 v.dev。
 */
function repoSlugFromRemoteUrl(url: string): string | null {
  const m = url
    .trim()
    .match(/github\.com[/:]([^/]+\/[^/]+?)(?:\.git)?\s*$/i);
  return m ? m[1] : null;
}

function repoSlug(): string | null {
  const env = process.env.GITHUB_REPOSITORY;
  if (env && /^[^/]+\/[^/]+$/.test(env.trim())) return env.trim();
  try {
    const url = execSync("git remote get-url origin", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return repoSlugFromRemoteUrl(url);
  } catch {
    return null;
  }
}

function isShallowRepo(): boolean {
  try {
    return (
      execSync("git rev-parse --is-shallow-repository", {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim() === "true"
    );
  } catch {
    return false;
  }
}

/** 浅克隆时尽力拉全历史；拉不到也不抛错，调用方按现状计数并告警 */
function tryUnshallow(): void {
  try {
    execSync("git fetch --unshallow", {
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 120000,
    });
  } catch {
    console.warn(
      "[version] git fetch --unshallow 失败（可能无网络或无权限），" +
        "将按当前已拉取的历史计数，数字可能偏小。"
    );
  }
}

interface ApiVersion {
  date: string;
  count: string;
}

/** 直接问 GitHub 要总数（单请求）：Link 头的 last 页码即提交总数，
 * body 第一项即最新提交（含日期）。需要联网；私有仓库配 GITHUB_TOKEN。 */
async function versionFromGitHub(
  slug: string
): Promise<ApiVersion | null> {
  try {
    const headers: Record<string, string> = {
      "User-Agent": "moert-guidegen-version",
      Accept: "application/vnd.github+json",
    };
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(
      `https://api.github.com/repos/${slug}/commits?per_page=1`,
      { headers, signal: AbortSignal.timeout(15000) }
    );
    if (!res.ok) return null;
    const link = res.headers.get("link") || "";
    const lastPage = link.match(/[?&]page=(\d+)[^>]*>;\s*rel="last"/)?.[1];
    const body = (await res.json()) as Array<{
      commit?: { committer?: { date?: string } };
    }>;
    const total = lastPage ?? String(body.length);
    const iso = body[0]?.commit?.committer?.date || "";
    const m = iso.match(/^(\d{2})(\d{2})-(\d{2})-(\d{2})/);
    if (!total) return null;
    // 日期取最新提交的 UTC 日期（yy.mm.dd）；拿不到就只返回计数部分
    const date = m ? `${m[2]}.${m[3]}.${m[4]}` : "";
    if (!date) return null;
    return { date, count: total };
  } catch {
    return null;
  }
}

function versionFromGit(): string {
  if (isShallowRepo()) {
    console.warn(
      "[version] 检测到浅克隆仓库，先 git fetch --unshallow 拉全历史再计数…"
    );
    tryUnshallow();
    if (isShallowRepo()) {
      console.warn(
        "[version] 仍然是浅克隆，计数可能偏小。CI 请用 fetch-depth: 0 拉全量历史。"
      );
    }
  }
  const date = execSync(
    'git log -1 --date=format:"%y.%m.%d" --format="%ad"',
    { encoding: "utf8" }
  ).trim();
  const n = execSync("git rev-list --count HEAD", {
    encoding: "utf8",
  }).trim();
  if (!date || !n) throw new Error("empty version parts");
  return `v${date}.${n}`;
}

async function appVersion(): Promise<string> {
  if (process.env.NODE_ENV !== "production") return "v.dev";
  // 生产构建：先问 GitHub（数字永远以线上仓库为准，不受本地克隆深浅影响）
  const slug = repoSlug();
  if (slug) {
    const api = await versionFromGitHub(slug);
    if (api) return `v${api.date}.${api.count}`;
    console.warn(
      "[version] GitHub API 不可用（可能无网络、无权限或仓库非公开且未配 GITHUB_TOKEN），回落到本地 git 计数。"
    );
  }
  try {
    return versionFromGit();
  } catch {
    return "v.dev";
  }
}

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(await appVersion()),
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: [],
  },
}));
