import { execSync } from "node:child_process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * 应用版本号 v.yy.mm.dd.n：日期取 HEAD 提交的日期，
 * n = 本项目的第 n 个提交（git rev-list 全量计数）。
 * git 不可用（CI 打包 / 非仓库目录）时退化为 v.dev。
 */
function appVersion(): string {
  try {
    const date = execSync(
      'git log -1 --date=format:"%y.%m.%d" --format="%ad"',
      { encoding: "utf8" }
    ).trim();
    const n = execSync("git rev-list --count HEAD", {
      encoding: "utf8",
    }).trim();
    if (!date || !n) return "v.dev";
    return `v.${date}.${n}`;
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
