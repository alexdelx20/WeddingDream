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

// Translations storage with common UI elements
const translations: Record<string, Record<Language, string>> = {
  // Sidebar menu items
  "Dashboard": {
    "en": "Dashboard",
    "it": "Dashboard",
    "es": "Panel de control",
    "fr": "Tableau de bord",
    "de": "Dashboard"
  },
  "Wedding Settings": {
    "en": "Wedding Settings",
    "it": "Impostazioni Matrimonio",
    "es": "Configuración de boda",
    "fr": "Paramètres de mariage",
    "de": "Hochzeitseinstellungen"
  },
  "Checklist": {
    "en": "Checklist",
    "it": "Lista di controllo",
    "es": "Lista de verificación",
    "fr": "Liste de contrôle",
    "de": "Checkliste"
  },
  "Wedding Timeline": {
    "en": "Wedding Timeline",
    "it": "Cronologia del matrimonio",
    "es": "Cronología de la boda",
    "fr": "Chronologie du mariage",
    "de": "Hochzeits-Zeitplan"
  },
  "Guest List": {
    "en": "Guest List",
    "it": "Lista degli invitati",
    "es": "Lista de invitados",
    "fr": "Liste des invités",
    "de": "Gästeliste"
  },
  "Budget": {
    "en": "Budget",
    "it": "Budget",
    "es": "Presupuesto",
    "fr": "Budget",
    "de": "Budget"
  },
  "Vendors": {
    "en": "Vendors",
    "it": "Fornitori",
    "es": "Proveedores",
    "fr": "Fournisseurs",
    "de": "Anbieter"
  },
  "Help Center": {
    "en": "Help Center",
    "it": "Centro assistenza",
    "es": "Centro de ayuda",
    "fr": "Centre d'aide",
    "de": "Hilfezentrum"
  },
  "Sign out": {
    "en": "Sign out",
    "it": "Disconnetti",
    "es": "Cerrar sesión",
    "fr": "Déconnexion",
    "de": "Abmelden"
  }
};

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
    
    // No need for complex Google Translate integration, we'll use a simpler approach
    if (lang !== 'en') {
      setIsLoading(true);
      
      // Simulate translation loading
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
      // Create hidden Google Translate element if it doesn't exist
      let translateElement = document.getElementById('google_translate_element');
      if (!translateElement) {
        translateElement = document.createElement('div');
        translateElement.id = 'google_translate_element';
        translateElement.style.display = 'none';
        document.body.appendChild(translateElement);
      }
      
      // Add translate class to body for CSS targeting
      document.body.classList.add('translated');
      document.body.setAttribute('data-language', lang);
    } else {
      // Remove translation classes
      document.body.classList.remove('translated');
      document.body.removeAttribute('data-language');
    }
  };
  
  // Function to translate text
  const translate = (text: string): string => {
    return getTranslation(text, language);
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