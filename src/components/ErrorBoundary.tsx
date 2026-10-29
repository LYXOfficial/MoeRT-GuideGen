import React from "react";
import Salt from "./Salt";
import { getErrorLogs, type LogEntry } from "../utils/errorLog.ts";
import {
  clearAllArchives,
  downloadJson,
  exportAllArchivesZip,
  getArchiveRaw,
  listArchives,
  loadArchiveData,
  savesFileName,
} from "../utils/archiveStore.ts";

type CrashArchive = {
  id: string;
  name: string;
  updatedAt: number;
  rows: number;
  items: number;
  active: boolean;
  raw: string | null;
};

type State = {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  exportOpen: boolean;
  exportArchives: CrashArchive[];
};

// 崩溃页只依赖 prefers-color-scheme 的纯 CSS 深色适配：
// 此时 React / 主题 hook 可能已经不可用，绝不能再跑 JS 判断深浅色。
const CRASH_STYLES = `
.gg-crash-root {
  color-scheme: light dark;
  background: #fff;
  color: #111827;
  font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
}
.gg-crash-card { background: #fafafa; border: 1px solid #eee; }
.gg-crash-title { font-size: 20px; font-weight: 700; line-height: 1.4; margin: 0 0 8px; text-align: center; }
.gg-crash-desc { color: #666; line-height: 1.6; margin: 0 0 16px; text-align: center; }
.gg-crash-link { color: #2563eb; text-decoration: underline; }
.gg-crash-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 16px; }
.gg-crash-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 4px;
  padding: 8px 12px; border: 1px solid transparent; border-radius: 6px;
  cursor: pointer; font-family: inherit; font-size: 14px; line-height: 1.2;
  transition: background-color .15s ease, border-color .15s ease, color .15s ease;
}
.gg-crash-btn:disabled { cursor: not-allowed; opacity: .45; }
.gg-crash-btn-primary { background: #2563eb; color: #fff; }
.gg-crash-btn-primary:hover:not(:disabled) { background: #1d4ed8; }
.gg-crash-btn-danger { background: #ef4444; color: #fff; }
.gg-crash-btn-danger:hover:not(:disabled) { background: #dc2626; }
.gg-crash-btn-teal { background: #39c5bb; color: #fff; }
.gg-crash-btn-teal:hover:not(:disabled) { background: #2fb3aa; }
.gg-crash-btn-secondary { background: #eef2f7; border-color: #dbe3ee; color: #1f2937; }
.gg-crash-btn-secondary:hover:not(:disabled) { background: #e2e8f0; }
.gg-crash-btn-ghost { background: transparent; color: #4b5563; }
.gg-crash-btn-ghost:hover:not(:disabled) { background: rgba(15, 23, 42, .06); }
.gg-crash-btn-sm { padding: 5px 10px; font-size: 12px; }
.gg-crash-details { margin-bottom: 12px; white-space: pre-wrap; }
.gg-crash-details:last-of-type { margin-bottom: 0; }
.gg-crash-details summary { cursor: pointer; }
.gg-crash-error { color: #b91c1c; }
.gg-crash-pre { margin: 0; max-height: 180px; overflow: auto; }
.gg-crash-log-list { max-height: 400px; overflow: auto; padding: 8px 0; }
.gg-crash-log-item { margin-bottom: 8px; }
.gg-crash-log-time { color: #444; font-size: 12px; }
.gg-crash-log-stack { margin: 0; overflow: auto; color: #6b7280; }
.gg-crash-empty { color: #666; padding: 18px 0; text-align: center; font-size: 13px; }
.gg-crash-modal-backdrop {
  position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center;
  justify-content: center; padding: 16px; background: rgba(15, 23, 42, .55);
}
.gg-crash-modal {
  display: flex; flex-direction: column; width: min(560px, 100%);
  max-height: calc(100dvh - 32px); padding: 18px; border: 1px solid #e5e7eb;
  border-radius: 10px; background: #fff; color: #111827;
  box-shadow: 0 20px 50px rgba(0, 0, 0, .25);
}
.gg-crash-modal-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.gg-crash-modal-title { margin: 0; font-size: 16px; font-weight: 700; }
.gg-crash-icon-btn {
  padding: 2px 6px; border: none; border-radius: 6px; background: transparent;
  color: inherit; cursor: pointer; font-size: 22px; line-height: 1;
}
.gg-crash-icon-btn:hover { background: rgba(15, 23, 42, .08); }
.gg-crash-modal-hint { margin: 6px 0 12px; color: #6b7280; font-size: 12px; line-height: 1.6; }
.gg-crash-save-list { display: flex; flex-direction: column; gap: 8px; min-height: 0; overflow-y: auto; }
.gg-crash-save-row {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px;
  border: 1px solid #e5e7eb; border-radius: 8px; background: #fff;
}
.gg-crash-save-row.is-active { border-color: #93c5fd; background: #eff6ff; }
.gg-crash-save-main { flex: 1; min-width: 0; }
.gg-crash-save-name {
  display: flex; align-items: center; gap: 6px; overflow: hidden;
  font-size: 14px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap;
}
.gg-crash-save-meta { margin-top: 4px; color: #6b7280; font-size: 11px; line-height: 1.5; }
.gg-crash-badge {
  flex-shrink: 0; padding: 3px 6px; border-radius: 999px;
  background: #dbeafe; color: #1d4ed8; font-size: 10px; line-height: 1;
}
.gg-crash-modal-foot {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end;
  gap: 8px; margin-top: 14px; padding-top: 12px; border-top: 1px solid #e5e7eb;
}
.gg-crash-modal-actions { display: flex; flex-wrap: wrap; gap: 8px; }
@media (prefers-color-scheme: dark) {
  .gg-crash-root { background: #16161a; color: #f9f9f9; }
  .gg-crash-card { background: #232429; border-color: #3a3b42; }
  .gg-crash-desc { color: #bfc2cc; }
  .gg-crash-link { color: #6cb6ff; }
  .gg-crash-btn-secondary { background: #2a2b31; border-color: #3a3b42; color: #e5e7eb; }
  .gg-crash-btn-secondary:hover:not(:disabled) { background: #35363d; }
  .gg-crash-btn-ghost { color: #c7cad1; }
  .gg-crash-btn-ghost:hover:not(:disabled) { background: rgba(255, 255, 255, .08); }
  .gg-crash-error { color: #fca5a5; }
  .gg-crash-log-time { color: #bfc2cc; }
  .gg-crash-log-stack { color: #9ca3af; }
  .gg-crash-empty { color: #9ca3af; }
  .gg-crash-modal-backdrop { background: rgba(0, 0, 0, .65); }
  .gg-crash-modal { background: #232429; border-color: #3a3b42; color: #f9f9f9; }
  .gg-crash-icon-btn:hover { background: rgba(255, 255, 255, .08); }
  .gg-crash-modal-hint { color: #9ca3af; }
  .gg-crash-save-row { background: #1c1d22; border-color: #2e2e35; }
  .gg-crash-save-row.is-active { background: rgba(37, 99, 235, .14); border-color: rgba(108, 182, 255, .55); }
  .gg-crash-save-meta { color: #9ca3af; }
  .gg-crash-badge { background: rgba(108, 182, 255, .16); color: #9ccbff; }
  .gg-crash-modal-foot { border-top-color: #2e2e35; }
}
`;

