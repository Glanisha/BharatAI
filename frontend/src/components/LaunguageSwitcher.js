// components/LanguageSwitcher.js
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();
    const languages = ['Hindi', 'Marathi', 'Kannada', 'Bengali', 'Tamil', 'Telugu', 'Gujarati', 'English'];

    return (
        <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#03346E] text-[#E2E2B6] border border-[#6EACDA] rounded px-3 py-1"
        >
            {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
            ))}
        </select>
    );
};

export default LanguageSwitcher;