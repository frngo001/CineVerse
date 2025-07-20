import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaInfoCircle } from 'react-icons/fa';
import { MyListButton, RatingButtons, ContextualCallouts, AutoplayVideoBackground } from './NetflixFeatures';
import { netflixFeatures, getImageUrl, getBackdropUrl } from '../services/tmdb';

const MovieCard = ({ movie, size = 'default', showTitle = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');
  const title = movie.title || movie.name;
  const releaseDate = movie.release_date || movie.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';



  const handleCardClick = () => {
    // Füge zur Continue Watching hinzu mit zufälligem Progress
    const progress = Math.floor(Math.random() * 30) + 5; // 5-35% progress
    netflixFeatures.addToContinueWatching({
      ...movie,
      media_type: mediaType
    }, progress);
  };

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setIsHovered(true);
    }, 500); // Start video preview after 500ms hover
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHovered(false);
  };

  const cardClasses = {
    small: 'w-32 md:w-40',
    default: 'w-40 md:w-48 lg:w-56',
    large: 'w-48 md:w-56 lg:w-64'
  };

  return (
    <div 
      className={`group relative ${cardClasses[size]} flex-shrink-0 transition-all duration-300 hover:scale-105 hover:z-20 mb-4`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Card */}
      <div className="relative overflow-hidden rounded-lg bg-gray-800 shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
        {/* Auto-playing Video Background */}
        {isHovered && (
          <AutoplayVideoBackground 
            item={movie} 
            startDelay={0} // Start immediately when hovered
            className="z-10"
          />
        )}

        {/* Movie Poster */}
        <img
          src={getImageUrl(movie.poster_path, 'w500')}
          alt={title}
          className={`w-full object-cover transition-all duration-300 ${
            isHovered ? 'opacity-30' : 'opacity-100'
          } ${size === 'small' ? 'aspect-[2/3]' : 'aspect-[2/3]'}`}
          loading="lazy"
        />

        {/* Backdrop for hover state */}
        {isHovered && movie.backdrop_path && (
          <img
            src={getBackdropUrl(movie.backdrop_path, 'w780')}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-40 z-5"
          />
        )}

        {/* Contextual Call-outs */}
        <ContextualCallouts 
          item={movie} 
          className="absolute top-2 left-2 z-20"
        />

        {/* Rating */}
        {movie.vote_average > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            ★ {movie.vote_average.toFixed(1)}
          </div>
        )}

        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 flex flex-col justify-end p-4 z-30 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Title and Year */}
          <div className="mb-3">
            <h3 className="text-white font-bold text-sm md:text-base line-clamp-2 mb-1">
              {title}
            </h3>
            {year && (
              <p className="text-gray-300 text-xs">{year}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mb-2">
            <Link
              to={`/${mediaType}/${movie.id}`}
              onClick={handleCardClick}
              className="flex items-center justify-center w-8 h-8 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
              title="Lire"
            >
              <FaPlay className="text-xs ml-0.5" />
            </Link>

            <MyListButton 
              item={{ ...movie, media_type: mediaType }}
              className="w-8 h-8"
            />

            <Link
              to={`/${mediaType}/${movie.id}`}
              className="flex items-center justify-center w-8 h-8 border-2 border-gray-400 rounded-full hover:border-white transition-colors"
              title="Plus d'infos"
            >
              <FaInfoCircle className="text-white text-xs" />
            </Link>
          </div>

          {/* Rating Buttons */}
          <RatingButtons 
            item={{ ...movie, media_type: mediaType }}
            className="flex gap-1"
          />

          {/* Match Percentage (Netflix-style) */}
          {movie.vote_average > 0 && (
            <div className="mt-2">
              <span className="text-green-400 text-xs font-bold">
                {Math.round((movie.vote_average / 10) * 100)}% Match
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Title below card (optional) */}
      {showTitle && !isHovered && (
        <div className="mt-2 px-1">
          <h3 className="text-white text-sm font-medium line-clamp-2">
            {title}
          </h3>
          {year && (
            <p className="text-gray-400 text-xs mt-1">{year}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MovieCard; 