import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageContext";
import { getTranslations } from "@/components/translations";

const LANGUAGES = [
  { code: 'en-IN', name: 'English', flag: '🇬🇧' },
  { code: 'hi-IN', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
  { code: 'mr-IN', name: 'मराठी (Marathi)', flag: '🇮🇳' }
];

export default function LanguageSelector() {
  const { language, changeLanguage } = useLanguage();
  const translations = getTranslations(language);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    
    // Get translations for the selected language
    const selectedTranslations = getTranslations(langCode);
    const messages = {
      'en-IN': selectedTranslations.sidebar?.languageChanged || 'Language changed to English',
      'hi-IN': selectedTranslations.sidebar?.languageChanged || 'भाषा हिंदी में बदल गई',
      'mr-IN': selectedTranslations.sidebar?.languageChanged || 'भाषा मराठीमध्ये बदलली'
    };
    
    // Speak confirmation in selected language
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(messages[langCode]);
      utterance.lang = langCode;
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="bg-white/70 dark:bg-gray-700 backdrop-blur-sm border-none shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Languages className="w-5 h-5 text-blue-600 dark:text-blue-300" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{translations.sidebar?.voiceLanguage || "Voice Language"}</p>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="bg-white dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get current language (for backward compatibility)
export function getCurrentLanguage() {
  return localStorage.getItem('appLanguage') || 'en-IN';
}

// Helper function to speak text in selected language
export function speakInSelectedLanguage(text) {
  if ('speechSynthesis' in window) {
    const lang = getCurrentLanguage();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.8;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  }
}