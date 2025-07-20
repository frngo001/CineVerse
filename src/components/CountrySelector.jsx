import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaGlobe } from 'react-icons/fa';
import { tmdbApi, updateDefaultRegion } from '../services/tmdb';
import { useCountry } from '../contexts/CountryContext';

const CountrySelector = ({ 
  className = '',
  showLabel = true,
  showLanguageInfo = false 
}) => {
  const { selectedCountry, selectedLanguage, changeCountry, getLanguageForCountry } = useCountry();
  const [countries, setCountries] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setLoading(true);
      const data = await tmdbApi.getCountries();
      // Sort countries by name, with popular countries first
      const popularCountries = ['FR', 'US', 'GB', 'DE', 'ES', 'IT', 'CA', 'JP', 'KR', 'IN'];
      const sortedCountries = data.sort((a, b) => {
        const aIsPopular = popularCountries.includes(a.iso_3166_1);
        const bIsPopular = popularCountries.includes(b.iso_3166_1);
        
        if (aIsPopular && !bIsPopular) return -1;
        if (!aIsPopular && bIsPopular) return 1;
        if (aIsPopular && bIsPopular) {
          return popularCountries.indexOf(a.iso_3166_1) - popularCountries.indexOf(b.iso_3166_1);
        }
        
        return a.native_name.localeCompare(b.native_name);
      });
      
      setCountries(sortedCountries);
    } catch (error) {
      console.error('Error loading countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCountrySelect = (countryCode) => {
    changeCountry(countryCode);
    updateDefaultRegion(countryCode);
    setIsOpen(false);
  };

  const getSelectedCountryName = () => {
    if (!selectedCountry) return 'Tous les pays';
    const country = countries.find(c => c.iso_3166_1 === selectedCountry);
    return country ? `${country.native_name}` : selectedCountry;
  };

  const getSelectedCountryFlag = () => {
    if (!selectedCountry) return '🌍';
    // Convert country code to flag emoji
    return selectedCountry
      .toUpperCase()
      .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt()));
  };

  const getLanguageName = (languageCode) => {
    const languageNames = {
      'fr-FR': 'Français',
      'de-DE': 'Deutsch', 
      'en-US': 'English (US)',
      'en-GB': 'English (UK)',
      'es-ES': 'Español',
      'it-IT': 'Italiano',
      'ja-JP': '日本語',
      'ko-KR': '한국어',
      'pt-BR': 'Português (BR)',
      'ru-RU': 'Русский',
      'zh-CN': '中文',
      'ar-SA': 'العربية',
      'hi-IN': 'हिन्दी'
    };
    return languageNames[languageCode] || languageCode;
  };

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full h-10 bg-[#2F2F2F] rounded border border-gray-600 flex items-center px-4">
          <span className="text-gray-400 text-sm">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-white font-medium mb-2">
          <FaGlobe className="inline mr-2" />
          Pays {showLanguageInfo && selectedLanguage && (
            <span className="text-gray-400 text-sm font-normal">
              ({getLanguageName(selectedLanguage)})
            </span>
          )}
        </label>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 bg-[#141414] text-white rounded border border-gray-600 hover:border-red-500 focus:border-red-500 focus:outline-none transition-colors duration-200"
      >
        <div className="flex items-center gap-2 flex-1 text-left">
          <span className="text-lg">{getSelectedCountryFlag()}</span>
          <span className="text-sm truncate">{getSelectedCountryName()}</span>
        </div>
        <FaChevronDown 
          className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          size={12}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#2F2F2F] border border-gray-600 rounded shadow-lg z-20 max-h-64 overflow-y-auto">
            {/* All Countries Option */}
            <button
              onClick={() => handleCountrySelect('')}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-[#404040] transition-colors duration-200 flex items-center gap-2 ${
                !selectedCountry ? 'bg-[#404040] text-red-500' : 'text-white'
              }`}
            >
              <span className="text-lg">🌍</span>
              <span>Tous les pays</span>
            </button>
            
            {/* Country Options */}
            {countries.map((country) => {
              const countryLanguage = getLanguageForCountry(country.iso_3166_1);
              return (
                <button
                  key={country.iso_3166_1}
                  onClick={() => handleCountrySelect(country.iso_3166_1)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-[#404040] transition-colors duration-200 flex items-center gap-2 ${
                    selectedCountry === country.iso_3166_1 ? 'bg-[#404040] text-red-500' : 'text-white'
                  }`}
                >
                  <span className="text-lg">
                    {country.iso_3166_1
                      .toUpperCase()
                      .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt()))}
                  </span>
                  <div className="flex-1">
                    <span>{country.native_name}</span>
                    {showLanguageInfo && (
                      <div className="text-gray-400 text-xs">
                        {getLanguageName(countryLanguage)}
                      </div>
                    )}
                  </div>
                  <span className="text-gray-400 text-xs">({country.iso_3166_1})</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default CountrySelector; 