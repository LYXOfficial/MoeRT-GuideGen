import {
  Button,
  Input,
  Modal,
  Spin,
} from "@douyinfe/semi-ui";
import {
  IconCheckCircleStroked,
  IconCopyStroked,
  IconDeleteStroked,
  IconDownloadStroked,
  IconEditStroked,
  IconPlus,
  IconUpload,
} from "@douyinfe/semi-icons";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ArchiveMeta } from "../utils/archiveStore";

export interface ArchiveSummary {
  rows: number;
  items: number;
  themeName: string;
}

interface ArchiveDialogProps {
  visible: boolean;
  onCancel: () => void;
  archives: ArchiveMeta[];
  activeId: string;
  getSummary: (id: string) => ArchiveSummary | null;
  /** 返回是否切换成功；失败时弹窗保持打开 */
  onSwitch: (id: string) => Promise<boolean>;
  onCreate: () => Promise<void> | void;
  /** 导入工程 JSON：由 Editor 处理，成功后会自动关闭弹窗 */
  onImport: () => void;
  /** 清除全部本地存档（弹窗内二次确认后调用） */
  onClearAll: () => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  /** 导出全部存档为 zip */
  onExportAll: () => void;
}

const MAX_NAME_LENGTH = 60;

/**
 * 多存档管理弹窗。
 * 桌面 / 移动端共用：桌面从顶栏存档按钮打开，移动端从「更多」菜单打开。
 */
