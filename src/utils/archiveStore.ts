import type { SaveData } from "../interfaces/editor";
import { createZipBlob } from "./zip";
import { migrateSaveData, LATEST_SAVE_VERSION } from "./saveMigrations";

// 导入工程文件的路径（Editor）也要先过一遍版本迁移，这里转出供调用
export { migrateSaveData };

/** 存档版本号的唯一取值点：写入用它、校验也用它，升版本只改 saveMigrations.ts 那一处 */
export const SAVE_VERSION = LATEST_SAVE_VERSION;

/**
 * 多存档存储层。
 *
 * 布局：
 *   guide-archives            -> { version, activeId, archives: [{id,name,createdAt,updatedAt}] }
 *   guide-archive:<id>        -> SaveData
 *   guide-autosave            -> 旧版单存档（仅用于一次性迁移）
 *
 * 索引和画板数据分开存：自动保存每 2 秒就会写一次画板数据，
 * 若把所有存档塞进一个 JSON，每次保存都要把所有存档重新序列化，
 * 既慢又容易在配额边缘把整个索引写坏。
 */

export const ARCHIVE_INDEX_KEY = "guide-archives";
export const ARCHIVE_DATA_PREFIX = "guide-archive:";
export const LEGACY_ARCHIVE_KEY = "guide-autosave";
export const CLEARING_MARK_KEY = "guide-clearing";

