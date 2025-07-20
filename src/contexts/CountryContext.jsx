import React, { createContext, useContext, useState, useEffect } from 'react';
import { netflixFeatures, updateDefaultRegion, updateDefaultLanguage } from '../services/tmdb';

const CountryContext = createContext();

// Mapping von Ländern zu Sprachen
const COUNTRY_LANGUAGE_MAPPING = {
  'FR': 'fr-FR',    // Frankreich -> Französisch
  'DE': 'de-DE',    // Deutschland -> Deutsch
  'US': 'en-US',    // USA -> Englisch (US)
  'GB': 'en-GB',    // Großbritannien -> Englisch (UK)
  'ES': 'es-ES',    // Spanien -> Spanisch
  'IT': 'it-IT',    // Italien -> Italienisch
  'CA': 'en-CA',    // Kanada -> Englisch (CA)
  'JP': 'ja-JP',    // Japan -> Japanisch
  'KR': 'ko-KR',    // Südkorea -> Koreanisch
  'IN': 'hi-IN',    // Indien -> Hindi
  'BR': 'pt-BR',    // Brasilien -> Portugiesisch (BR)
  'MX': 'es-MX',    // Mexiko -> Spanisch (MX)
  'RU': 'ru-RU',    // Russland -> Russisch
  'CN': 'zh-CN',    // China -> Chinesisch (vereinfacht)
  'NL': 'nl-NL',    // Niederlande -> Niederländisch
  'SE': 'sv-SE',    // Schweden -> Schwedisch
  'NO': 'nb-NO',    // Norwegen -> Norwegisch
  'DK': 'da-DK',    // Dänemark -> Dänisch
  'FI': 'fi-FI',    // Finnland -> Finnisch
  'PL': 'pl-PL',    // Polen -> Polnisch
  'CZ': 'cs-CZ',    // Tschechien -> Tschechisch
  'HU': 'hu-HU',    // Ungarn -> Ungarisch
  'GR': 'el-GR',    // Griechenland -> Griechisch
  'TR': 'tr-TR',    // Türkei -> Türkisch
  'AR': 'ar-SA',    // Arabische Länder -> Arabisch
  'TH': 'th-TH',    // Thailand -> Thai
  'VN': 'vi-VN',    // Vietnam -> Vietnamesisch
  'ID': 'id-ID',    // Indonesien -> Indonesisch
  'MY': 'ms-MY',    // Malaysia -> Malaiisch
  'PH': 'tl-PH',    // Philippinen -> Tagalog
  'SG': 'en-SG',    // Singapur -> Englisch
  'AU': 'en-AU',    // Australien -> Englisch (AU)
  'NZ': 'en-NZ',    // Neuseeland -> Englisch (NZ)
  'ZA': 'en-ZA',    // Südafrika -> Englisch (ZA)
  'EG': 'ar-EG',    // Ägypten -> Arabisch
  'SA': 'ar-SA',    // Saudi-Arabien -> Arabisch
  'AE': 'ar-AE',    // UAE -> Arabisch
  'IL': 'he-IL',    // Israel -> Hebräisch
  'PT': 'pt-PT',    // Portugal -> Portugiesisch
  'CH': 'de-CH',    // Schweiz -> Deutsch (kann auch fr-CH oder it-CH sein)
  'AT': 'de-AT',    // Österreich -> Deutsch
  'BE': 'fr-BE',    // Belgien -> Französisch (kann auch nl-BE sein)
  'IE': 'en-IE',    // Irland -> Englisch
  // Fallback für unbekannte Länder
  '': 'fr-FR'       // "Alle Länder" -> Französisch als Standard
};

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry muss innerhalb eines CountryProvider verwendet werden');
  }
  return context;
};

export const CountryProvider = ({ children }) => {
  const [selectedCountry, setSelectedCountry] = useState('FR'); // Frankreich als Standard
  const [selectedLanguage, setSelectedLanguage] = useState('fr-FR'); // Französisch als Standard
  const [isLoading, setIsLoading] = useState(true);

  // Hilfsfunktion: Ermittle Sprache basierend auf Land
  const getLanguageForCountry = (countryCode) => {
    return COUNTRY_LANGUAGE_MAPPING[countryCode] || 'fr-FR';
  };

  useEffect(() => {
    // Lade gespeicherte Ländereinstellung oder verwende Frankreich als Standard
    const savedCountry = netflixFeatures.getRegion();
    const language = getLanguageForCountry(savedCountry);
    
    setSelectedCountry(savedCountry);
    setSelectedLanguage(language);
    
    // Aktualisiere sowohl Region als auch Sprache in der API
    updateDefaultRegion(savedCountry);
    updateDefaultLanguage(language);
    
    setIsLoading(false);
  }, []);

  const changeCountry = (countryCode) => {
    const language = getLanguageForCountry(countryCode);
    
    setSelectedCountry(countryCode);
    setSelectedLanguage(language);
    
    // Speichere das Land und aktualisiere API-Defaults
    netflixFeatures.setRegion(countryCode);
    updateDefaultRegion(countryCode);
    updateDefaultLanguage(language);
    
    // Event für andere Komponenten, dass sich Land und Sprache geändert haben
    window.dispatchEvent(new CustomEvent('countryChanged', { 
      detail: { 
        country: countryCode,
        language: language
      } 
    }));

    console.log(`🌍 Land geändert zu: ${countryCode}, Sprache: ${language}`);
  };

  const value = {
    selectedCountry,
    selectedLanguage,
    changeCountry,
    getLanguageForCountry,
    isLoading
  };

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
}; 