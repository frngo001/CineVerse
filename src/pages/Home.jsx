import React, { useState, useEffect } from 'react';
import HeroBanner from '../components/HeroBanner';
import SliderRow from '../components/SliderRow';
import Top10Row from '../components/Top10Row';
import { tmdbApi, netflixFeatures } from '../services/tmdb';
import { useCountry } from '../contexts/CountryContext';

const Home = () => {
  const { selectedCountry } = useCountry();
  const [loading, setLoading] = useState(true);
  const [heroMovie, setHeroMovie] = useState(null);
  const [continueWatching, setContinueWatching] = useState([]);
  const [myList, setMyList] = useState([]);
  const [allTrending, setAllTrending] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTv, setPopularTv] = useState([]);
  const [topRatedContent, setTopRatedContent] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [comedyContent, setComedyContent] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [top10Movies, setTop10Movies] = useState([]);
  const [top10Tv, setTop10Tv] = useState([]);

  useEffect(() => {
    loadData();
    // Refresh hero movie every 30 seconds
    const interval = setInterval(() => {
      refreshHeroMovie();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [selectedCountry]); // Reload when country changes

  // Listen for country changes
  useEffect(() => {
    const handleCountryChange = () => {
      loadData();
    };

    window.addEventListener('countryChanged', handleCountryChange);
    return () => window.removeEventListener('countryChanged', handleCountryChange);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load profile and Netflix features
      const profile = netflixFeatures.getCurrentProfile();
      const continueWatchingList = netflixFeatures.getContinueWatching();
      const userList = netflixFeatures.getMyList();
      
      setCurrentProfile(profile);
      setContinueWatching(continueWatchingList);
      setMyList(userList);

      // Load all content concurrently with multiple pages for variety
      const [
        trending,
        popularMoviesData,
        popularTvData,
        topRatedMoviesData,
        topRatedTvData,
        upcomingMovies,
        nowPlayingMovies,
        actionMoviesData,
        comedyMoviesData,
        comedyTvData,
        top10MoviesData,
        top10TvData
      ] = await Promise.all([
        tmdbApi.getTrendingAll('day'),
        tmdbApi.getPopularMovies(),
        tmdbApi.getPopularTv(),
        tmdbApi.getTopRatedMovies(),
        tmdbApi.getTopRatedTv(),
        tmdbApi.getUpcomingMovies(),
        tmdbApi.getNowPlayingMovies(),
        tmdbApi.discoverMovies({ with_genres: '28', sort_by: 'popularity.desc' }), // Action
        tmdbApi.discoverMovies({ with_genres: '35', sort_by: 'popularity.desc' }), // Comedy Movies
        tmdbApi.discoverTv({ with_genres: '35', sort_by: 'popularity.desc' }), // Comedy TV
        tmdbApi.getTop10Movies('day'),
        tmdbApi.getTop10Tv('day')
      ]);

      // Set all content
      setAllTrending(trending?.results || []);
      setPopularMovies(popularMoviesData?.results || []);
      setPopularTv(popularTvData?.results || []);
      
      // Mix top rated movies and TV shows
      const mixedTopRated = [...(topRatedMoviesData?.results || []), ...(topRatedTvData?.results || [])]
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 20);
      setTopRatedContent(mixedTopRated);

      // Mix upcoming and now playing for new releases
      const mixedNewReleases = [...(upcomingMovies?.results || []), ...(nowPlayingMovies?.results || [])]
        .sort((a, b) => new Date(b.release_date || b.first_air_date || '1970-01-01') - new Date(a.release_date || a.first_air_date || '1970-01-01'))
        .slice(0, 20);
      setNewReleases(mixedNewReleases);

      setActionMovies(actionMoviesData?.results || []);
      
      // Mix comedy movies and TV shows
      const mixedComedy = [...(comedyMoviesData?.results || []), ...(comedyTvData?.results || [])]
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 20);
      setComedyContent(mixedComedy);

      // Set Top 10 content with media_type
      const top10MoviesWithType = (top10MoviesData?.results || []).map(movie => ({
        ...movie,
        media_type: 'movie'
      }));
      const top10TvWithType = (top10TvData?.results || []).map(show => ({
        ...show,
        media_type: 'tv'
      }));
      
      setTop10Movies(top10MoviesWithType);
      setTop10Tv(top10TvWithType);

      // Set random hero movie from trending
      setRandomHeroMovie(trending?.results || []);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const setRandomHeroMovie = (movies) => {
    if (movies && movies.length > 0) {
      // Filter for high-quality content for hero
      const goodMovies = movies.filter(movie => 
        movie.vote_average >= 6.5 && 
        movie.backdrop_path && 
        movie.overview
      );
      
      if (goodMovies.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(10, goodMovies.length));
        setHeroMovie(goodMovies[randomIndex]);
      } else {
        const randomIndex = Math.floor(Math.random() * Math.min(5, movies.length));
        setHeroMovie(movies[randomIndex]);
      }
    }
  };

  const refreshHeroMovie = () => {
    if (allTrending.length > 0) {
      setRandomHeroMovie(allTrending);
    }
  };

  const handleContinueWatchingUpdate = () => {
    const updatedList = netflixFeatures.getContinueWatching();
    setContinueWatching(updatedList);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-white text-xl">Chargement de CineVerse...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#141414] min-h-screen">
      {/* Hero Banner with random movie */}
      {heroMovie && <HeroBanner movie={heroMovie} />}

      {/* Content Rows */}
      <div className="relative -mt-32 z-10 pb-20">
        {/* Continue Watching - Only show if there are items */}
        {continueWatching.length > 0 && (
          <SliderRow 
            title="Continuer à regarder"
            movies={continueWatching}
            showContinueWatchingFeatures={true}
            onUpdate={handleContinueWatchingUpdate}
            className="mb-8"
          />
        )}

        {/* My List - Only show if there are items */}
        {myList.length > 0 && (
          <SliderRow 
            title="Ma liste"
            movies={myList}
            className="mb-8"
          />
        )}

        {/* Top 10 Movies */}
        {top10Movies.length > 0 && (
          <Top10Row 
            title="Top 10 Films aujourd'hui"
            movies={top10Movies}
            className="mb-12"
          />
        )}

        {/* Top 10 TV Shows */}
        {top10Tv.length > 0 && (
          <Top10Row 
            title="Top 10 Séries aujourd'hui"
            movies={top10Tv}
            className="mb-12"
          />
        )}

        {/* Trending Now - Mix of all content */}
        {allTrending.length > 0 && (
          <SliderRow 
            title="Tendances actuelles"
            movies={allTrending}
            className="mb-8"
          />
        )}

        {/* Popular Movies */}
        {popularMovies.length > 0 && (
          <SliderRow 
            title="Films populaires"
            movies={popularMovies}
            className="mb-8"
          />
        )}

        {/* Popular TV Shows */}
        {popularTv.length > 0 && (
          <SliderRow 
            title="Séries populaires"
            movies={popularTv}
            className="mb-8"
          />
        )}

        {/* Top Rated Content - Mix of movies and TV shows */}
        {topRatedContent.length > 0 && (
          <SliderRow 
            title="Les mieux notés"
            movies={topRatedContent}
            className="mb-8"
          />
        )}

        {/* New Releases */}
        {newReleases.length > 0 && (
          <SliderRow 
            title="Nouveautés et sorties récentes"
            movies={newReleases}
            className="mb-8"
          />
        )}

        {/* Action Movies */}
        {actionMovies.length > 0 && (
          <SliderRow 
            title="Action et aventure"
            movies={actionMovies}
            className="mb-8"
          />
        )}

        {/* Comedy Content */}
        {comedyContent.length > 0 && (
          <SliderRow 
            title="Comédies"
            movies={comedyContent}
            className="mb-8"
          />
        )}

        {/* Personalized Recommendations */}
        {currentProfile && (popularMovies.length > 0 || popularTv.length > 0) && (
          <SliderRow 
            title={`Recommandé pour ${currentProfile.name}`}
            movies={[
              ...popularMovies.slice(5, 15), 
              ...popularTv.slice(5, 15),
              ...topRatedContent.slice(5, 15)
            ].sort(() => Math.random() - 0.5).slice(0, 20)}
            className="mb-8"
          />
        )}

        {/* Netflix-style "Because you watched" sections */}
        {continueWatching.length > 0 && (
          <SliderRow 
            title={`Parce que vous avez regardé "${continueWatching[0]?.title || continueWatching[0]?.name}"`}
            movies={[...popularMovies.slice(10, 20), ...popularTv.slice(10, 20)]}
            className="mb-8"
          />
        )}
      </div>

      {/* Random Hero Refresh Button */}
      <div className="fixed bottom-20 right-4 z-50">
        <button
          onClick={refreshHeroMovie}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-colors duration-200"
          title="Changer le film principal"
        >
          🎲
        </button>
      </div>

      {/* Welcome message for new users */}
      {continueWatching.length === 0 && myList.length === 0 && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <h3 className="font-bold mb-2">Bienvenue sur CineVerse!</h3>
          <p className="text-sm">
            Ajoutez des films à votre liste et commencez à regarder pour voir vos recommandations personnalisées.
          </p>
          <button 
            onClick={() => {
              document.querySelector('.fixed.bottom-4.right-4.bg-red-600').style.display = 'none';
            }}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
};

export default Home; 