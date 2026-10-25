/**
 * 极简 ZIP 打包（store 模式，不压缩）。
 *
 * 只为「导出全部存档」服务：存档就是几十 KB 的 JSON，塞进 zip 主要是方便一次下载、
 * 解压后每个文件还是原来的单存档格式，不想为了这点事再引一个压缩库。
 * 用 store（method 0）而不是 deflate：浏览器端要自己算 deflate 得靠
 * CompressionStream，兼容性参差，而且这点体积差异不值得。
 *
 * ⚠️ 崩溃页（ErrorBoundary）也会用到它：那里 React 状态已经不可靠，
 * 所以这个模块必须是**纯函数 + 只依赖浏览器内置 API**，不要 import 任何项目内的东西。
 */

export interface ZipEntry {
  /** 压缩包里的文件名（可用中文，会带上 UTF-8 标志位） */
  name: string;
  /** 文件内容（按 UTF-8 编码） */
  content: string;
}

/** CRC32 查表，按需初始化一次 */
let crcTable: Uint32Array | null = null;
const getCrcTable = (): Uint32Array => {
  if (crcTable) return crcTable;
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let bit = 0; bit < 8; bit++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  crcTable = table;
  return table;
};

const crc32 = (bytes: Uint8Array): number => {
  const table = getCrcTable();
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = table[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
};

/** ZIP 里的时间戳是 DOS 格式（1980 起算） */
const dosDateTime = (date: Date) => {
  const time =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    ((date.getSeconds() / 2) & 0x1f);
  const day =
    (((date.getFullYear() - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0x0f) << 5) |
    (date.getDate() & 0x1f);
  return { time, day };
};

/**
 * 把若干文本文件打成 zip。重复的文件名会自动加 `(2)`、`(3)` 后缀，
 * 免得解压时互相覆盖（存档名允许重名）。
 */
export function createZipBlob(entries: ZipEntry[], now = new Date()): Blob {
  const encoder = new TextEncoder();
  const { time, day } = dosDateTime(now);
  const chunks: BlobPart[] = [];
  const centralDirectory: Uint8Array[] = [];
  const usedNames = new Set<string>();
  let offset = 0;

  for (const entry of entries) {
    // 去重：foo.json / foo(2).json / foo(3).json
    let name = entry.name;
    if (usedNames.has(name)) {
      const dot = name.lastIndexOf(".");
      const stem = dot > 0 ? name.slice(0, dot) : name;
      const ext = dot > 0 ? name.slice(dot) : "";
      let index = 2;
      while (usedNames.has(`${stem}(${index})${ext}`)) index += 1;
      name = `${stem}(${index})${ext}`;
    }
    usedNames.add(name);

    const nameBytes = encoder.encode(name);
    const data = encoder.encode(entry.content);
    const crc = crc32(data);

    // 本地文件头 30 字节 + 文件名 + 内容
    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); // 签名
    lv.setUint16(4, 20, true); // 解压所需版本
    lv.setUint16(6, 0x0800, true); // 标志位 11：文件名是 UTF-8
    lv.setUint16(8, 0, true); // 压缩方法：0 = 不压缩
    lv.setUint16(10, time, true);
    lv.setUint16(12, day, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true); // 压缩后大小
    lv.setUint32(22, data.length, true); // 原始大小
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // 扩展字段长度
    local.set(nameBytes, 30);

    chunks.push(local, data);

    // 中央目录项 46 字节 + 文件名
    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true); // 生成版本
    cv.setUint16(6, 20, true); // 解压所需版本
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, time, true);
    cv.setUint16(14, day, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true); // 扩展字段
    cv.setUint16(32, 0, true); // 注释
    cv.setUint16(34, 0, true); // 起始磁盘号
    cv.setUint16(36, 0, true); // 内部属性
    cv.setUint32(38, 0, true); // 外部属性
    cv.setUint32(42, offset, true); // 本地头偏移
    central.set(nameBytes, 46);
    centralDirectory.push(central);

    offset += local.length + data.length;
  }

  const centralSize = centralDirectory.reduce((sum, c) => sum + c.length, 0);

  // 中央目录结束记录
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true); // 当前磁盘号
  ev.setUint16(6, 0, true); // 中央目录起始磁盘号
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true); // 注释长度

  return new Blob([...chunks, ...centralDirectory, end], {
    type: "application/zip",
  });
}
