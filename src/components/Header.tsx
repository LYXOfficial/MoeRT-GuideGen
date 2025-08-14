import { IconGithubLogo } from "@douyinfe/semi-icons";
import { useTranslation } from "react-i18next";

export default function Header() {
  const { t } = useTranslation();
  return (
    <header className="h-12 flex items-center font-sans p-3 border-b border-gray-300">
      <img src="/favicon.ico" className="h-8 mr-2" />
      <span className="text-xl font-bold">{t("title")}</span>
      <a
        href="https://github.com/lyxofficial/moert-guidegen"
        className="transition duration-300 ml-auto hover:text-blue-400 mt-auto mb-auto"
      >
        <IconGithubLogo size="extra-large" />
      </a>
    </header>
  );
}