export interface ArchiveMeta {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface ArchiveIndexState {
  activeId: string;
  archives: ArchiveMeta[];
}

interface StoredIndex {
  version: number;
  activeId?: string;
  archives?: ArchiveMeta[];
}

const INDEX_VERSION = 1;

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readIndex(): StoredIndex | null {
  try {
    const parsed = safeParse<StoredIndex>(
      localStorage.getItem(ARCHIVE_INDEX_KEY)
    );
    if (!parsed || parsed.version !== INDEX_VERSION) return null;
    if (!Array.isArray(parsed.archives)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeIndex(index: StoredIndex): boolean {
  try {
    localStorage.setItem(ARCHIVE_INDEX_KEY, JSON.stringify(index));
    return true;
  } catch {
    return false;
  }
}

function dataKey(id: string) {
  return `${ARCHIVE_DATA_PREFIX}${id}`;
}

export function isSaveData(value: unknown): value is SaveData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<SaveData>;
  // 版本只校验区间，不校验「等于当前版本」：
  // 老存档（1 … SAVE_VERSION-1）放行，读的时候由 migrateSaveData 升级，
  // 这样升版本只需要动 saveMigrations.ts 一个常量，不会因为漏改这里而拒收老档
  return (
    typeof data.version === "number" &&
    data.version >= 1 &&
    data.version <= SAVE_VERSION &&
    Array.isArray(data.rows) &&
    !!data.config &&
    typeof data.config === "object"
  );
}

export function createEmptySaveData(theme: string): SaveData {
  return {
    version: SAVE_VERSION,
    config: { width: 512, showSpecLine: true, theme },
    rows: [[]],
  };
}

function makeId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    // 非安全上下文（http + 内网 IP）里 randomUUID 可能不可用
  }
  return `a-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 读取索引并把 activeId 修正到确实存在的存档上 */
export function listArchives(): ArchiveIndexState {
  const index = readIndex();
  if (!index?.archives || index.archives.length === 0) {
    return { activeId: "", archives: [] };
  }
  const archives = index.archives.filter(
    archive => archive && typeof archive.id === "string"
  );
  if (archives.length === 0) return { activeId: "", archives: [] };

  const activeId = archives.some(archive => archive.id === index.activeId)
    ? (index.activeId as string)
    : archives[0].id;
  return { activeId, archives };
}

/**
 * 首次启动 / 索引损坏时初始化。
 * 旧版单存档（guide-autosave）会迁移成第一个存档，迁移成功后删除旧键，
 * 避免以后清空索引时旧内容又“复活”。
 */
export function ensureArchives(options: {
  defaultName: string;
  legacyName: string;
  theme: string;
}): ArchiveIndexState {
  const existing = listArchives();
  if (existing.archives.length > 0) {
    // 索引在、但当前存档数据丢了（写了一半 / 手动清理）：补一份空画板，
    // 保证「当前存档」永远可读。
    // 注意只补 raw 真的不在的情况：raw 在但校验不过（未来版本 / 损坏）时
    // 绝不能覆盖，留给上层走「还原失败」流程，原始数据是用户唯一的备份
    if (
      !loadArchiveData(existing.activeId) &&
      !getArchiveRaw(existing.activeId)
    ) {
      saveArchiveData(
        existing.activeId,
        createEmptySaveData(options.theme),
        { touchMeta: false }
      );
    }
    return existing;
  }

  let migrated: SaveData | null = null;
  try {
    const legacyRaw = safeParse<unknown>(
      localStorage.getItem(LEGACY_ARCHIVE_KEY)
    );
    const legacy = migrateSaveData(legacyRaw);
    if (isSaveData(legacy)) migrated = legacy;
  } catch {
    // 读不到就当没有旧存档
  }

  const now = Date.now();
  const id = makeId();
  const meta: ArchiveMeta = {
    id,
    name: migrated ? options.legacyName : options.defaultName,
    createdAt: now,
    updatedAt: now,
  };
  const index: StoredIndex = {
    version: INDEX_VERSION,
    activeId: id,
    archives: [meta],
  };

  const data = migrated ?? createEmptySaveData(options.theme);
  const writeOrderOk = (() => {
    try {
      localStorage.setItem(dataKey(id), JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  })();
  if (!writeOrderOk) {
    // 连空画板都写不进去（隐私模式 / 配额满）：仍然返回一份内存索引，
    // 让编辑器可以正常使用，只是不会持久化。
    return { activeId: "", archives: [] };
  }
  const indexWritten = writeIndex(index);
  try {
    // 索引没写成功就保留 legacy 键：下次启动还能再迁移一次；
    // 否则旧单存档会变成没有任何索引引用的孤儿数据（看起来就是「存档没了」）
    if (migrated && indexWritten) {
      localStorage.removeItem(LEGACY_ARCHIVE_KEY);
    }
  } catch {
    // 删除失败无伤大雅，下次索引还在就不会再迁移
  }
  return { activeId: id, archives: [meta] };
}

export function getArchiveRaw(id: string): string | null {
  if (!id) return null;
  try {
    return localStorage.getItem(dataKey(id));
  } catch {
    return null;
  }
}

export function loadArchiveData(id: string): SaveData | null {
  const raw = getArchiveRaw(id);
  const parsed = safeParse<SaveData>(raw);
  // 版本迁移：老版本存档先逐级升级再校验（迁移表见 saveMigrations.ts），
  // 否则未来 version 升级时老存档会被当成「校验不过」拒收
  const migrated = migrateSaveData(parsed);
  return isSaveData(migrated) ? migrated : null;
}

export function saveArchiveData(
  id: string,
  data: SaveData,
  options: { touchMeta?: boolean } = {}
): boolean {
  if (!id) return false;
  try {
    localStorage.setItem(dataKey(id), JSON.stringify(data));
  } catch {
    return false;
  }

  if (options.touchMeta === false) return true;

  const index = readIndex();
  if (!index?.archives) return true;
  const target = index.archives.find(archive => archive.id === id);
  if (!target) return true;
  target.updatedAt = Date.now();
  writeIndex(index);
  return true;
}

export function setActiveArchiveId(id: string): void {
  const index = readIndex();
  if (!index?.archives) return;
  if (!index.archives.some(archive => archive.id === id)) return;
  if (index.activeId === id) return;
  index.activeId = id;
  writeIndex(index);
}

export function createArchive(
  name: string,
  data: SaveData
): ArchiveMeta | null {
  const now = Date.now();
  const meta: ArchiveMeta = {
    id: makeId(),
    name,
    createdAt: now,
    updatedAt: now,
  };

  const index = readIndex() ?? {
    version: INDEX_VERSION,
    activeId: meta.id,
    archives: [],
  };
  if (!index.archives) index.archives = [];

  try {
    localStorage.setItem(dataKey(meta.id), JSON.stringify(data));
  } catch {
    return null;
  }

  index.archives.push(meta);
  if (!index.activeId) index.activeId = meta.id;
  if (!writeIndex(index)) {
    try {
      localStorage.removeItem(dataKey(meta.id));
    } catch {}
    return null;
  }
  return meta;
}

export function renameArchive(id: string, name: string): boolean {
  const index = readIndex();
  if (!index?.archives) return false;
  const target = index.archives.find(archive => archive.id === id);
  if (!target) return false;
  target.name = name;
  return writeIndex(index);
}

export function duplicateArchive(
  id: string,
  name: string
): ArchiveMeta | null {
  const source = loadArchiveData(id);
  if (!source) return null;
  // 深拷贝一份，避免两个存档共享同一批 props 对象（后续编辑互相影响）
  const copy = safeParse<SaveData>(JSON.stringify(source));
  if (!copy) return null;
  return createArchive(name, copy);
}

/**
 * 删除存档。索引里还有其他存档时把 activeId 挪到第一个；
 * 删空时返回 activeId = ""，由调用方决定是否补一个空存档。
 */
export function deleteArchive(id: string): ArchiveIndexState {
  const index = readIndex();
  if (!index?.archives) return listArchives();
  index.archives = index.archives.filter(archive => archive.id !== id);
  try {
    localStorage.removeItem(dataKey(id));
  } catch {}

  if (index.archives.length === 0) {
    index.activeId = "";
    writeIndex(index);
    return { activeId: "", archives: [] };
  }
  if (!index.archives.some(archive => archive.id === index.activeId)) {
    index.activeId = index.archives[0].id;
  }
  writeIndex(index);
  return listArchives();
}

/** 把某个存档重置成空画板（保留存档条目和名字） */
export function resetArchiveData(id: string, theme: string): boolean {
  return saveArchiveData(id, createEmptySaveData(theme));
}

export function safeFileStem(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, "_").trim() || "archive";
}

/** 统一导出文件名：MoeRT_GuideGen_<kind>_yymmdd_<unix秒>[_<后缀>].<ext> */
export type ExportFileKind = "saves" | "saves-collection" | "exported-image";

export function exportFileName(
  kind: ExportFileKind,
  ext: string,
  suffix?: string
): string {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  const yymmdd = `${String(date.getFullYear()).slice(2)}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  const unix = Math.floor(date.getTime() / 1000);
  const extra = suffix ? `_${safeFileStem(suffix)}` : "";
  return `MoeRT_GuideGen_${kind}_${yymmdd}_${unix}${extra}.${ext}`;
}

/** 单存档下载名：MoeRT_GuideGen_saves_yymmdd_<unix秒>.json */
export function savesFileName(): string {
  return exportFileName("saves", "json");
}

/** zip 包内条目名：尾部追加存档名，整包解压后多个存档不重名 */
export function archiveFileName(name: string): string {
  return exportFileName("saves", "json", name);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  // 立刻回收会让部分浏览器来不及取数据，下一轮事件循环再释放
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadJson(text: string, filename: string): void {
  downloadBlob(new Blob([text], { type: "application/json" }), filename);
}

/**
 * 导出全部存档为 zip：压缩包里每个存档一个 .json，
 * 内容和「单独下载某个存档」完全一致（就是 localStorage 里的原始文本）。
 * 返回实际打包的存档数量（0 = 没有可导出的）。
 */
export function exportAllArchivesZip(): number {
  const state = listArchives();
  const entries: Array<{ name: string; content: string }> = [];
  for (const meta of state.archives) {
    const raw = getArchiveRaw(meta.id);
    if (!raw) continue;
    entries.push({ name: archiveFileName(meta.name), content: raw });
  }
  if (entries.length === 0) return 0;
  downloadBlob(
    createZipBlob(entries),
    exportFileName("saves-collection", "zip")
  );
  return entries.length;
}

/** 清除全部本地存档（含旧版单存档键）；调用方负责刷新页面 */
export function clearAllArchives(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (
        key &&
        (key === ARCHIVE_INDEX_KEY ||
          key === LEGACY_ARCHIVE_KEY ||
          key.startsWith(ARCHIVE_DATA_PREFIX))
      ) {
        keys.push(key);
      }
    }
    for (const key of keys) localStorage.removeItem(key);
  } catch {
    // 隐私模式下 clear 失败也不该阻塞页面刷新
  }
}
