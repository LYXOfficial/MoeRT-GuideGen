import {
  IconFolderOpen,
  IconGithubLogo,
  IconImage,
  IconLanguage,
  IconUndo,
  IconRedo,
  IconMenu,
  IconFullScreenStroked,
  IconMoreStroked,
  IconMoon,
  IconSun,
} from "@douyinfe/semi-icons";
import { Popover, List, Slider, Checkbox } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { useState, type ComponentProps } from "react";
import { ExportDialog } from "./ExportDialog";
import { useIsCompact } from "../hooks/useMediaQuery";
import { useDarkMode } from "../hooks/useDarkMode";

interface HeaderProps {
  guideHeight?: number;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  disableZoom?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  /** 是否显示组件的灰色边框（不影响布局，也不会被导出） */
  showItemFrame?: boolean;
  onShowItemFrameChange?: (show: boolean) => void;
  /** 移动端：把整张画板适配到可视区域内 */
  onFitToView?: () => void;
  /** 移动端：底部组件抽屉是否打开 */
  paletteOpen?: boolean;
  onTogglePalette?: (open: boolean) => void;
  /** 当前存档名（存档管理按钮的提示 / 移动端菜单副标题） */
  currentArchiveName?: string;
  onOpenArchives?: () => void;
}

export default function Header({
  guideHeight = 0,
  zoom = 1,
  onZoomChange,
  disableZoom = false,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  showItemFrame = true,
  onShowItemFrameChange,
  onFitToView,
  paletteOpen = false,
  onTogglePalette,
  currentArchiveName = "",
  onOpenArchives,
}: HeaderProps) {
  const { t, i18n } = useTranslation();
  const isCompact = useIsCompact();
  const [exportDialogVisible, setExportDialogVisible] = useState(false);
  const { isDark, toggle: toggleDarkMode } = useDarkMode();

  // 语言选项
  const languages = [
    { code: "zh-CN", name: "简体中文", flag: "🇨🇳" },
    { code: "zh-TW", name: "繁體中文", flag: "🇨🇳" },
    { code: "en-US", name: "English", flag: "🇺🇸" },
    { code: "ja-JP", name: "日本語", flag: "🇯🇵" },
    { code: "ko-KR", name: "한국어", flag: "🇰🇷" },
  ];

  // 获取当前语言信息
  const currentLanguage =
    languages.find(lang => lang.code === i18n.language) || languages[0];

  // 切换语言
  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  // 语言选择器内容
  const languageSelector = (
    <div>
      <List
        dataSource={languages}
        renderItem={language => (
          <List.Item
            className={`cursor-pointer !px-3 !py-2 rounded-sm hover:bg-gray-100 flex items-center gap-2 font-sans ${
              language.code === i18n.language
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300"
                : ""
            }`}
            onClick={() => handleLanguageChange(language.code)}
          >
            <span className="text-lg">{language.flag}</span>
            <span>{language.name}</span>
          </List.Item>
        )}
      />
    </div>
  );

  // 移动端：品牌行 + 工具条（撤销/缩放/适配/加组件）+ “更多”溢出菜单
  if (isCompact) {
    const btn =
      "flex items-center justify-center h-9 min-w-9 rounded-md px-2 text-gray-700 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-200 dark:active:bg-[#2f2f36] transition-colors cursor-pointer touch-manipulation select-none";
    const stepZoom = (delta: number) => {
      const v = zoom + delta;
      if (v >= 0.5 && v <= 4) onZoomChange?.(Math.round(v * 10) / 10);
    };

    const moreContent = (
      <div className="p-1 w-60 font-sans">
        <div>
          <button
            type="button"
            className={`${btn} w-full justify-start gap-2`}
            onClick={onOpenArchives}
          >
            <IconFolderOpen />
            <span className="text-sm">{t("saves.archives.title")}</span>
          </button>
          {currentArchiveName && (
            <div className="px-2 pb-1 -mt-0.5 text-[11px] text-gray-400 dark:text-gray-500 truncate">
              {t("saves.archives.menuHint", { name: currentArchiveName })}
            </div>
          )}
          <button
            type="button"
            className={`${btn} w-full justify-start gap-2`}
            onClick={() => setExportDialogVisible(true)}
          >
            <IconImage />
            <span className="text-sm">{t("saves.export_image")}</span>
          </button>
        </div>
      </div>
    );

    return (
      <>
        <header className="flex flex-col shrink-0 font-sans border-b border-gray-300 dark:border-[#2e2e35] bg-white dark:bg-[#16161a]">
          <div className="flex items-center gap-2 px-2 pt-2 pb-1">
            <img src="/favicon.ico" className="h-7 w-7 rounded-sm" />
            <span className="text-base font-bold truncate flex-1">
              {t("title")}
            </span>
            <a
              href="https://github.com/lyxofficial/moert-guidegen"
              className={`${btn} p-0`}
              title="GitHub"
            >
              <IconGithubLogo size="large" />
            </a>
            <Popover
              content={languageSelector}
              trigger="click"
              position="bottomRight"
              spacing={6}
              clickToHide
            >
              <button
                type="button"
                className={`${btn} gap-1 p-0`}
                title="切换语言 / Switch Language"
              >
                <span className="text-base">{currentLanguage.flag}</span>
                <IconLanguage size="large" />
              </button>
            </Popover>
            {/* 深色/浅色切换（「更多」左边）：浅色时显示月亮，深色时显示太阳 */}
            <button
              type="button"
              className={`${btn} p-0`}
              onClick={toggleDarkMode}
              title={isDark ? t("theme.toLight") : t("theme.toDark")}
            >
              {isDark ? <IconSun size="large" /> : <IconMoon size="large" />}
            </button>
            <Popover
              content={moreContent}
              trigger="click"
              position="bottomRight"
              spacing={6}
              clickToHide
              {...({
                // Semi Popover 的类型声明漏掉了这个透传给 Tooltip 的开关：
                // 开启后再次点击「⋯」即可收起，而非只能点外部
                clickTriggerToHide: true,
              } as unknown as ComponentProps<typeof Popover>)}
            >
              <button type="button" className={`${btn} p-0`} title="更多">
                <IconMoreStroked size="large" />
              </button>
            </Popover>
          </div>

          {/* 工具条 */}
          <div className="flex items-center gap-1 px-2 pb-2 flex-wrap justify-end">
            <button
              type="button"
              disabled={!canUndo}
              onClick={onUndo}
              className={`${btn} ${
                canUndo ? "" : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
              }`}
              title={t("saves.undo")}
            >
              <IconUndo size="large" />
            </button>
            <button
              type="button"
              disabled={!canRedo}
              onClick={onRedo}
              className={`${btn} ${
                canRedo ? "" : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
              }`}
              title={t("saves.redo")}
            >
              <IconRedo size="large" />
            </button>

            <div className="w-px h-6 mx-1 bg-gray-300 dark:bg-[#2e2e35]" />

            <button
              type="button"
              className={btn}
              onClick={() => stepZoom(-0.2)}
              title="−"
            >
              <span className="text-lg leading-none">−</span>
            </button>
            <button
              type="button"
              className={`${btn} min-w-14 px-0 text-sm tabular-nums cursor-default`}
              onClick={() => onZoomChange?.(1)}
              title={t("zoom.reset")}
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              className={btn}
              onClick={() => stepZoom(0.2)}
              title="+"
            >
              <span className="text-lg leading-none">+</span>
            </button>
            <button
              type="button"
              className={btn}
              onClick={onFitToView}
              title={t("zoom.fit")}
            >
              <IconFullScreenStroked />
            </button>

            <div className="flex-1" />

            <Checkbox
              className="mr-1 font-sans"
              checked={showItemFrame}
              onChange={e => onShowItemFrameChange?.(Boolean(e.target.checked))}
            >
              <span className="text-sm text-gray-600 whitespace-nowrap">
                {t("board.showItemFrame")}
              </span>
            </Checkbox>

            <button
              type="button"
              className={`${btn} gap-1 rounded-lg border ${
                paletteOpen
                  ? "bg-blue-500! text-white! border-blue-500!"
                  : "border-gray-300 dark:border-[#3a3b42]"
              }`}
              onClick={() => onTogglePalette?.(!paletteOpen)}
              title={t("componentsList.title")}
            >
              <IconMenu />
              <span className="text-sm whitespace-nowrap">
                {t("componentsList.title")}
              </span>
            </button>
          </div>
        </header>
        <ExportDialog
          visible={exportDialogVisible}
          onCancel={() => setExportDialogVisible(false)}
          guideHeight={guideHeight}
        />
      </>
    );
  }

  return (
    <>
      <header className="h-12 flex items-center font-sans p-3 border-b border-gray-300 dark:border-[#2e2e35]">
        <img src="/favicon.ico" className="h-8 mr-2" />
        <span className="text-xl font-bold whitespace-nowrap">{t("title")}</span>

        {/* 缩放滑块 */}
        <div className="ml-6 flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{t("zoom.label")}</span>
          <div className="w-32">
            <Slider
              min={0.5}
              max={4}
              step={0.1}
              value={zoom}
              disabled={disableZoom}
              onChange={value => {
                if (typeof value === "number") {
                  onZoomChange?.(value);
                }
              }}
              showBoundary={false}
              // 顶栏贴着窗口上沿，Semi 的数值气泡固定往上弹、会被窗口裁掉
              // （它的 autoAdjustOverflow 以 body 为容器判断，body 比视口高 → 永远不翻转）。
              // 右边那个百分比是实时更新的，气泡纯属重复，直接关掉。
              tooltipVisible={false}
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-center">
            {Math.round(zoom * 100)}%
          </span>
          {/* 一键适配画板到可视区域（与移动端同款） */}
          <button
            type="button"
            className="transition duration-300 flex items-center p-1 rounded-sm text-gray-700 hover:text-blue-500 cursor-pointer"
            onClick={onFitToView}
            title={t("zoom.fit")}
          >
            <IconFullScreenStroked />
          </button>
          {/* 组件灰框显隐 */}
          <Checkbox
            className="ml-2 text-sm"
            checked={showItemFrame}
            onChange={e => onShowItemFrameChange?.(Boolean(e.target.checked))}
          >
            <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
              {t("board.showItemFrame")}
            </span>
          </Checkbox>
        </div>

        <div className="flex items-center ml-auto gap-4 min-w-0">
          {/* 撤销/重做按钮 */}
          <button
            type="button"
            className={`transition duration-300 flex items-center p-1 rounded-sm ${
              canUndo
                ? "hover:bg-gray-100 text-gray-700 dark:text-gray-200 hover:text-blue-500 cursor-pointer"
                : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
            }`}
            onClick={onUndo}
            disabled={!canUndo}
            title={`${t("saves.undo")} (Ctrl+Z)`}
          >
            <IconUndo size="extra-large" />
          </button>
          <button
            type="button"
            className={`transition duration-300 flex items-center p-1 rounded-sm ${
              canRedo
                ? "hover:bg-gray-100 text-gray-700 dark:text-gray-200 hover:text-blue-500 cursor-pointer"
                : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
            }`}
            onClick={onRedo}
            disabled={!canRedo}
            title={`${t("saves.redo")} (Ctrl+Y)`}
          >
            <IconRedo size="extra-large" />
          </button>
          <div className="w-px h-6 bg-gray-300 dark:bg-[#2e2e35]"></div>
          <Popover
            content={languageSelector}
            trigger="hover"
            position="bottomRight"
          >
            <a
              className="transition duration-300 hover:text-blue-400 flex items-center gap-1"
              title="切换语言 / Switch Language"
            >
              <span className="text-lg">{currentLanguage.flag}</span>
              <IconLanguage size="extra-large" />
            </a>
          </Popover>
          {/* 多存档管理：PC 端图标旁显示当前存档名；长名字截断，避免顶栏溢出 */}
          <button
            type="button"
            className="transition duration-300 hover:text-blue-400 flex items-center gap-1.5 min-w-0 shrink max-w-32 xl:max-w-48 text-gray-700 dark:text-gray-200"
            onClick={onOpenArchives}
            title={
              currentArchiveName
                ? `${t("saves.archives.title")} · ${currentArchiveName}`
                : t("saves.archives.title")
            }
          >
            <IconFolderOpen size="extra-large" />
            <span className="min-w-0 text-sm truncate whitespace-nowrap">
              {currentArchiveName || t("saves.archives.title")}
            </span>
          </button>
          <a
            className="transition duration-300 hover:text-blue-400 flex items-center"
            onClick={() => setExportDialogVisible(true)}
            title={t("saves.export_image")}
          >
            <IconImage size="extra-large" />
          </a>
          <a
            href="https://github.com/lyxofficial/moert-guidegen"
            className="transition duration-300 hover:text-blue-400 flex items-center"
            title="GitHub"
          >
            <IconGithubLogo size="extra-large" />
          </a>
          {/* 深色/浅色切换（最右）：浅色时显示月亮，深色时显示太阳 */}
          <button
            type="button"
            className="transition duration-300 hover:text-blue-400 flex items-center"
            onClick={toggleDarkMode}
            title={isDark ? t("theme.toLight") : t("theme.toDark")}
          >
            {isDark ? (
              <IconSun size="extra-large" />
            ) : (
              <IconMoon size="extra-large" />
            )}
          </button>
        </div>
      </header>
      <ExportDialog
        visible={exportDialogVisible}
        onCancel={() => setExportDialogVisible(false)}
        guideHeight={guideHeight}
      />
    </>
  );
}
