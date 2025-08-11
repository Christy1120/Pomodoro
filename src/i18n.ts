import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  zh: {
    translation: {
      app: { title: "我的番茄鐘" },
      todo: {
        title: "待辦清單",
        hint: "按 Enter 新增，點文字可編輯，勾選標記完成",
        add: "新增",
        empty: "目前沒有項目",
        filter_all: "全部({{n}})",
        filter_active: "進行中({{n}})",
        filter_done: "已完成({{n}})",
        clear_done: "清除已完成",
        placeholder: "我要做的事…（按 Enter 新增）",
      }
    }
  },
  en: {
    translation: {
      app: { title: "My Pomodoro" },
      todo: {
        title: "Todo List",
        hint: "Press Enter to add, click text to edit, check to mark done",
        add: "Add",
        empty: "No items yet",
        filter_all: "All ({{n}})",
        filter_active: "Active ({{n}})",
        filter_done: "Done ({{n}})",
        clear_done: "Clear Done",
        placeholder: "What to do… (press Enter)",
      }
    }
  }
};

const stored = localStorage.getItem('lang') as 'zh'|'en'|null;
const initialLng = stored ?? (navigator.language.startsWith('zh') ? 'zh' : 'en');

i18n.use(initReactI18next).init({
  resources,
  lng: initialLng,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export function setLang(l: 'zh'|'en') {
  i18n.changeLanguage(l);
  localStorage.setItem('lang', l);
}
export default i18n;
