import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en-IN');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load saved language preference
    const savedLang = localStorage.getItem('appLanguage') || 'en-IN';
    setLanguage(savedLang);
    setIsReady(true);
  }, []);

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
    localStorage.setItem('appLanguage', langCode);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, isReady }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
