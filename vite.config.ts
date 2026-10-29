import { execSync } from "node:child_process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * 应用版本号 v.yy.mm.dd.n：n = 该日期的第 n 个提交（git log 时间正序），
 * 取 HEAD 所在的提交。git 不可用（CI 打包 / 非仓库目录）时退化为 v.dev。
 */
function appVersion(): string {
  try {
    const out = execSync(
      'git log --reverse --date=format:"%y.%m.%d" --format="%ad"',
      { encoding: "utf8" }
    ).trim();
    if (!out) return "v.dev";
    const counts = new Map<string, number>();
    let version = "v.dev";
    for (const line of out.split("\n")) {
      const date = line.trim();
      if (!date) continue;
      const n = (counts.get(date) ?? 0) + 1;
      counts.set(date, n);
      version = `v.${date}.${n}`;
    }
    return version;
  } catch {
    return "v.dev";
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion()),
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["s8.ywit.xyz"],
  },
});
