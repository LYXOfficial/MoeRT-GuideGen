export type LogEntry = {
  time: number;
  level: "log" | "warn" | "error";
  message: string;
  stack?: string;
};

const MAX_ENTRIES = 500;
const buffer: LogEntry[] = [];

function push(entry: LogEntry) {
  buffer.push(entry);
  if (buffer.length > MAX_ENTRIES) buffer.shift();
}

export function getErrorLogs(): LogEntry[] {
  return buffer.slice();
}

const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

console.log = (...args: any[]) => {
  try {
    push({
      time: Date.now(),
      level: "log",
      message: args.map(String).join(" "),
    });
  } catch {}
  originalLog.apply(console, args as any);
};
console.warn = (...args: any[]) => {
  try {
    push({
      time: Date.now(),
      level: "warn",
      message: args.map(String).join(" "),
    });
  } catch {}
  originalWarn.apply(console, args as any);
};
console.error = (...args: any[]) => {
  try {
    const last = args[args.length - 1] as any;
    push({
      time: Date.now(),
      level: "error",
      message: args.map(String).join(" "),
      stack: last?.stack ? String(last.stack) : undefined,
    });
  } catch {}
  originalError.apply(console, args as any);
};

// Global error handlers
window.addEventListener("error", e => {
  try {
    push({
      time: Date.now(),
      level: "error",
      message: String(e.message),
      stack: String(e.error?.stack || `${e.filename}:${e.lineno}`),
    });
  } catch {}
});
window.addEventListener("unhandledrejection", e => {
  try {
    const reason: any = (e as any).reason;
    push({
      time: Date.now(),
      level: "error",
      message: String(reason?.message || reason),
      stack: String(reason?.stack || ""),
    });
  } catch {}
});
