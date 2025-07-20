import React, { useState, useEffect } from 'react';
import { FaPlay, FaPlus, FaChevronRight } from 'react-icons/fa';
import { tmdbApi, getImageUrl, netflixFeatures } from '../services/tmdb';
import { Link } from 'react-router-dom';

const WatchPageRecommendations = ({ videoData, type }) => {
  const [similar, setSimilar] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('similar');

  useEffect(() => {
    if (videoData) {
      loadRecommendations();
    }
  }, [videoData, type]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      
      const [similarData, recommendationsData, trendingData] = await Promise.all([
        type === 'tv' 
          ? tmdbApi.getSimilarTv(videoData.id)
          : tmdbApi.getSimilarMovies(videoData.id),
        type === 'tv'
          ? tmdbApi.getTvRecommendations(videoData.id)
          : tmdbApi.getMovieRecommendations(videoData.id),
        type === 'tv'
          ? tmdbApi.getTrendingTv('week')
          : tmdbApi.getTrendingMovies('week')
      ]);

      setSimilar(similarData.results?.slice(0, 12) || []);
      setRecommendations(recommendationsData.results?.slice(0, 12) || []);
      setTrending(trendingData.results?.slice(0, 12) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des recommandations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'similar': return similar;
      case 'recommendations': return recommendations;
      case 'trending': return trending;
      default: return similar;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'similar': return type === 'tv' ? 'Séries similaires' : 'Films similaires';
      case 'recommendations': return 'Recommandé pour vous';
      case 'trending': return type === 'tv' ? 'Séries tendance' : 'Films tendance';
      default: return 'Similaires';
    }
  };

  const handleAddToList = (item, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const isInList = netflixFeatures.isInMyList(item.id, type);
    if (isInList) {
      netflixFeatures.removeFromMyList(item.id, type);
    } else {
      netflixFeatures.addToMyList({
        ...item,
        media_type: type
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-[#141414] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentItems = getCurrentItems();

  return (
    <div className="bg-[#141414] text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Tabs */}
        <div className="flex items-center gap-6 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('similar')}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              activeTab === 'similar'
                ? 'text-white border-b-2 border-red-600'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {type === 'tv' ? 'Similaires' : 'Similaires'}
          </button>
          
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              activeTab === 'recommendations'
                ? 'text-white border-b-2 border-red-600'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Recommandés
          </button>
          
          <button
            onClick={() => setActiveTab('trending')}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              activeTab === 'trending'
                ? 'text-white border-b-2 border-red-600'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Tendances
          </button>
        </div>

        {/* Titre */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{getTabTitle()}</h2>
          <Link
            to={type === 'tv' ? '/series' : '/movies'}
            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors"
          >
            Voir tout <FaChevronRight className="text-sm" />
          </Link>
        </div>

        {/* Grid */}
        {currentItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {currentItems.map((item) => (
              <div
                key={item.id}
                className="group relative bg-gray-900 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105"
              >
                <Link to={`/watch/${type}/${item.id}${type === 'tv' ? '?season=1&episode=1' : ''}`}>
                  {/* Poster */}
                  <div className="aspect-[2/3] relative overflow-hidden">
                    <img
                      src={getImageUrl(item.poster_path, 'w500')}
                      alt={item.title || item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <FaPlay className="text-white text-xl ml-1" />
                      </div>
                    </div>

                    {/* Rating Badge */}
                    {item.vote_average > 0 && (
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
                        <span className="text-yellow-400 text-xs font-bold">
                          ★ {item.vote_average.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Add to List Button */}
                    <button
                      onClick={(e) => handleAddToList(item, e)}
                      className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/90"
                      title="Ajouter à ma liste"
                    >
                      <FaPlus className="text-white text-sm" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="font-bold text-sm mb-1 truncate">
                      {item.title || item.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
                      <span>
                        {type === 'tv' 
                          ? new Date(item.first_air_date).getFullYear()
                          : new Date(item.release_date).getFullYear()
                        }
                      </span>
                      
                      {item.genre_ids && item.genre_ids.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="truncate">
                            {/* Hier könnten Genre-Namen aus einer lokalen Map geholt werden */}
                            {type === 'tv' ? 'Série' : 'Film'}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Progress Bar für Continue Watching */}
                    {(() => {
                      const continueWatching = netflixFeatures.getContinueWatching();
                      const watchItem = continueWatching.find(w => w.id === item.id && w.media_type === type);
                      return watchItem && watchItem.progress > 0 && (
                        <div className="w-full bg-gray-600 h-1 rounded-full mt-2">
                          <div 
                            className="bg-red-600 h-full rounded-full"
                            style={{ width: `${Math.min(watchItem.progress, 100)}%` }}
                          />
                        </div>
                      );
                    })()}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              Aucune recommandation disponible pour le moment.
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-800 mt-16"></div>
      </div>
    </div>
  );
};

export default WatchPageRecommendations; 