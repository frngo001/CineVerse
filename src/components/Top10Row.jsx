import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaPlay, FaPlus, FaInfo, FaCrown, FaTrophy, FaMedal } from 'react-icons/fa';
import { getImageUrl, getBackdropUrl, netflixFeatures } from '../services/tmdb';

const Top10Row = ({ title, movies, className = '' }) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    checkScrollButtons();
  }, [movies]);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.7;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleAddToMyList = (movie, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isInList = netflixFeatures.isInMyList(movie.id, movie.media_type || 'movie');
    
    if (isInList) {
      netflixFeatures.removeFromMyList(movie.id, movie.media_type || 'movie');
    } else {
      netflixFeatures.addToMyList(movie);
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return <FaCrown className="text-yellow-400" />;
    if (index === 1) return <FaTrophy className="text-gray-300" />;
    if (index === 2) return <FaMedal className="text-amber-600" />;
    return null;
  };

  const getRankStyle = (index) => {
    if (index === 0) return 'border-yellow-400/30 bg-yellow-400/5';
    if (index === 1) return 'border-gray-300/30 bg-gray-300/5';
    if (index === 2) return 'border-amber-600/30 bg-amber-600/5';
    return 'border-gray-600/30 bg-gray-800/30';
  };



  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Title with same style as other components */}
      <div className="px-4 md:px-8 lg:px-16 mb-4">
        <h2 className="text-white text-xl md:text-2xl font-bold">{title}</h2>
      </div>

      {/* Scroll Container */}
      <div className="relative group">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-black/80 backdrop-blur text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600"
          >
            <FaChevronLeft className="text-sm" />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-black/80 backdrop-blur text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600"
          >
            <FaChevronRight className="text-sm" />
          </button>
        )}

        {/* Movies Leaderboard */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollButtons}
          className="flex overflow-x-auto scrollbar-hide gap-6 px-4 md:px-8 lg:px-16 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.slice(0, 10).map((movie, index) => (
            <div
              key={movie.id}
              className="flex-shrink-0 relative group cursor-pointer w-80"
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link
                to={`/${movie.media_type || 'movie'}/${movie.id}`}
                className="block"
              >
                {/* Leaderboard Card */}
                <div className={`relative border rounded-xl overflow-hidden backdrop-blur transition-all duration-300 group-hover:scale-[1.02] ${getRankStyle(index)}`}>
                  
                  {/* Background Image - Full Coverage */}
                  {movie.backdrop_path && (
                    <div className="absolute inset-0 z-0">
                      <img
                        src={getBackdropUrl(movie.backdrop_path, 'w780')}
                        alt={movie.title || movie.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Dark overlay for readability */}
                      <div className="absolute inset-0 bg-black/70" />
                    </div>
                  )}
                  
                  {/* Header with Rank */}
                  <div className="relative z-10 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-black/60 rounded-full backdrop-blur border border-white/20">
                        {getRankIcon(index) || (
                          <span className="text-white font-bold text-sm">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="text-white">
                        <div className="text-xs text-gray-200 uppercase tracking-wider font-medium">
                          Position
                        </div>
                        <div className="font-bold text-lg">
                          #{index + 1}
                        </div>
                      </div>
                    </div>
                    
                    {/* Rating */}
                    <div className="text-right">
                      <div className="text-xs text-gray-200 uppercase tracking-wider font-medium">
                        Note
                      </div>
                      <div className="text-white font-semibold flex items-center gap-1">
                        <span className="text-yellow-400 text-xs">★</span>
                        {movie.vote_average?.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="relative z-10 flex">
                    {/* Movie Poster */}
                    <div className="w-24 h-36 flex-shrink-0">
                      <img
                        src={getImageUrl(movie.poster_path, 'w185')}
                        alt={movie.title || movie.name}
                        className="w-full h-full object-cover rounded-l border-r border-white/10"
                        loading="lazy"
                      />
                    </div>

                    {/* Movie Info */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 leading-tight drop-shadow-lg">
                          {movie.title || movie.name}
                        </h3>
                        
                        <div className="text-xs text-gray-200 mb-3 space-y-1">
                          <div>
                            {movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0]}
                          </div>
                          {movie.genre_ids && movie.genre_ids[0] && (
                            <div className="text-gray-300">
                              {movie.media_type === 'tv' ? 'Série' : 'Film'}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className={`flex gap-2 transition-opacity duration-300 ${hoveredItem === index ? 'opacity-100' : 'opacity-0'}`}>
                        <button className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 flex-shrink-0 shadow-lg">
                          <FaPlay className="text-xs" />
                        </button>
                        <button
                          onClick={(e) => handleAddToMyList(movie, e)}
                          className="bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors duration-200 flex-shrink-0 border border-white/20 backdrop-blur"
                        >
                          <FaPlus className="text-xs" />
                        </button>
                        <button className="bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors duration-200 flex-shrink-0 border border-white/20 backdrop-blur">
                          <FaInfo className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Progress/Popularity Bar */}
                  <div className="relative z-10 h-1 bg-black/50">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        index === 0 ? 'bg-yellow-400' :
                        index === 1 ? 'bg-gray-300' :
                        index === 2 ? 'bg-amber-600' : 'bg-red-600'
                      }`}
                      style={{ 
                        width: `${Math.max(20, 100 - (index * 8))}%`,
                        transition: 'width 1s ease-out'
                      }}
                    />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Minimal Stats */}
        <div className="mt-8 px-4 md:px-8 lg:px-16">
          <div className="flex justify-between items-center text-gray-500 text-sm">
            <span>Classement mis à jour quotidiennement</span>
            <span>Basé sur la popularité et les notes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Top10Row; 