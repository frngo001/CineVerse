import { useState, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const GenreFilter = ({ 
  genres = [], 
  selectedGenres = [], 
  onGenreChange, 
  mediaType = 'movie',
  isMultiSelect = false,
  placeholder = 'Tous les genres',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleGenreToggle = (genreId) => {
    if (isMultiSelect) {
      const newSelectedGenres = selectedGenres.includes(genreId)
        ? selectedGenres.filter(id => id !== genreId)
        : [...selectedGenres, genreId];
      
      onGenreChange(newSelectedGenres);
    } else {
      // Single select mode
      onGenreChange(selectedGenres.includes(genreId) ? [] : [genreId]);
      setIsOpen(false);
    }
  };

  const getSelectedGenreNames = () => {
    if (selectedGenres.length === 0) return placeholder;
    if (selectedGenres.length === 1) {
      const genre = genres.find(g => g.id === selectedGenres[0]);
      return genre ? genre.name : 'Genre sélectionné';
    }
    return `${selectedGenres.length} genres sélectionnés`;
  };

  const clearAllGenres = () => {
    onGenreChange([]);
    if (!isMultiSelect) {
      setIsOpen(false);
    }
  };

  if (!genres || genres.length === 0) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full h-10 bg-[#2F2F2F] rounded border border-gray-600 flex items-center px-4">
          <span className="text-gray-400 text-sm">Chargement des genres...</span>
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
        <span className="text-sm truncate text-left flex-1">{getSelectedGenreNames()}</span>
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
            {/* Clear All Button */}
            {selectedGenres.length > 0 && (
              <button
                onClick={clearAllGenres}
                className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-[#404040] transition-colors duration-200 border-b border-gray-600"
              >
                Effacer tout
              </button>
            )}
            
            {/* All Genres Option (for single select) */}
            {!isMultiSelect && (
              <button
                onClick={() => {
                  onGenreChange([]);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-[#404040] transition-colors duration-200 ${
                  selectedGenres.length === 0 ? 'bg-[#404040] text-red-500' : 'text-white'
                }`}
              >
                Tous les genres
              </button>
            )}
            
            {/* Genre Options */}
            {genres.map((genre) => (
              <div
                key={genre.id}
                className="hover:bg-[#404040] transition-colors duration-200"
              >
                {isMultiSelect ? (
                  <label className="flex items-center px-4 py-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(genre.id)}
                      onChange={() => handleGenreToggle(genre.id)}
                      className="mr-3 w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
                    />
                    <span className="text-sm text-white">{genre.name}</span>
                  </label>
                ) : (
                  <button
                    onClick={() => handleGenreToggle(genre.id)}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors duration-200 ${
                      selectedGenres.includes(genre.id) ? 'bg-[#404040] text-red-500' : 'text-white'
                    }`}
                  >
                    {genre.name}
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default GenreFilter; 