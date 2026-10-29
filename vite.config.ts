import { execSync } from "node:child_process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * 应用版本号 v26.10.30.128 形式：v + yy.mm.dd + 本项目的第 n 个提交。
 * - dev（一律常驻不重启）固定返回 v.dev：构建时刻算出来的数字在 5173
 *   只算一次，之后再多提交也不会变，显示过期数字不如直接标明开发版；
 *   resolveConfig 在加载本文件前已把 NODE_ENV 置为 development/production，
 *   这里可以直接按它区分。
 * - 生产构建**直接问写死的 GitHub 仓库**要总数（单请求，同时拿到总数和最新
 *   提交日期）：不看本地 git remote、不看克隆深浅、不看本地是否落后 ——
 *   数字永远等于线上仓库的提交数。
 * - 只有 API 不可达（断网 / 限流 / 仓库改名）才回落到本地
 *   `git rev-list --count HEAD`（浅克隆会先尝试 fetch --unshallow 拉全）。
 * - 每次生产构建**必然打印一行** `[version] v… ← 来源`，来源里带「为什么没用
 *   API」的原因，方便定位（以前静默跳过，浅克隆告警和 API 失败分不清）。
 * - 都拿不到时退化为 v.dev。
 */

/** 仓库直接写死：不依赖 git remote，浅克隆 / 没有 .git / origin 被改过都不影响。
 *  换仓库或 CI 里跑别的 fork 时用 GITHUB_REPOSITORY=owner/repo 覆盖。 */
const REPO_SLUG =
  process.env.GITHUB_REPOSITORY?.trim() || "LYXOfficial/MoeRT-GuideGen";

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

interface ApiOk {
  ok: true;
  value: ApiVersion;
}
interface ApiFail {
  ok: false;
  reason: string;
}

/** 直接问 GitHub 要总数（单请求）：Link 头的 last 页码即提交总数，
 * body 第一项即最新提交（含日期）。私有仓库构建请配 GITHUB_TOKEN。 */
async function versionFromGitHub(slug: string): Promise<ApiOk | ApiFail> {
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
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const link = res.headers.get("link") || "";
    const lastPage = link.match(/[?&]page=(\d+)[^>]*>;\s*rel="last"/)?.[1];
    const body = (await res.json()) as Array<{
      commit?: { committer?: { date?: string } };
    }>;
    const total = lastPage ?? String(body.length);
    if (!total) return { ok: false, reason: "响应里没有提交数" };
    // API 给的是 UTC，这里按本机时区折成 yy.mm.dd，
    // 和本地 git 回退的 `--date=format:"%y.%m.%d"` 口径一致（否则东八区凌晨提交会差一天）
    const d = new Date(body[0]?.commit?.committer?.date || "");
    if (Number.isNaN(d.getTime())) {
      return { ok: false, reason: "响应里没有可解析的提交日期" };
    }
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return { ok: true, value: { date: `${yy}.${mm}.${dd}`, count: total } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: `请求失败：${msg}` };
  }
}

function versionFromGit(): { version: string; detail: string } {
  let shallow = isShallowRepo();
  if (shallow) {
    console.warn(
      "[version] 本地仓库是浅克隆，先 git fetch --unshallow 拉全历史再计数…"
    );
    tryUnshallow();
    shallow = isShallowRepo();
    if (shallow) {
      console.warn(
        "[version] 仍然是浅克隆，计数可能偏小。CI 请用 fetch-depth: 0 拉全量历史。"
      );
    }
  }
  const date = execSync('git log -1 --date=format:"%y.%m.%d" --format="%ad"', {
    encoding: "utf8",
  }).trim();
  const n = execSync("git rev-list --count HEAD", {
    encoding: "utf8",
  }).trim();
  if (!date || !n) throw new Error("empty version parts");
  return {
    version: `v${date}.${n}`,
    detail: `本地 git rev-list（第 ${n} 个提交${shallow ? "，浅克隆" : ""}）`,
  };
}

async function appVersion(): Promise<string> {
  if (process.env.NODE_ENV !== "production") return "v.dev";

  // 生产构建：先问写死的仓库（数字永远以线上为准，不受本地克隆深浅影响）
  const api = await versionFromGitHub(REPO_SLUG);
  if (api.ok) {
    console.log(
      `[version] v${api.value.date}.${api.value.count} ← GitHub API ${REPO_SLUG}（第 ${api.value.count} 个提交）`
    );
    return `v${api.value.date}.${api.value.count}`;
  }

  // 回落到本地计数，并把「为什么没用 API」一并打出来，别再静默跳过
  const apiReason = `GitHub API ${REPO_SLUG} 失败：${api.reason}`;
  try {
    const git = versionFromGit();
    console.warn(
      `[version] ${git.version} ← ${git.detail}；未用 API：${apiReason}`
    );
    return git.version;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`[version] v.dev ← 本地 git 也不可用（${msg}）；${apiReason}`);
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
