import Header from "./components/Header";
import "./utils/i18n"
import { useTranslation } from "react-i18next";
import Editor from "./components/Editor";

function App() {
  const { t } = useTranslation();
  return (
    <div className="h-full flex flex-col">
      <link rel="icon" href="/favicon.ico" />
      <title>{t("title")}</title>
      <Header/>
      <Editor/>
    </div>
  );
}

export default App;
