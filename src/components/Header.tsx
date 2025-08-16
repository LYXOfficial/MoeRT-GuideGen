import { IconGithubLogo, IconImage } from "@douyinfe/semi-icons";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ExportDialog } from "./ExportDialog";

interface HeaderProps {
  guideHeight?: number;
}

export default function Header({ guideHeight = 0 }: HeaderProps) {
  const { t } = useTranslation();
  const [exportDialogVisible, setExportDialogVisible] = useState(false);

  return (
    <>
      <header className="h-12 flex items-center font-sans p-3 border-b border-gray-300">
        <img src="/favicon.ico" className="h-8 mr-2" />
        <span className="text-xl font-bold">{t("title")}</span>
        <div className="flex items-center ml-auto gap-2">
          <a
            className="transition duration-300 hover:text-blue-400 flex items-center mr-2"
            onClick={() => setExportDialogVisible(true)}
          >
            <IconImage size="extra-large" />
          </a>
          <a
            href="https://github.com/lyxofficial/moert-guidegen"
            className="transition duration-300 hover:text-blue-400 flex items-center"
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
