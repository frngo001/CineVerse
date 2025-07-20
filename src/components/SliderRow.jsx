import React, { useState, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import MovieCard from './MovieCard';
import { ContinueWatchingRemove } from './NetflixFeatures';

const SliderRow = ({ 
  title, 
  movies = [], 
  showTitle = true,
  showContinueWatchingFeatures = false,
  onUpdate,
  className = "" 
}) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = useRef(null);

  if (!movies || movies.length === 0) {
    return null;
  }

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.offsetWidth * 0.8;
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, offsetWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - offsetWidth - 10);
  };

  const handleContinueWatchingRemove = (id, mediaType) => {
    if (onUpdate) {
      onUpdate();
    }
  };

  const formatProgress = (progress) => {
    if (progress === 0) return 'Nouveau';
    if (progress >= 95) return 'Terminé';
    return `${Math.round(progress)}%`;
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Section Title */}
      {showTitle && title && (
        <div className="px-4 md:px-8 lg:px-16 mb-4">
          <h2 className="text-white text-xl md:text-2xl font-bold">{title}</h2>
          {showContinueWatchingFeatures && (
            <p className="text-gray-400 text-sm mt-1">
              Reprenez là où vous vous êtes arrêté
            </p>
          )}
        </div>
      )}

      {/* Slider Container */}
      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Précédent"
          >
            <FaChevronLeft className="text-xl" />
          </button>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Suivant"
          >
            <FaChevronRight className="text-xl" />
          </button>
        )}

        {/* Movies Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide px-4 md:px-8 lg:px-16 py-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitScrollbar: 'none'
          }}
        >
          {movies.map((movie, index) => (
            <div key={`${movie.id}_${index}`} className="relative flex-shrink-0">
              {showContinueWatchingFeatures ? (
                // Continue Watching Card with Progress
                <div className="group/card relative">
                  <MovieCard 
                    movie={movie} 
                    size="default"
                    showTitle={false}
                  />
                  
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 rounded-b-md">
                    <div className="w-full bg-gray-700 rounded-full h-1 mb-1">
                      <div 
                        className="bg-red-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${movie.progress || 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-300">
                      <span className="font-medium line-clamp-1">
                        {movie.title || movie.name}
                      </span>
                      <span>{formatProgress(movie.progress || 0)}</span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <ContinueWatchingRemove
                    item={movie}
                    onRemove={handleContinueWatchingRemove}
                    className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity z-10"
                  />
                </div>
              ) : (
                // Regular Movie Card
                <MovieCard 
                  movie={movie} 
                  size="default"
                  showTitle={!showTitle}
                />
              )}
            </div>
          ))}

          {/* Load More Indicator */}
          {movies.length >= 20 && (
            <div className="flex-shrink-0 w-40 md:w-48 lg:w-56 flex items-center justify-center bg-gray-800/50 rounded-md border-2 border-dashed border-gray-600 hover:border-gray-400 transition-colors cursor-pointer">
              <div className="text-center text-gray-400 hover:text-white transition-colors">
                <div className="text-2xl mb-2">+</div>
                <div className="text-sm">Voir plus</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row Statistics (for Continue Watching) */}
      {showContinueWatchingFeatures && movies.length > 0 && (
        <div className="px-4 md:px-8 lg:px-16 mt-2">
          <div className="text-gray-500 text-xs">
            {movies.length} élément{movies.length > 1 ? 's' : ''} en cours
          </div>
        </div>
      )}
    </div>
  );
};

export default SliderRow; 