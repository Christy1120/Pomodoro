import { useTranslation } from 'react-i18next';
import { setLang } from '../../../i18n';


export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const cur = i18n.language.startsWith('zh') ? 'zh' : 'en';
  return (
    <div className="inline-flex rounded-lg border px-1 py-0.5 text-sm">
      <button
        onClick={() => setLang('zh')}
        className={`px-2 py-1 rounded ${cur==='zh'?'bg-white shadow':''}`}
      >中文</button>
      <button
        onClick={() => setLang('en')}
        className={`px-2 py-1 rounded ${cur==='en'?'bg-white shadow':''}`}
      >EN</button>
    </div>
  );
}
