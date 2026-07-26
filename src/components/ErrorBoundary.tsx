import React from "react";
import { getErrorLogs, type LogEntry } from "../utils/errorLog.ts";

type State = {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
};

export default class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // 已在全局 logger 中记录，这里只保留到 state
    this.setState({ error, errorInfo });
  }

  private handleClearArchive = () => {
    if (
      !window.confirm(
        "确定清除存档并刷新吗？\n存档将会被永久删除（真的很久！！！）"
      )
    )
      return;
    try {
      localStorage.removeItem("guide-autosave");
    } catch {}
    window.location.reload();
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children as React.ReactElement;

    const logs = getErrorLogs();
    return (
      <div
        className="font-sans w-screen h-screen flex flex-col items-center justify-center p-6"
        style={{ background: "#fff" }}
      >
        <div
          className="w-full max-w-3xl rounded-lg shadow-md p-5"
          style={{ background: "#fafafa", border: "1px solid #eee" }}
        >
          <title>坏掉了！ - MoeRT_GuideGen</title>
          <h2 style={{ fontSize: 20, marginBottom: 8, textAlign: "center" }}>
            那...那个，网页坏掉惹QwQ～
          </h2>
          <p style={{ color: "#666", marginBottom: 16, textAlign: "center" }}>
            或许可以试试刷新或者清除存档的说，但是...如果这样子也没用的话，那就来{" "}
            <a
              href="https://github.com/lyxofficial/moert/guidegen/issue"
              style={{ textDecoration: "underline" }}
            >
              Github Issue
            </a>{" "}
            找 Aria 试试嘛（？
          </p>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 16,
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={this.handleClearArchive}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                background: "#ef4444",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              清除存档并刷新
            </button>
            <button
              type="button"
              onClick={this.handleRefresh}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                background: "#39c5bb",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              刷新页面
            </button>
          </div>

          {this.state.error && (
            <details style={{ whiteSpace: "pre-wrap", marginBottom: 12 }}>
              <summary style={{ cursor: "pointer" }}>错误信息</summary>
              <div style={{ padding: "8px 0" }}>
                <div style={{ color: "#b91c1c" }}>
                  {String(this.state.error.message || this.state.error)}
                </div>
                <pre style={{ overflow: "auto", maxHeight: 180 }}>
                  {this.state.error.stack}
                </pre>
              </div>
            </details>
          )}

          {this.state.errorInfo?.componentStack && (
            <details style={{ whiteSpace: "pre-wrap", marginBottom: 12 }}>
              <summary style={{ cursor: "pointer" }}>组件栈</summary>
              <pre style={{ overflow: "auto", maxHeight: 160 }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}

          <details style={{ whiteSpace: "pre-wrap" }}>
            <summary style={{ cursor: "pointer" }}>
              最近日志（{logs.length}）
            </summary>
            <div
              style={{ padding: "8px 0", maxHeight: "400px", overflow: "auto" }}
            >
              {logs.length === 0 ? (
                <div style={{ color: "#666" }}>暂无日志</div>
              ) : (
                logs.slice(-200).map((l: LogEntry, i: number) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: "#444" }}>
                      [{new Date(l.time).toLocaleString()}]{" "}
                      {l.level.toUpperCase()}
                    </div>
                    <pre style={{ margin: 0, overflow: "auto" }}>
                      {l.message}
                    </pre>
                    {l.stack && (
                      <pre
                        style={{
                          margin: 0,
                          overflow: "auto",
                          color: "#6b7280",
                        }}
                      >
                        {l.stack}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </details>
        </div>
        <img
          className="love-salt-kawaii-qwq fixed opacity-30 -right-50px bottom-0 z-0 w-600px select-none"
          src="/imgs/salt.png"
        />
      </div>
    );
  }
}
