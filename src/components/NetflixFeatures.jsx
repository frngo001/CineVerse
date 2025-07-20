import React, { useState, useEffect } from 'react';
import { FaPlus, FaMinus, FaThumbsUp, FaThumbsDown, FaPlay, FaTimes } from 'react-icons/fa';
import { netflixFeatures } from '../services/tmdb';

// My List Button Component
export const MyListButton = ({ item, className = "" }) => {
  const [isInList, setIsInList] = useState(false);

  useEffect(() => {
    setIsInList(netflixFeatures.isInMyList(item.id, item.media_type));
  }, [item.id, item.media_type]);

  const handleToggleMyList = () => {
    if (isInList) {
      netflixFeatures.removeFromMyList(item.id, item.media_type);
      setIsInList(false);
    } else {
      netflixFeatures.addToMyList(item);
      setIsInList(true);
    }
  };

  return (
    <button
      onClick={handleToggleMyList}
      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-400 hover:border-white transition-all duration-200 ${className}`}
      title={isInList ? "Retirer de ma liste" : "Ajouter à ma liste"}
    >
      {isInList ? (
        <FaMinus className="text-white text-sm" />
      ) : (
        <FaPlus className="text-white text-sm" />
      )}
    </button>
  );
};

// Rating Button Component
export const RatingButtons = ({ item, className = "" }) => {
  const [rating, setRating] = useState(null);

  useEffect(() => {
    setRating(netflixFeatures.getRating(item.id, item.media_type));
  }, [item.id, item.media_type]);

  const handleRating = (newRating) => {
    const finalRating = rating === newRating ? null : newRating;
    netflixFeatures.setRating(item.id, item.media_type, finalRating);
    setRating(finalRating);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={() => handleRating('up')}
        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
          rating === 'up' 
            ? 'border-green-500 bg-green-500 text-white' 
            : 'border-gray-400 hover:border-white text-white'
        }`}
        title="J'aime"
      >
        <FaThumbsUp className="text-sm" />
      </button>
      <button
        onClick={() => handleRating('down')}
        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
          rating === 'down' 
            ? 'border-red-500 bg-red-500 text-white' 
            : 'border-gray-400 hover:border-white text-white'
        }`}
        title="Je n'aime pas"
      >
        <FaThumbsDown className="text-sm" />
      </button>
    </div>
  );
};

// Contextual Call-outs Component
export const ContextualCallouts = ({ item, className = "" }) => {
  const callouts = netflixFeatures.getContextualCallouts(item);

  if (callouts.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {callouts.map((callout, index) => (
        <span
          key={index}
          className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded"
        >
          {callout}
        </span>
      ))}
    </div>
  );
};

// Continue Watching Remove Button
export const ContinueWatchingRemove = ({ item, onRemove, className = "" }) => {
  const handleRemove = () => {
    netflixFeatures.removeFromContinueWatching(item.id, item.media_type);
    if (onRemove) onRemove(item.id, item.media_type);
  };

  return (
    <button
      onClick={handleRemove}
      className={`flex items-center justify-center w-8 h-8 rounded-full bg-black/70 hover:bg-black transition-all duration-200 ${className}`}
      title="Retirer de continuer à regarder"
    >
      <FaTimes className="text-white text-sm" />
    </button>
  );
};

// Skip Intro Button Component
export const SkipIntroButton = ({ item, currentTime = 0, onSkip, className = "" }) => {
  const [showSkip, setShowSkip] = useState(false);
  const [introLength, setIntroLength] = useState(0);

  useEffect(() => {
    const hasIntro = netflixFeatures.hasIntro(item.id, item.media_type);
    if (hasIntro) {
      const length = netflixFeatures.getIntroLength(item.id, item.media_type);
      setIntroLength(length);
      // Zeige Skip Button zwischen 5 Sekunden und Intro-Ende
      setShowSkip(currentTime >= 5 && currentTime <= length);
    }
  }, [item.id, item.media_type, currentTime]);

  if (!showSkip) return null;

  return (
    <button
      onClick={() => onSkip && onSkip(introLength)}
      className={`px-4 py-2 bg-gray-800/90 hover:bg-gray-700 text-white font-medium rounded border border-gray-600 hover:border-white transition-all duration-200 ${className}`}
    >
      Passer l'intro
    </button>
  );
};

// Profile Selector Component
export const ProfileSelector = ({ onProfileChange, className = "" }) => {
  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const profileList = netflixFeatures.getProfiles();
    const current = netflixFeatures.getCurrentProfile();
    setProfiles(profileList);
    setCurrentProfile(current);
  }, []);

  const handleProfileChange = (profile) => {
    netflixFeatures.setCurrentProfile(profile.id);
    setCurrentProfile(profile);
    setShowDropdown(false);
    if (onProfileChange) onProfileChange(profile);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
      >
        <img
          src={currentProfile?.avatar}
          alt={currentProfile?.name}
          className="w-8 h-8 rounded"
        />
        <span className="hidden md:block">{currentProfile?.name}</span>
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 bg-black/95 border border-gray-600 rounded-md shadow-lg z-50 min-w-48">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => handleProfileChange(profile)}
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-white hover:bg-gray-800 transition-colors"
            >
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-8 h-8 rounded"
              />
              <span>{profile.name}</span>
              {profile.isKids && (
                <span className="text-xs bg-yellow-500 text-black px-1 rounded">
                  ENFANT
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Auto-playing Video Background Component
export const AutoplayVideoBackground = ({ item, startDelay = 30000, className = "" }) => {
  const [showVideo, setShowVideo] = useState(false);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    let timer;
    
    // Starte Auto-play nach Delay
    timer = setTimeout(() => {
      if (item?.id) {
        // Hier würden normalerweise Videos geladen werden
        // Für Demo verwenden wir ein Placeholder
        setShowVideo(true);
      }
    }, startDelay);

    return () => clearTimeout(timer);
  }, [item, startDelay]);

  if (!showVideo || !item) return null;

  return (
    <div className={`absolute inset-0 ${className}`}>
      {/* Placeholder für Video - in echter App würde hier ein Video-Element stehen */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-black/20 animate-pulse" />
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black/70 px-2 py-1 rounded">
        Video-Vorschau läuft...
      </div>
    </div>
  );
};

export default {
  MyListButton,
  RatingButtons,
  ContextualCallouts,
  ContinueWatchingRemove,
  SkipIntroButton,
  ProfileSelector,
  AutoplayVideoBackground
}; 