import { execSync } from "node:child_process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * 应用版本号 v26.10.30.126 形式：v + yy.mm.dd + 本项目的第 n 个提交，
 * 日期取 HEAD 提交的日期，n = git rev-list 全量计数。
 * git 不可用（CI 打包 / 非仓库目录）时退化为 v.dev。
 */
function appVersion(): string {
  try {
    // 浅克隆仓库里 rev-list 只能数到已拉取的部分，数字会偏小且看起来"合法"，
    // 必须 loud fail 提醒，否则生产环境会悄悄打出错误的版本号。
    const isShallow = execSync("git rev-parse --is-shallow-repository", {
      encoding: "utf8",
    }).trim();
    if (isShallow === "true") {
      console.warn(
        "[version] 检测到浅克隆仓库：git rev-list --count 只能统计已拉取的历史，" +
          "版本号会偏小。请用完整克隆构建（CI 上把 fetch-depth 设为 0）。"
      );
    }
    const date = execSync(
      'git log -1 --date=format:"%y.%m.%d" --format="%ad"',
      { encoding: "utf8" }
    ).trim();
    const n = execSync("git rev-list --count HEAD", {
      encoding: "utf8",
    }).trim();
    if (!date || !n) return "v.dev";
    return `v${date}.${n}`;
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