export default function ArchiveDialog({
  visible,
  onCancel,
  archives,
  activeId,
  getSummary,
  onSwitch,
  onCreate,
  onImport,
  onClearAll,
  onRename,
  onDuplicate,
  onDelete,
  onDownload,
  onExportAll,
}: ArchiveDialogProps) {
  const { t, i18n } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  // 删除确认用受控 Modal：Semi 的静态 Modal.confirm 会在自己的 onOk 里同步卸载
  // 独立 React root，父级一改 state 就报「synchronously unmount a root」告警
  const [pendingDelete, setPendingDelete] = useState<ArchiveMeta | null>(null);
  const [pendingClear, setPendingClear] = useState(false);

  // 关闭后清掉临时态，下次打开是干净的
  useEffect(() => {
    if (!visible) {
      setEditingId(null);
      setDraftName("");
      setBusyId(null);
      setCreating(false);
      setPendingDelete(null);
      setPendingClear(false);
    }
  }, [visible]);

  // 新建存档后列表不关闭，把新的活动行滚进可视区（顺序本身不变）
  useEffect(() => {
    if (!visible || !activeId) return;
    const row = document.querySelector<HTMLElement>(
      `[data-archive-row="${activeId}"]`
    );
    row?.scrollIntoView({ block: "nearest" });
  }, [visible, activeId, archives.length]);

  const formatTime = (timestamp: number) => {
    try {
      return new Intl.DateTimeFormat(i18n.language, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(timestamp));
    } catch {
      return new Date(timestamp).toLocaleString();
    }
  };

  const startRename = (archive: ArchiveMeta) => {
    setEditingId(archive.id);
    setDraftName(archive.name);
  };

  const commitRename = () => {
    if (!editingId) return;
    const name = draftName.trim().slice(0, MAX_NAME_LENGTH);
    if (name) onRename(editingId, name);
    setEditingId(null);
    setDraftName("");
  };

  const handleSwitch = async (id: string) => {
    if (busyId || id === activeId) return;
    setBusyId(id);
    try {
      await onSwitch(id);
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    try {
      await onCreate();
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = (archive: ArchiveMeta) => {
    setPendingDelete(archive);
  };

  const deleteConfirmContent = pendingDelete
    ? archives.length === 1
      ? t("saves.archives.deleteLastContent", { name: pendingDelete.name })
      : pendingDelete.id === activeId
        ? t("saves.archives.deleteActiveConfirmContent", {
            name: pendingDelete.name,
          })
        : t("saves.archives.deleteConfirmContent", {
            name: pendingDelete.name,
          })
    : "";

  // 固定按创建顺序排列：切换活动存档时列表不能跳位
  const ordered = [...archives].sort((a, b) => a.createdAt - b.createdAt);

  // 摘要要解析每个存档的 JSON；重命名时弹窗会随输入重渲染，
  // 缓存起来，别每敲一个字就把所有存档重新 parse 一遍
  const summaries = useMemo(() => {
    const map: Record<string, ArchiveSummary | null> = {};
    for (const archive of archives) {
      map[archive.id] = getSummary(archive.id);
    }
    return map;
  }, [archives, getSummary]);

  return (
    <>
      {/* 宽度 600 而不是 560：说明文字一行要 300px、两个按钮 216px，加间距共 528，
          560 时正文只剩 282px，会被挤成两行、右边还留一大块空白（用户反馈过） */}
      <Modal
        title={
        <div className="flex items-center gap-2">
          <span>{t("saves.archives.title")}</span>
          <span className="text-xs font-normal text-gray-400 dark:text-gray-500">
            {archives.length}
          </span>
        </div>
      }
      visible={visible}
      onCancel={onCancel}
      footer={null}
      centered
      width={600}
      style={{ maxWidth: "calc(100vw - 24px)" }}
      bodyStyle={{ paddingTop: 4, paddingBottom: 20 }}
    >
      <div className="font-sans">
        {/* 宽度够时两个按钮并排一行，放不下（窄屏/长语言）才整组换到下一行；
            按钮自身不折行，免得「导入存档」被拆成两行 */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 mb-3">
          <p className="m-0 min-w-0 flex-1 basis-40 text-pretty text-xs leading-5 text-gray-500 dark:text-gray-400">
            {t("saves.archives.hint")}
          </p>
          <div className="flex shrink-0 flex-nowrap items-center gap-2">
            <Button
              icon={<IconUpload />}
              size="small"
              theme="light"
              className="whitespace-nowrap"
              onClick={onImport}
              style={{ height: 28, paddingTop: 4, paddingBottom: 4 }}
            >
              {t("saves.archives.importSave")}
            </Button>
            <Button
              icon={<IconPlus />}
              size="small"
              theme="solid"
              type="primary"
              loading={creating}
              className="whitespace-nowrap"
              onClick={handleCreate}
              style={{ height: 28, paddingTop: 4, paddingBottom: 4 }}
            >
              {t("saves.archives.new")}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 max-h-[52vh] overflow-y-auto overscroll-contain pr-0.5 pb-1">
          {ordered.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-400">
              {t("saves.archives.empty")}
            </div>
          )}
          {ordered.map(archive => {
            const active = archive.id === activeId;
            const summary = summaries[archive.id] ?? null;
            const editing = editingId === archive.id;
            const busy = busyId === archive.id;
            return (
              // 行内还有下载/删除等按钮，不能把整行换成 <button>（按钮不能嵌套）
              // biome-ignore lint/a11y/useSemanticElements: 整行是切换热区，内部另有操作按钮
              <div
                key={archive.id}
                data-archive-row={archive.id}
                role="button"
                tabIndex={0}
                aria-label={t("saves.archives.load")}
                onClick={() => {
                  if (!editing) void handleSwitch(archive.id);
                }}
                onKeyDown={event => {
                  if (editing) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    void handleSwitch(archive.id);
                  }
                }}
                className={`group relative rounded-lg border px-3 py-2.5 transition-colors cursor-pointer ${
                  active
                    ? "border-blue-400 bg-blue-50/70 dark:border-blue-500/70 dark:bg-blue-500/10"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50 dark:border-[#2e2e35] dark:bg-[#232429] dark:hover:border-blue-500/50 dark:hover:bg-[#2a2b31]"
                }`}
                style={{ cursor: editing ? "default" : "pointer" }}
              >
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {active && (
                        <IconCheckCircleStroked
                          size="small"
                          style={{ color: "#1890ff", flexShrink: 0 }}
                        />
                      )}
                      {editing ? (
                        <Input
                          size="small"
                          autoFocus
                          value={draftName}
                          maxLength={MAX_NAME_LENGTH}
                          placeholder={t("saves.archives.renamePlaceholder")}
                          onClick={event => event.stopPropagation()}
                          onChange={value => setDraftName(String(value))}
                          onBlur={commitRename}
                          onEnterPress={commitRename}
                          onKeyDown={event => {
                            if (event.key === "Escape") {
                              event.preventDefault();
                              setEditingId(null);
                              setDraftName("");
                            }
                          }}
                          style={{ maxWidth: 280 }}
                        />
                      ) : (
                        <span className="truncate font-medium text-sm text-gray-800 dark:text-gray-100">
                          {archive.name}
                        </span>
                      )}
                      {active && !editing && (
                        <span className="shrink-0 rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] leading-none text-blue-600 dark:text-blue-300">
                          {t("saves.archives.current")}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                      <span>{t("saves.archives.updatedAt", { time: formatTime(archive.updatedAt) })}</span>
                      <span className="text-gray-300 dark:text-gray-600">·</span>
                      <span>
                        {t("saves.archives.meta", {
                          rows: summary?.rows ?? 0,
                          items: summary?.items ?? 0,
                        })}
                      </span>
                      {summary?.themeName && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <span className="truncate max-w-40">{summary.themeName}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div
                    className="flex shrink-0 items-center gap-0.5"
                    onClick={event => event.stopPropagation()}
                    onKeyDown={event => event.stopPropagation()}
                  >
                    {busy ? (
                      <Spin size="small" />
                    ) : (
                      !editing && (
                        <>
                          <Button
                            theme="borderless"
                            size="small"
                            icon={<IconEditStroked size="small" />}
                            title={t("saves.archives.rename")}
                            onClick={() => startRename(archive)}
                          />
                          <Button
                            theme="borderless"
                            size="small"
                            icon={<IconCopyStroked size="small" />}
                            title={t("saves.archives.duplicate")}
                            onClick={() => onDuplicate(archive.id)}
                          />
                          <Button
                            theme="borderless"
                            size="small"
                            icon={<IconDownloadStroked size="small" />}
                            title={t("saves.archives.download")}
                            onClick={() => onDownload(archive.id)}
                          />
                          <Button
                            theme="borderless"
                            type="danger"
                            size="small"
                            icon={<IconDeleteStroked size="small" />}
                            title={t("saves.archives.delete")}
                            onClick={() => confirmDelete(archive)}
                          />
                        </>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 border-t border-gray-200 pt-3 dark:border-[#2e2e35]">
          <p className="m-0 text-[11px] leading-4 text-gray-400 dark:text-gray-500">
            {t("saves.archives.storageHint")}
          </p>
          <div className="mt-3 flex items-center gap-2">
            {/* 危险操作放最左（贴着说明文字），把「导出」放在最右：
                用户手上最常点的是导出，让它靠边；清除在另一头，少一次手滑就清库 */}
            <Button
              size="small"
              type="danger"
              theme="borderless"
              icon={<IconDeleteStroked size="small" />}
              onClick={() => setPendingClear(true)}
              style={{
                height: 28,
                paddingTop: 4,
                paddingBottom: 4,
                marginLeft: "auto",
              }}
            >
              {t("saves.archives.clearAll")}
            </Button>
            <Button
              size="small"
              theme="borderless"
              icon={<IconDownloadStroked size="small" />}
              onClick={onExportAll}
              disabled={archives.length === 0}
              style={{
                height: 28,
                paddingTop: 4,
                paddingBottom: 4,
              }}
            >
              {t("saves.archives.exportAll")}
            </Button>
          </div>
        </div>
      </div>
      </Modal>

      <Modal
        title={t("saves.archives.deleteConfirmTitle")}
        visible={Boolean(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
        centered
        width={400}
        style={{ maxWidth: "calc(100vw - 24px)" }}
        footer={
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setPendingDelete(null)}>
              {t("saves.archives.cancel")}
            </Button>
            <Button
              theme="solid"
              type="danger"
              onClick={() => {
                const target = pendingDelete;
                setPendingDelete(null);
                if (target) onDelete(target.id);
              }}
            >
              {t("saves.archives.delete")}
            </Button>
          </div>
        }
      >
        <p className="m-0 text-sm leading-6 text-gray-600 dark:text-gray-300">
          {deleteConfirmContent}
        </p>
      </Modal>

      <Modal
        title={t("saves.archives.clearAllConfirmTitle")}
        visible={pendingClear}
        onCancel={() => setPendingClear(false)}
        centered
        width={400}
        style={{ maxWidth: "calc(100vw - 24px)" }}
        footer={
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setPendingClear(false)}>
              {t("saves.archives.cancel")}
            </Button>
            <Button
              theme="solid"
              type="danger"
              onClick={() => {
                setPendingClear(false);
                onClearAll();
              }}
            >
              {t("saves.archives.clearAll")}
            </Button>
          </div>
        }
      >
        <p className="m-0 text-sm leading-6 text-gray-600 dark:text-gray-300">
          {t("saves.archives.clearAllConfirmContent")}
        </p>
      </Modal>
    </>
  );
}
