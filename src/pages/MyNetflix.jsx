import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { netflixFeatures, getImageUrl } from '../services/tmdb';
import { ContinueWatchingRemove, ContextualCallouts, MyListButton, RatingButtons } from '../components/NetflixFeatures';

const MyNetflix = () => {
  const [continueWatching, setContinueWatching] = useState([]);
  const [myList, setMyList] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    try {
      const profile = netflixFeatures.getCurrentProfile();
      const watchingList = netflixFeatures.getContinueWatching();
      const userList = netflixFeatures.getMyList();
      
      setCurrentProfile(profile);
      setContinueWatching(watchingList);
      setMyList(userList);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromContinueWatching = (id, mediaType) => {
    setContinueWatching(prev => prev.filter(item => !(item.id === id && item.media_type === mediaType)));
  };

  const formatProgress = (progress) => {
    if (progress === 0) return 'Pas encore commencé';
    if (progress >= 95) return 'Terminé';
    return `${Math.round(progress)}% terminé`;
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-white text-xl">Chargement de votre Netflix...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* Header */}
      <div className="px-4 md:px-8 lg:px-16 pt-20 pb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Mon Netflix
        </h1>
        <p className="text-gray-400 text-lg">
          Bienvenue, {currentProfile?.name}
        </p>
      </div>

      {/* Continue Watching Section */}
      {continueWatching.length > 0 && (
        <section className="px-4 md:px-8 lg:px-16 mb-12">
          <h2 className="text-2xl font-bold mb-6">Continuer à regarder</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {continueWatching.map((item) => (
              <div key={`${item.media_type}_${item.id}`} className="group relative">
                <div className="relative overflow-hidden rounded-md bg-gray-800">
                  <img
                    src={getImageUrl(item.poster_path, 'w500')}
                    alt={item.title || item.name}
                    className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                    <div className="w-full bg-gray-700 rounded-full h-1 mb-1">
                      <div 
                        className="bg-red-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress || 0}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-300">
                      {formatProgress(item.progress || 0)}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <ContinueWatchingRemove
                    item={item}
                    onRemove={handleRemoveFromContinueWatching}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Link
                      to={`/${item.media_type}/${item.id}`}
                      className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-md font-semibold hover:bg-gray-200 transition-colors"
                    >
                      <FaPlay className="text-sm" />
                      Reprendre
                    </Link>
                  </div>
                </div>

                <div className="mt-2">
                  <h3 className="font-medium text-sm line-clamp-2">
                    {item.title || item.name}
                  </h3>
                  <ContextualCallouts item={item} className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* My List Section */}
      {myList.length > 0 && (
        <section className="px-4 md:px-8 lg:px-16 mb-12">
          <h2 className="text-2xl font-bold mb-6">Ma liste</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {myList.map((item) => (
              <div key={`${item.media_type}_${item.id}`} className="group relative">
                <div className="relative overflow-hidden rounded-md bg-gray-800">
                  <img
                    src={getImageUrl(item.poster_path, 'w500')}
                    alt={item.title || item.name}
                    className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/${item.media_type}/${item.id}`}
                        className="flex items-center justify-center w-10 h-10 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
                        title="Lire"
                      >
                        <FaPlay className="text-sm ml-0.5" />
                      </Link>
                      <MyListButton item={item} />
                      <RatingButtons item={item} />
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <h3 className="font-medium text-sm line-clamp-2">
                    {item.title || item.name}
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                    {item.release_date || item.first_air_date 
                      ? new Date(item.release_date || item.first_air_date).getFullYear()
                      : ''
                    }
                  </p>
                  <ContextualCallouts item={item} className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty States */}
      {continueWatching.length === 0 && myList.length === 0 && (
        <div className="px-4 md:px-8 lg:px-16 text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Votre Netflix vous attend</h2>
          <p className="text-gray-400 mb-8">
            Commencez à regarder des films et séries pour voir vos recommandations personnalisées ici.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-semibold transition-colors"
          >
            <FaPlay className="text-sm" />
            Parcourir le catalogue
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <section className="px-4 md:px-8 lg:px-16 mb-12">
        <h2 className="text-2xl font-bold mb-6">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/search"
            className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <h3 className="font-semibold text-lg mb-2">Rechercher</h3>
            <p className="text-gray-400 text-sm">
              Trouvez vos films et séries préférés
            </p>
          </Link>
          
          <button
            onClick={() => {
              // Simulation de génération de recommandations
              window.location.href = '/?recommended=true';
            }}
            className="p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left"
          >
            <h3 className="font-semibold text-lg mb-2">Recommandations</h3>
            <p className="text-gray-400 text-sm">
              Découvrez de nouveaux contenus pour vous
            </p>
          </button>

          <div className="p-6 bg-gray-800 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Statistiques</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">En cours de visionnage:</span>
                <span>{continueWatching.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Dans ma liste:</span>
                <span>{myList.length}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MyNetflix; 