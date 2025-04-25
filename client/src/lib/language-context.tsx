import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Available languages
export type Language = 'en' | 'it' | 'es' | 'fr' | 'de';

// Language context type
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (text: string) => string;
  isLoading: boolean;
};

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  translate: (text) => text,
  isLoading: false,
});

// Translations storage
const translations: Record<string, Record<Language, string>> = {};

// Function to get translation for a specific text
function getTranslation(text: string, language: Language): string {
  if (language === 'en') return text;
  
  return translations[text]?.[language] || text;
}

// Provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(false);
  
  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && ['en', 'it', 'es', 'fr', 'de'].includes(savedLanguage)) {
      setLanguageState(savedLanguage as Language);
    }
  }, []);
  
  // Update document language attribute
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = 'ltr'; // Add RTL support if needed
  }, [language]);
  
  // Set language and save to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferredLanguage', lang);
    
    // If not English, translate the page
    if (lang !== 'en') {
      translatePage(lang);
    }
  };
  
  // Function to translate text
  const translate = (text: string): string => {
    return getTranslation(text, language);
  };
  
  // Add Google Translate types to window
  declare global {
    interface Window {
      google: any;
      googleTranslateElementInit: () => void;
    }
  }

  // Function to translate the page using Google Translate
  const translatePage = (lang: Language) => {
    if (lang === 'en') return;
    
    setIsLoading(true);
    
    // Get Google Translate script
    const googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: lang,
        autoDisplay: false,
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
      }, 'google_translate_element');
      
      // Hide Google translate widget after it's loaded
      setTimeout(() => {
        const element = document.getElementById('google_translate_element');
        if (element) {
          element.style.display = 'none';
        }
        setIsLoading(false);
      }, 1000);
    };
    
    // Add the function to window to make it accessible
    window.googleTranslateElementInit = googleTranslateElementInit;
    
    // If the script is already loaded
    if (window.google && window.google.translate) {
      googleTranslateElementInit();
      return;
    }
    
    // Load Google Translate script
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);
    
    script.onerror = () => {
      setIsLoading(false);
      console.error('Failed to load Google Translate script');
    };
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate, isLoading }}>
      {/* Hidden container for Google Translate */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}