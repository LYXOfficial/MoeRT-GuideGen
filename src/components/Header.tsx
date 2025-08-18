import {
  IconGithubLogo,
  IconImage,
  IconImport,
  IconUpload,
  IconLanguage,
  IconDeleteStroked,
} from "@douyinfe/semi-icons";
import { Popover, List, Modal, Slider } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ExportDialog } from "./ExportDialog";

interface HeaderProps {
  guideHeight?: number;
  onImport?: () => void;
  onExport?: () => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  disableZoom?: boolean;
}

export default function Header({
  guideHeight = 0,
  onImport,
  onExport,
  zoom = 1,
  onZoomChange,
  disableZoom = false,
}: HeaderProps) {
  const { t, i18n } = useTranslation();
  const [exportDialogVisible, setExportDialogVisible] = useState(false);

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
    <div className="p-2">
      <List
        dataSource={languages}
        renderItem={language => (
          <List.Item
            className={`cursor-pointer px-3 py-2 rounded hover:bg-gray-100 flex items-center gap-2 font-sans ${
              language.code === i18n.language ? "bg-blue-50 text-blue-600" : ""
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

  return (
    <>
      <header className="h-12 flex items-center font-sans p-3 border-b border-gray-300">
        <img src="/favicon.ico" className="h-8 mr-2" />
        <span className="text-xl font-bold">{t("title")}</span>
        
        {/* 缩放滑块 */}
        <div className="ml-6 flex items-center gap-2">
          <span className="text-sm text-gray-600">缩放:</span>
          <div className="w-32">
            <Slider
              min={0.5}
              max={4}
              step={0.1}
              value={zoom}
              disabled={disableZoom}
              onChange={(value) => {
                if (typeof value === 'number') {
                  onZoomChange?.(value);
                }
              }}
              showBoundary={false}
              tipFormatter={(value) => `${Math.round((typeof value === 'number' ? value : 1) * 100)}%`}
            />
          </div>
          <span className="text-xs text-gray-500 w-8 text-center">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        <div className="flex items-center ml-auto gap-4">
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
          <a
            className="transition duration-300 hover:text-red-500 flex items-center"
            onClick={() => {
              Modal.confirm({
                title: t("saves.clear_local_title"),
                content: t("saves.clear_local_confirm"),
                onOk: () => {
                  // 标记清理状态，避免 Editor 在重载前再次自动保存
                  localStorage.setItem("guide-clearing", "1");
                  localStorage.removeItem("guide-autosave");
                  location.reload();
                },
              });
            }}
            title={t("saves.clear_local_button")}
          >
            <IconDeleteStroked size="extra-large" />
          </a>
          <a
            className="transition duration-300 hover:text-blue-400 flex items-center"
            onClick={() => setExportDialogVisible(true)}
            title={t("saves.export_image")}
          >
            <IconImage size="extra-large" />
          </a>
          <a
            className="transition duration-300 hover:text-blue-400 flex items-center"
            onClick={onExport}
            title={t("saves.save_project")}
          >
            <IconImport size="extra-large" />
          </a>
          <a
            className="transition duration-300 hover:text-blue-400 flex items-center"
            onClick={onImport}
            title={t("saves.load_project")}
          >
            <IconUpload size="extra-large" />
          </a>
          <a
            href="https://github.com/lyxofficial/moert-guidegen"
            className="transition duration-300 hover:text-blue-400 flex items-center"
            title="GitHub"
          >
            <IconGithubLogo size="extra-large" />
          </a>
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
