import Header from "./components/Header";
import Editor from "./components/Editor";
import "./utils/i18n"
import { useTranslation } from "react-i18next";
import GuideBoardCols from "./components/GuideBoard";

function App() {
  const { t } = useTranslation();
  return (
    <div className="h-full flex flex-col">
      <link rel="icon" href="/favicon.ico" />
      <title>{t("title")}</title>
      <Header/>
      <GuideBoardCols />
      <Editor />
    </div>
  );
}

export default App;