function formatTime(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return String(timestamp);
  }
}

export default class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  State
> {
  state: State = {
    hasError: false,
    exportOpen: false,
    exportArchives: [],
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // 已在全局 logger 中记录，这里只保留到 state
    this.setState({ error, errorInfo });
  }

  private handleClearArchive = () => {
    if (
      !window.confirm(
        "确定清除全部存档并刷新吗？\n所有存档都会被永久删除（真的很久！！！）"
      )
    )
      return;
    try {
      clearAllArchives();
    } catch {}
    window.location.reload();
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private openExportDialog = () => {
    const { archives, activeId } = listArchives();
    const items: CrashArchive[] = archives.map(meta => {
      const data = loadArchiveData(meta.id);
      const rows = data?.rows?.length ?? 0;
      const itemsCount = (data?.rows ?? []).reduce(
        (sum, row) => sum + (row?.length ?? 0),
        0
      );
      return {
        id: meta.id,
        name: meta.name,
        updatedAt: meta.updatedAt,
        rows,
        items: itemsCount,
        active: meta.id === activeId,
        raw: getArchiveRaw(meta.id),
      };
    });
    this.setState({ exportOpen: true, exportArchives: items });
  };

  private closeExportDialog = () => {
    this.setState({ exportOpen: false });
  };

  private downloadArchive = (id: string) => {
    const item = this.state.exportArchives.find(archive => archive.id === id);
    if (!item?.raw) {
      window.alert("这个存档没有可导出的内容。");
      return;
    }
    downloadJson(item.raw, savesFileName());
  };

  private handleExportAll = () => {
    // 打成 zip：包内每个存档一个 .json，格式和「单独导出」完全一致
    const count = exportAllArchivesZip();
    if (count === 0) {
      window.alert("本地没有可导出的存档。");
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children as React.ReactElement;

    const logs = getErrorLogs();
    const hasArchives = this.state.exportArchives.length > 0;

    return (
      <div className="gg-crash-root font-sans w-screen h-screen flex flex-col items-center justify-center p-6">
        <style>{CRASH_STYLES}</style>
        <div className="gg-crash-card w-full max-w-3xl rounded-lg shadow-md p-5">
          <title>坏掉了！ - MoeRT_GuideGen</title>
          <h2 className="gg-crash-title">那...那个，网页坏掉惹QwQ～</h2>
          <p className="gg-crash-desc">
            可以先把存档导出备份，再试试刷新；如果还不行也可以清除存档。要是都不管用，
            那就来{" "}
            <a
              className="gg-crash-link"
              href="https://github.com/lyxofficial/moert/guidegen/issue"
            >
              Github Issue
            </a>{" "}
            找 Aria 试试嘛（？
          </p>
          <div className="gg-crash-actions">
            <button
              type="button"
              className="gg-crash-btn gg-crash-btn-primary"
              onClick={this.openExportDialog}
            >
              导出存档
            </button>
            <button
              type="button"
              className="gg-crash-btn gg-crash-btn-danger"
              onClick={this.handleClearArchive}
            >
              清除存档并刷新
            </button>
            <button
              type="button"
              className="gg-crash-btn gg-crash-btn-teal"
              onClick={this.handleRefresh}
            >
              刷新页面
            </button>
          </div>

          {this.state.error && (
            <details className="gg-crash-details">
              <summary>错误信息</summary>
              <div style={{ padding: "8px 0" }}>
                <div className="gg-crash-error">
                  {String(this.state.error.message || this.state.error)}
                </div>
                <pre className="gg-crash-pre">{this.state.error.stack}</pre>
              </div>
            </details>
          )}

          {this.state.errorInfo?.componentStack && (
            <details className="gg-crash-details">
              <summary>组件栈</summary>
              <pre className="gg-crash-pre">
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}

          <details className="gg-crash-details">
            <summary>最近日志（{logs.length}）</summary>
            <div className="gg-crash-log-list">
              {logs.length === 0 ? (
                <div className="gg-crash-empty">暂无日志</div>
              ) : (
                logs.slice(-200).map((l: LogEntry, i: number) => (
                  <div key={i} className="gg-crash-log-item">
                    <div className="gg-crash-log-time">
                      [{new Date(l.time).toLocaleString()}]{" "}
                      {l.level.toUpperCase()}
                    </div>
                    <pre className="gg-crash-pre">{l.message}</pre>
                    {l.stack && (
                      <pre className="gg-crash-log-stack">{l.stack}</pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </details>
        </div>

        {this.state.exportOpen && (
          <div
            className="gg-crash-modal-backdrop"
            role="presentation"
            onClick={this.closeExportDialog}
          >
            <div
              className="gg-crash-modal"
              role="dialog"
              aria-modal="true"
              aria-label="导出存档"
              onClick={event => event.stopPropagation()}
            >
              <div className="gg-crash-modal-head">
                <h3 className="gg-crash-modal-title">导出存档</h3>
                <button
                  type="button"
                  className="gg-crash-icon-btn"
                  onClick={this.closeExportDialog}
                  aria-label="关闭"
                >
                  ×
                </button>
              </div>
              <p className="gg-crash-modal-hint">
                点按右侧「导出」可下载单个存档；也可以一次性导出全部存档（打包成 zip，包内每个存档一个 json）。
              </p>

              <div className="gg-crash-save-list">
                {!hasArchives && (
                  <div className="gg-crash-empty">本地没有可导出的存档。</div>
                )}
                {this.state.exportArchives.map(archive => (
                  <div
                    key={archive.id}
                    className={`gg-crash-save-row ${
                      archive.active ? "is-active" : ""
                    }`}
                  >
                    <div className="gg-crash-save-main">
                      <div className="gg-crash-save-name">
                        {archive.name}
                        {archive.active && (
                          <span className="gg-crash-badge">当前</span>
                        )}
                      </div>
                      <div className="gg-crash-save-meta">
                        更新于 {formatTime(archive.updatedAt)} · {archive.rows}{" "}
                        行 · {archive.items} 个组件
                      </div>
                    </div>
                    <button
                      type="button"
                      className="gg-crash-btn gg-crash-btn-secondary gg-crash-btn-sm"
                      onClick={() => this.downloadArchive(archive.id)}
                    >
                      导出
                    </button>
                  </div>
                ))}
              </div>

              <div className="gg-crash-modal-foot">
                <div className="gg-crash-modal-actions">
                  <button
                    type="button"
                    className="gg-crash-btn gg-crash-btn-primary"
                    onClick={this.handleExportAll}
                    disabled={!hasArchives}
                  >
                    导出全部存档
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Salt />
      </div>
    );
  }
}
