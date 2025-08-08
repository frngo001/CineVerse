import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { tmdbApi, getProfileUrl } from '../services/tmdb';
import MovieCard from '../components/MovieCard';

const PersonDetails = () => {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [movieCredits, setMovieCredits] = useState(null);
  const [tvCredits, setTvCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('movies');

  useEffect(() => {
    if (id) {
      fetchPersonDetails();
      window.scrollTo(0, 0);
    }
  }, [id]);

  const fetchPersonDetails = async () => {
    try {
      setLoading(true);
      
      const [
        personResponse,
        movieCreditsResponse,
        tvCreditsResponse
      ] = await Promise.all([
        tmdbApi.getPersonDetails(id),
        tmdbApi.getPersonMovieCredits(id),
        tmdbApi.getPersonTvCredits(id)
      ]);

      setPerson(personResponse);
      setMovieCredits(movieCreditsResponse);
      setTvCredits(tvCreditsResponse);
    } catch (error) {
      console.error('Error fetching person details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate, deathDate = null) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();
    const age = Math.floor((end - birth) / (365.25 * 24 * 60 * 60 * 1000));
    return age;
  };

  const sortCreditsByPopularity = (credits) => {
    return credits
      .filter(credit => credit.poster_path) // Only show items with posters
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 20); // Limit to 20 most popular items
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-netflix-black">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="h-8 bg-netflix-gray rounded animate-pulse" />
            <div className="h-4 bg-netflix-gray rounded animate-pulse w-3/4" />
            <div className="h-4 bg-netflix-gray rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="pt-16 min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Personne introuvable</h1>
          <Link to="/" className="text-netflix-red hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const movieCreditsToShow = movieCredits ? sortCreditsByPopularity(movieCredits.cast) : [];
  const tvCreditsToShow = tvCredits ? sortCreditsByPopularity(tvCredits.cast) : [];

  return (
    <div className="pt-16 min-h-screen bg-netflix-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:space-x-8 mb-8">
          {/* Profile Image */}
          <div className="flex-none mb-6 lg:mb-0">
            <img
              src={getProfileUrl(person.profile_path, 'w342')}
              alt={person.name}
              className="w-64 mx-auto lg:mx-0 rounded-lg shadow-2xl"
              onError={(e) => {
                e.target.src = '/placeholder-profile.jpg';
              }}
            />
          </div>
          
          {/* Person Info */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {person.name}
            </h1>
            
            {/* Basic Info */}
            <div className="space-y-4 mb-6">
              {person.known_for_department && (
                <div className="flex items-center space-x-2">
                  <span className="text-netflix-red font-semibold">Métier principal:</span>
                  <span className="text-gray-300">{person.known_for_department}</span>
                </div>
              )}
              
              {person.birthday && (
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-netflix-red" />
                  <span className="text-gray-300">
                    Né{person.gender === 1 ? 'e' : ''} le {formatDate(person.birthday)}
                    {calculateAge(person.birthday, person.deathday) && (
                      <span className="ml-2">
                        ({calculateAge(person.birthday, person.deathday)} ans{person.deathday ? ' au moment du décès' : ''})
                      </span>
                    )}
                  </span>
                </div>
              )}
              
              {person.deathday && (
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-netflix-red" />
                  <span className="text-gray-300">
                    Décédé{person.gender === 1 ? 'e' : ''} le {formatDate(person.deathday)}
                  </span>
                </div>
              )}
              
              {person.place_of_birth && (
                <div className="flex items-center space-x-2">
                  <FaMapMarkerAlt className="text-netflix-red" />
                  <span className="text-gray-300">{person.place_of_birth}</span>
                </div>
              )}
            </div>

            {/* Biography */}
            {person.biography && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">Biographie</h2>
                <div className="text-gray-200 leading-relaxed space-y-4">
                  {person.biography.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Credits Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-8 mb-6">
            <h2 className="text-2xl font-bold text-white">Filmographie</h2>
            
            {/* Tab Navigation */}
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('movies')}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  activeTab === 'movies'
                    ? 'bg-netflix-red text-white'
                    : 'bg-netflix-gray text-gray-300 hover:text-white'
                }`}
              >
                Films ({movieCreditsToShow.length})
              </button>
              <button
                onClick={() => setActiveTab('tv')}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  activeTab === 'tv'
                    ? 'bg-netflix-red text-white'
                    : 'bg-netflix-gray text-gray-300 hover:text-white'
                }`}
              >
                Séries ({tvCreditsToShow.length})
              </button>
            </div>
          </div>

          {/* Credits Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 mb-8 px-4">
            {activeTab === 'movies' ? (
              movieCreditsToShow.length > 0 ? (
                movieCreditsToShow.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} type="movie" className="transform hover:scale-105 transition-transform duration-200" />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-400">Aucun film trouvé</p>
                </div>
              )
            ) : (
              tvCreditsToShow.length > 0 ? (
                tvCreditsToShow.map((tvShow) => (
                  <MovieCard key={tvShow.id} movie={tvShow} type="tv" className="transform hover:scale-105 transition-transform duration-200" />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-400">Aucune série trouvée</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetails; 