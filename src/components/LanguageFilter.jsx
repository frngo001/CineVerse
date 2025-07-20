import { useState, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const LanguageFilter = ({ 
  languages = [], 
  selectedLanguage = '', 
  onLanguageChange, 
  placeholder = 'Toutes les langues',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageSelect = (languageCode) => {
    onLanguageChange(selectedLanguage === languageCode ? '' : languageCode);
    setIsOpen(false);
  };

  const getSelectedLanguageName = () => {
    if (!selectedLanguage) return placeholder;
    const language = languages.find(l => l.iso_639_1 === selectedLanguage);
    return language ? language.english_name : 'Langue sélectionnée';
  };

  const clearLanguage = () => {
    onLanguageChange('');
    setIsOpen(false);
  };

  // Liste des langues les plus populaires pour affichage prioritaire
  const popularLanguages = [
    'fr', 'en', 'es', 'de', 'it', 'ja', 'ko', 'zh', 'hi', 'pt', 'ru', 'ar'
  ];

  // Séparer les langues populaires des autres
  const sortedLanguages = languages.sort((a, b) => {
    const aIsPopular = popularLanguages.includes(a.iso_639_1);
    const bIsPopular = popularLanguages.includes(b.iso_639_1);
    
    if (aIsPopular && !bIsPopular) return -1;
    if (!aIsPopular && bIsPopular) return 1;
    
    return a.english_name.localeCompare(b.english_name);
  });

  if (!languages || languages.length === 0) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full h-10 bg-[#2F2F2F] rounded border border-gray-600 flex items-center px-4">
          <span className="text-gray-400 text-sm">Chargement des langues...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 bg-[#141414] text-white rounded border border-gray-600 hover:border-red-500 focus:border-red-500 focus:outline-none transition-colors duration-200"
      >
        <span className="text-sm truncate text-left flex-1">{getSelectedLanguageName()}</span>
        <FaChevronDown 
          className={`ml-2 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
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
            {/* Clear Button */}
            <button
              onClick={clearLanguage}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-[#404040] transition-colors duration-200 ${
                !selectedLanguage ? 'bg-[#404040] text-red-500' : 'text-white'
              }`}
            >
              Toutes les langues
            </button>
            
            {/* Language Options */}
            {sortedLanguages.map((language, index) => {
              const isPopular = popularLanguages.includes(language.iso_639_1);
              const showDivider = index === 0 && isPopular || 
                                  (index > 0 && isPopular && !popularLanguages.includes(sortedLanguages[index - 1]?.iso_639_1));
              
              return (
                <div key={language.iso_639_1}>
                  {showDivider && index > 0 && (
                    <div className="border-t border-gray-600 mx-2 my-1"></div>
                  )}
                  <button
                    onClick={() => handleLanguageSelect(language.iso_639_1)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-[#404040] transition-colors duration-200 ${
                      selectedLanguage === language.iso_639_1 ? 'bg-[#404040] text-red-500' : 'text-white'
                    } ${isPopular ? 'font-medium' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{language.english_name}</span>
                      {isPopular && (
                        <span className="text-xs text-gray-400">Populaire</span>
                      )}
                    </div>
                    {language.name !== language.english_name && (
                      <div className="text-xs text-gray-400">{language.name}</div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageFilter; 