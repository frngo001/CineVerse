import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlay, FaInfoCircle, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { MyListButton, ContextualCallouts } from './NetflixFeatures';
import { netflixFeatures, tmdbApi, getBackdropUrl } from '../services/tmdb';
import StreamingModal from './StreamingModal';

const HeroBanner = ({ movie }) => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [trailerTitle, setTrailerTitle] = useState('');
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
  const [trailerError, setTrailerError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [showStreaming, setShowStreaming] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!movie?.id) return;

    const loadTrailer = async () => {
      setIsLoadingTrailer(true);
      setTrailerError(null);
      setDebugInfo('Chargement des vidéos...');
      
      try {
        const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');
        let videosData;
        
        setDebugInfo(`Recherche ${mediaType} ID: ${movie.id}`);
        
        if (mediaType === 'movie') {
          videosData = await tmdbApi.getMovieVideos(movie.id);
        } else {
          videosData = await tmdbApi.getTvVideos(movie.id);
        }

        setDebugInfo(`${videosData.results?.length || 0} vidéos trouvées`);

        if (videosData.results && videosData.results.length > 0) {
          // Suche nach dem besten Trailer (bevorzugt YouTube, Französisch)
          let trailer = videosData.results.find(video => 
            video.type === 'Trailer' && 
            video.site === 'YouTube' &&
            video.key &&
            video.iso_639_1 === 'fr'
          );

          // Fallback: Jeder YouTube-Trailer
          if (!trailer) {
            trailer = videosData.results.find(video => 
              video.type === 'Trailer' && 
              video.site === 'YouTube' &&
              video.key
            );
          }

          // Fallback: Jedes YouTube-Video
          if (!trailer) {
            trailer = videosData.results.find(video => 
              video.site === 'YouTube' &&
              video.key
            );
          }

          if (trailer) {
            setTrailerKey(trailer.key);
            setTrailerTitle(trailer.name || 'Bande-annonce');
            setDebugInfo(`Trailer trouvé: ${trailer.name}`);
            
            // Starte Video nach 2 Sekunden (verkürzt für bessere UX)
            const timer = setTimeout(() => {
              setShowVideo(true);
              setDebugInfo(`Lecture de: ${trailer.name}`);
            }, 2000);
            
            return () => clearTimeout(timer);
          } else {
            setDebugInfo('Aucune vidéo YouTube disponible');
            setTrailerError('Pas de bande-annonce disponible');
          }
        } else {
          setDebugInfo('Aucune vidéo trouvée');
          setTrailerError('Pas de vidéos disponibles');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des vidéos:', error);
        setTrailerError('Erreur de chargement');
        setDebugInfo(`Erreur: ${error.message}`);
      } finally {
        setIsLoadingTrailer(false);
      }
    };

    loadTrailer();
  }, [movie]);

  // Handle mute toggle with iframe communication
  useEffect(() => {
    if (showVideo && trailerKey && iframeRef.current) {
      try {
        // Force reload iframe with new mute parameter
        const iframe = iframeRef.current;
        const currentSrc = iframe.src;
        const newSrc = currentSrc.replace(/mute=\d/, `mute=${isMuted ? 1 : 0}`);
        if (newSrc !== currentSrc) {
          iframe.src = newSrc;
        }
      } catch (error) {
        console.log('Could not update iframe mute state:', error);
      }
    }
  }, [isMuted, showVideo, trailerKey]);

  if (!movie) {
    return (
      <div className="relative h-screen bg-gradient-to-r from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  const title = movie.title || movie.name;
  const overview = movie.overview;
  const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');
  const year = movie.release_date || movie.first_air_date 
    ? new Date(movie.release_date || movie.first_air_date).getFullYear() 
    : '';



  const handlePlayClick = () => {
    // Add to continue watching when user clicks play
    netflixFeatures.addToContinueWatching({
      ...movie,
      media_type: mediaType
    }, 0); // Start from beginning

    // Navigate to watch page
    if (mediaType === 'movie') {
      navigate(`/watch/movie/${movie.id}`);
    } else {
      // Für TV-Serien: Starte mit Staffel 1, Episode 1
      navigate(`/watch/tv/${movie.id}?season=1&episode=1`);
    }
  };

  // Optimierte YouTube URL für bessere Kompatibilität
  const getYouTubeEmbedUrl = (videoKey, muted = false) => {
    const params = new URLSearchParams({
      autoplay: '1',
      mute: muted ? '1' : '0',
      controls: '0',
      showinfo: '0',
      rel: '0',
      iv_load_policy: '3',
      modestbranding: '1',
      disablekb: '1',
      fs: '0',
      cc_load_policy: '0',
      playsinline: '1',
      enablejsapi: '1',
      origin: window.location.origin,
      loop: '1',
      playlist: videoKey,
      start: '5' // Skip erste 5 Sekunden (oft Logo/Intro)
    });
    
    return `https://www.youtube.com/embed/${videoKey}?${params.toString()}`;
  };

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={getBackdropUrl(movie.backdrop_path, 'original')}
          alt={title}
          className={`w-full h-full object-cover transition-opacity duration-1000 ${
            showVideo && trailerKey ? 'opacity-20' : 'opacity-100'
          }`}
          onError={(e) => {
            e.target.src = '/placeholder-backdrop.jpg';
          }}
        />
      </div>

      {/* Trailer Video Background */}
      {showVideo && trailerKey && (
        <div className="absolute inset-0 z-0">
          <iframe
            ref={iframeRef}
            src={getYouTubeEmbedUrl(trailerKey, isMuted)}
            title={trailerTitle}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              width: '100vw',
              height: '56.25vw', // 16:9 aspect ratio
              minHeight: '100vh',
              minWidth: '177.78vh', // 16:9 aspect ratio
              transform: 'translate(-50%, -50%)',
              top: '50%',
              left: '50%'
            }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen={false}
            loading="eager"
          />
          {/* Dark overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/20 z-1" />
        </div>
      )}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-5" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-5" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-5" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="px-4 md:px-8 lg:px-16 max-w-2xl">
          {/* Contextual Call-outs */}
          <ContextualCallouts 
            item={movie} 
            className="mb-4"
          />

          {/* Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 leading-tight drop-shadow-2xl">
            {title}
          </h1>

          {/* Year and Rating */}
          <div className="flex items-center gap-4 mb-4 text-white">
            {year && (
              <span className="text-lg font-medium drop-shadow-lg">{year}</span>
            )}
            {movie.vote_average > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span className="font-medium drop-shadow-lg">{movie.vote_average.toFixed(1)}</span>
              </div>
            )}
            {/* Netflix-style Match */}
            {movie.vote_average > 0 && (
              <span className="text-green-400 font-bold drop-shadow-lg">
                {Math.round((movie.vote_average / 10) * 100)}% Match
              </span>
            )}
          </div>

          {/* Overview */}
          {overview && (
            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed max-w-3xl line-clamp-3 drop-shadow-lg">
              {overview}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={handlePlayClick}
              className="flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-md text-lg font-bold hover:bg-gray-200 transition-colors duration-200 min-w-40 shadow-lg"
            >
              <FaPlay className="text-xl" />
              <span>Abspielen</span>
            </button>

            <Link
              to={`/${mediaType}/${movie.id}`}
              className="flex items-center justify-center gap-3 bg-gray-600/70 text-white px-8 py-4 rounded-md text-lg font-bold hover:bg-gray-600/90 transition-colors duration-200 min-w-40 backdrop-blur-sm"
            >
              <FaInfoCircle className="text-xl" />
              <span>Plus d'infos</span>
            </Link>
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-4">
            <MyListButton 
              item={{ ...movie, media_type: mediaType }}
              className="w-12 h-12 border-2"
            />

            {/* Volume Control (nur wenn Video läuft) */}
            {showVideo && trailerKey && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-400 hover:border-white transition-all duration-200"
                title={isMuted ? "Activer le son" : "Couper le son"}
              >
                {isMuted ? (
                  <FaVolumeMute className="text-white text-lg" />
                ) : (
                  <FaVolumeUp className="text-white text-lg" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Age Rating Badge */}
      {movie.vote_average && (
        <div className="absolute bottom-20 right-4 md:right-8 lg:right-16 bg-gray-800/90 text-white px-3 py-2 rounded border border-gray-600 backdrop-blur-sm z-10">
          <div className="text-xs font-bold">
            {movie.vote_average >= 7.5 ? 'RECOMMENDÉ' : movie.vote_average >= 6.0 ? 'POPULAIRE' : 'POUR TOUS'}
          </div>
        </div>
      )}

      {/* Status Indicators */}
      <div className="absolute bottom-4 left-4 md:left-8 lg:left-16 z-10 space-y-2">
        {/* Loading Indicator */}
        {isLoadingTrailer && (
          <div className="text-white text-sm bg-black/70 px-3 py-1 rounded backdrop-blur-sm">
            🔍 Recherche de la bande-annonce...
          </div>
        )}

        {/* Video Status - Versteckt wenn Video läuft */}
        {/* {showVideo && trailerKey && (
          <div className="text-white text-sm bg-black/70 px-3 py-1 rounded backdrop-blur-sm">
            🎬 {trailerTitle}
          </div>
        )} */}

        {/* Error Status - Versteckt um saubere UI zu behalten */}
        {/* {trailerError && !isLoadingTrailer && (
          <div className="text-white text-sm bg-red-600/70 px-3 py-1 rounded backdrop-blur-sm">
            ❌ {trailerError}
          </div>
        )} */}

        {/* Debug Info (nur in Development) */}
        {debugInfo && process.env.NODE_ENV === 'development' && !showVideo && (
          <div className="text-xs text-gray-300 bg-black/50 px-2 py-1 rounded">
            {debugInfo}
          </div>
        )}
      </div>

      {/* Netflix-style fade to next content */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#141414] to-transparent z-5" />

      {/* Streaming Modal */}
      {showStreaming && (
        <StreamingModal
          movieId={mediaType === 'movie' ? movie.id : null}
          tvId={mediaType === 'tv' ? movie.id : null}
          isOpen={showStreaming}
          onClose={() => setShowStreaming(false)}
        />
      )}
    </div>
  );
};

export default HeroBanner; 