import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, memo } from 'react';
import { FaForward, FaBackward, FaList } from 'react-icons/fa';
import { tmdbApi, getImageUrl, netflixFeatures } from '../services/tmdb';
import WatchPageInfo from '../components/WatchPageInfo';
import WatchPageRecommendations from '../components/WatchPageRecommendations';

const Watch = ({ type }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [videoData, setVideoData] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [allEpisodes, setAllEpisodes] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(Number(searchParams.get('season')) || 1);
  const [selectedEpisode, setSelectedEpisode] = useState(Number(searchParams.get('episode')) || 1);
  const [episodeObj, setEpisodeObj] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  
  // Server-Konfiguration - VidLink.pro verwenden
  const [currentServer, setCurrentServer] = useState(0);
  const servers = [
    { 
      name: 'VidLink.pro', 
      url: 'https://vidlink.pro',
      quality: 'UHD',
      reliability: 98,
      description: 'Premium Streaming-Server mit anpassbarem Player'
    }
  ];

  // Funktionale VideoPlayer-Komponente mit VidLink.pro API - Inspiriert vom bewährten Code
  const FunctionalVideoPlayer = memo(({ movieId, tvId, season, episode, serverIndex }) => {
    const iframeRef = useRef(null);
    const server = servers[serverIndex];
    let iframeSrc;

    if (type === 'movie') {
      // VidLink.pro API für Movies mit Customization
      iframeSrc = `${server.url}/movie/${movieId}?primaryColor=c92222&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=default&title=true&poster=true&autoplay=false&nextbutton=true`;
    } else {
      // VidLink.pro API für TV Shows mit Season/Episode
      if (season && episode) {
        iframeSrc = `${server.url}/tv/${tvId}/${season}/${episode}?primaryColor=c92222&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=default&title=true&poster=true&autoplay=false&nextbutton=true`;
      } else {
        iframeSrc = `${server.url}/tv/${tvId}?primaryColor=c92222&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=default&title=true&poster=true&autoplay=false&nextbutton=true`;
      }
    }

    useEffect(() => {
      const originalWindowOpen = window.open;
      window.open = () => null;

      const currentIframe = iframeRef.current;

      const disableContextMenu = (event) => event.preventDefault();

      const preventIframeRedirects = () => {
        if (currentIframe?.contentWindow) {
          try {
            const iframeWindow = currentIframe.contentWindow;
            Object.defineProperties(iframeWindow, {
              open: { value: () => null, configurable: true },
              location: {
                get() {
                  return null;
                },
                set() {},
                configurable: true,
              },
            });
            // Trigger a resize event to make sure the embedded content scales correctly
            setTimeout(() => {
              iframeWindow.dispatchEvent(new Event('resize'));
            }, 100); // slight delay
          } catch {
            console.warn(
              'Cross-origin restrictions prevented iframe modifications'
            );
          }
        }
      };

      const handleClickEvent = (event) => {
        if (currentIframe?.contains(event.target)) {
          event.stopPropagation();
        }
      };

      const handleWindowBlur = () => {
        requestAnimationFrame(() => {
          if (document.activeElement instanceof HTMLIFrameElement) {
            window.focus();
          }
        });
      };

      // VidLink Watch Progress Event Listener
      const handleVidLinkMessage = (event) => {
        if (event.origin !== 'https://vidlink.pro') return;
        
        if (event.data?.type === 'MEDIA_DATA') {
          const mediaData = event.data.data;
          localStorage.setItem('vidLinkProgress', JSON.stringify(mediaData));
          console.log('VidLink Progress gespeichert:', mediaData);
        }
        
        if (event.data?.type === 'PLAYER_EVENT') {
          const { event: eventType, currentTime, duration } = event.data.data;
          console.log(`Player ${eventType} bei ${currentTime}s von ${duration}s`);
        }
      };

      window.addEventListener('contextmenu', disableContextMenu);
      window.addEventListener('blur', handleWindowBlur);
      window.addEventListener('message', handleVidLinkMessage);
      document.addEventListener('click', handleClickEvent, true);
      currentIframe?.addEventListener('load', preventIframeRedirects);

      return () => {
        window.open = originalWindowOpen;
        window.removeEventListener('contextmenu', disableContextMenu);
        window.removeEventListener('blur', handleWindowBlur);
        window.removeEventListener('message', handleVidLinkMessage);
        document.removeEventListener('click', handleClickEvent, true);
        currentIframe?.removeEventListener('load', preventIframeRedirects);
      };
    }, []);

    if (!movieId && !tvId) return null;

    return (
      <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          allowFullScreen
          title={type === 'movie' ? 'Movie Stream' : 'Series Stream'}    
          frameborder="0" 
          referrerPolicy="no-referrer"
          className="w-full h-[50vh] sm:h-[40vh] md:h-[60vh] lg:h-[70vh] xl:h-[75vh] rounded shadow-lg"
          style={{
            pointerEvents: 'auto',
            userSelect: 'none',
          }}
        />
      </div>
    );
  });

  FunctionalVideoPlayer.displayName = 'FunctionalVideoPlayer';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (type === 'tv') {
          const tvRes = await tmdbApi.getTvDetails(id);
          setVideoData(tvRes);
          const validSeasons = tvRes.seasons.filter(s => s.season_number > 0);
          setSeasons(validSeasons);
          
          // Lade alle Episoden der aktuellen Staffel
          if (selectedSeason) {
            const seasonData = await tmdbApi.getTvSeason(id, selectedSeason);
            setAllEpisodes(seasonData.episodes || []);
            const ep = seasonData.episodes.find(e => e.episode_number === selectedEpisode);
            setEpisodeObj(ep);
          }
        } else {
          const movieRes = await tmdbApi.getMovieDetails(id);
          setVideoData(movieRes);
        }
      } catch (e) {
        console.error('Fehler beim Laden der Daten:', e);
        setVideoData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, type, selectedSeason, selectedEpisode]);

  // Füge zum Continue Watching hinzu
  useEffect(() => {
    if (videoData && (type === 'movie' || episodeObj)) {
      netflixFeatures.addToContinueWatching({
        id: videoData.id,
        title: videoData.title || videoData.name,
        poster_path: videoData.poster_path,
        media_type: type,
        ...(type === 'tv' && {
          season: selectedSeason,
          episode: selectedEpisode,
          episode_name: episodeObj?.name
        })
      }, 5); // 5% Progress als Beispiel
    }
  }, [videoData, episodeObj, selectedSeason, selectedEpisode, type]);

  // Navigation zwischen Episoden
  const navigateEpisode = (direction) => {
    if (type !== 'tv') return;
    
    const currentIndex = allEpisodes.findIndex(ep => ep.episode_number === selectedEpisode);
    let newEpisode = selectedEpisode;
    let newSeason = selectedSeason;

    if (direction === 'next') {
      if (currentIndex < allEpisodes.length - 1) {
        newEpisode = allEpisodes[currentIndex + 1].episode_number;
      } else {
        // Nächste Staffel
        const seasonIndex = seasons.findIndex(s => s.season_number === selectedSeason);
        if (seasonIndex < seasons.length - 1) {
          newSeason = seasons[seasonIndex + 1].season_number;
          newEpisode = 1;
        }
      }
    } else {
      if (currentIndex > 0) {
        newEpisode = allEpisodes[currentIndex - 1].episode_number;
      } else {
        // Vorherige Staffel
        const seasonIndex = seasons.findIndex(s => s.season_number === selectedSeason);
        if (seasonIndex > 0) {
          newSeason = seasons[seasonIndex - 1].season_number;
          newEpisode = 1; // Wird durch useEffect korrigiert
        }
      }
    }

    if (newEpisode !== selectedEpisode || newSeason !== selectedSeason) {
      navigate(`/watch/tv/${id}?season=${newSeason}&episode=${newEpisode}`);
      setSelectedSeason(newSeason);
      setSelectedEpisode(newEpisode);
    }
  };

  // Tastatur-Shortcuts für Episode-Navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      switch (e.key) {
        case 'ArrowLeft':
          if (type === 'tv') {
            e.preventDefault();
            navigateEpisode('prev');
          }
          break;
        case 'ArrowRight':
          if (type === 'tv') {
            e.preventDefault();
            navigateEpisode('next');
          }
          break;
        case 'Escape':
          e.preventDefault();
          navigate(-1);
          break;
        case 'e':
        case 'E':
          if (type === 'tv') {
            e.preventDefault();
            setShowEpisodeList(!showEpisodeList);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [type, selectedSeason, selectedEpisode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-red-600 mb-4 mx-auto"></div>
          <div className="text-white text-xl">Chargement du lecteur...</div>
        </div>
      </div>
    );
  }

  if (!videoData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Contenu introuvable</h1>
          <p className="text-gray-400 mb-6">Le contenu demandé n'est pas disponible.</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      {/* Video Player Container */}
      <div className="relative w-full bg-black px-4 sm:px-6 lg:px-8">


        {/* Video Player */}
        <FunctionalVideoPlayer 
          movieId={type === 'movie' ? id : null}
          tvId={type === 'tv' ? id : null}
          season={selectedSeason}
          episode={selectedEpisode}
          serverIndex={currentServer}
        />

        {/* Episode Navigation für TV - Direkt am Video ohne Abstand */}
        {type === 'tv' && (
          <div className="flex items-center justify-center gap-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 mx-auto max-w-2xl">
            <button
              onClick={() => navigateEpisode('prev')}
              className="flex items-center gap-2 text-white hover:text-red-500 transition-colors disabled:opacity-50 disabled:hover:text-white px-3 py-2 rounded hover:bg-white/10"
              disabled={selectedSeason === 1 && selectedEpisode === 1}
              title="Épisode précédent (←)"
            >
              <FaBackward /> Précédent
            </button>
            
            <div className="text-center px-4">
              <div className="text-red-500 text-sm font-medium">Vous regardez</div>
              <div className="text-white font-bold">
                S{selectedSeason} E{selectedEpisode}
              </div>
              {episodeObj && (
                <div className="text-gray-300 text-sm">{episodeObj.name}</div>
              )}
            </div>
            
            <button
              onClick={() => navigateEpisode('next')}
              className="flex items-center gap-2 text-white hover:text-red-500 transition-colors px-3 py-2 rounded hover:bg-white/10"
              title="Épisode suivant (→)"
            >
              Suivant <FaForward />
            </button>
          </div>
        )}

        {/* Episode List Button für TV - Direkt an der Navigation ohne Abstand */}
        {type === 'tv' && (
          <div className="flex justify-center">
            <button
              onClick={() => setShowEpisodeList(!showEpisodeList)}
              className="flex items-center gap-2 bg-black/60 hover:bg-black/80 px-4 py-2 rounded-lg transition-all backdrop-blur-sm"
              title="Liste des épisodes (E)"
            >
              <FaList /> Épisodes
            </button>
          </div>
        )}
      </div>

      {/* Episode List Panel */}
      {showEpisodeList && type === 'tv' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#181818] rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold">Épisodes - Saison {selectedSeason}</h3>
              <button
                onClick={() => setShowEpisodeList(false)}
                className="text-gray-400 hover:text-white text-xl transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Season Selector */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex gap-2 overflow-x-auto">
                {seasons.map(season => (
                  <button
                    key={season.id}
                    onClick={() => setSelectedSeason(season.season_number)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      selectedSeason === season.season_number
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    {season.name || `Saison ${season.season_number}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Episodes Grid */}
            <div className="p-4 overflow-y-auto max-h-96">
              <div className="grid grid-cols-1 gap-3">
                {allEpisodes.map((episode, index) => (
                  <div
                    key={episode.id}
                    onClick={() => {
                      setSelectedEpisode(episode.episode_number);
                      navigate(`/watch/tv/${id}?season=${selectedSeason}&episode=${episode.episode_number}`);
                      setShowEpisodeList(false);
                    }}
                    className={`flex gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedEpisode === episode.episode_number
                        ? 'bg-red-600/20 border border-red-600'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={episode.still_path ? getImageUrl(episode.still_path, 'w300') : '/placeholder-image.jpg'}
                        alt={episode.name}
                        className="w-24 h-14 object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold">{episode.episode_number}</span>
                        <h4 className="font-medium truncate">{episode.name}</h4>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {episode.overview || 'Aucune description disponible.'}
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        {episode.runtime ? `${episode.runtime}min` : ''} • 
                        Note: {episode.vote_average?.toFixed(1) || 'N/A'}/10
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Information Section */}
      <WatchPageInfo 
        videoData={videoData}
        episodeObj={episodeObj}
        selectedSeason={selectedSeason}
        selectedEpisode={selectedEpisode}
        type={type}
      />

      {/* Recommendations Section */}
      <WatchPageRecommendations 
        videoData={videoData}
        type={type}
      />
    </div>
  );
};

export default Watch; 