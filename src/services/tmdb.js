import axios from 'axios';

// TMDb API Base Configuration
const BASE_URL = 'https://api.themoviedb.org/3';
const API_TOKEN = import.meta.env.VITE_TMDB_API_KEY;
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// API Token validation
if (!API_TOKEN || API_TOKEN === 'your_bearer_token_here') {
  console.error('❌ TMDb API Token nicht konfiguriert!');
  console.log('📝 Bitte erstellen Sie einen Account auf https://www.themoviedb.org');
  console.log('🔑 Gehen Sie zu: Account Settings > API > Create > API Read Access Token');
  console.log('💾 Tragen Sie den Token in die .env Datei ein: VITE_TMDB_API_KEY=ihr_token_hier');
}

// Create axios instance with default config
export const tmdbApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
  },
  params: {
    language: 'fr-FR',
    region: 'FR', // Frankreich als Standardregion
  },
});

// Image URL helper functions
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return '/placeholder-image.jpg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (path, size = 'w1280') => {
  if (!path) return '/placeholder-backdrop.jpg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getProfileUrl = (path, size = 'w185') => {
  if (!path) return '/placeholder-profile.jpg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

// Funktion zum Aktualisieren der Standard-Region
export const updateDefaultRegion = (region) => {
  tmdbApi.defaults.params.region = region;
};

// Funktion zum Aktualisieren der Standard-Sprache
export const updateDefaultLanguage = (language) => {
  tmdbApi.defaults.params.language = language;
  console.log(`🗣️ API Sprache geändert zu: ${language}`);
};

// Movie API Service
export const movieApi = {
  getDetails: async (movieId) => {
    const response = await tmdbApi.get(`/movie/${movieId}`);
    return response.data;
  },
  getPopular: async (page = 1, region = null) => {
    const params = { page };
    if (region) params.region = region;
    const response = await tmdbApi.get('/movie/popular', { params });
    return response.data;
  },
  getTopRated: async (page = 1, region = null) => {
    const params = { page };
    if (region) params.region = region;
    const response = await tmdbApi.get('/movie/top_rated', { params });
    return response.data;
  },
  getUpcoming: async (page = 1, region = null) => {
    const params = { page };
    if (region) params.region = region;
    const response = await tmdbApi.get('/movie/upcoming', { params });
    return response.data;
  },
  getNowPlaying: async (page = 1, region = null) => {
    const params = { page };
    if (region) params.region = region;
    const response = await tmdbApi.get('/movie/now_playing', { params });
    return response.data;
  },
  getCredits: async (movieId) => {
    const response = await tmdbApi.get(`/movie/${movieId}/credits`);
    return response.data;
  },
  getVideos: async (movieId) => {
    const response = await tmdbApi.get(`/movie/${movieId}/videos`);
    return response.data;
  },
  getReviews: async (movieId, page = 1) => {
    const response = await tmdbApi.get(`/movie/${movieId}/reviews`, { params: { page } });
    return response.data;
  },
  getSimilar: async (movieId, page = 1) => {
    const response = await tmdbApi.get(`/movie/${movieId}/similar`, { params: { page } });
    return response.data;
  },
  getRecommendations: async (movieId, page = 1) => {
    const response = await tmdbApi.get(`/movie/${movieId}/recommendations`, { params: { page } });
    return response.data;
  },
  getGenres: async () => {
    const response = await tmdbApi.get('/genre/movie/list');
    return response.data;
  },
  search: async (query, page = 1) => {
    const response = await tmdbApi.get('/search/movie', { params: { query, page } });
    return response.data;
  },
};

// TV Show API Service
export const tvApi = {
  getDetails: async (tvId) => {
    const response = await tmdbApi.get(`/tv/${tvId}`);
    return response.data;
  },
  getSeason: async (tvId, seasonNumber) => {
    const response = await tmdbApi.get(`/tv/${tvId}/season/${seasonNumber}`);
    return response.data;
  },
  getPopular: async (page = 1) => {
    const response = await tmdbApi.get('/tv/popular', { params: { page } });
    return response.data;
  },
  getTopRated: async (page = 1) => {
    const response = await tmdbApi.get('/tv/top_rated', { params: { page } });
    return response.data;
  },
  getOnTheAir: async (page = 1) => {
    const response = await tmdbApi.get('/tv/on_the_air', { params: { page } });
    return response.data;
  },
  getAiringToday: async (page = 1) => {
    const response = await tmdbApi.get('/tv/airing_today', { params: { page } });
    return response.data;
  },
  getCredits: async (tvId) => {
    const response = await tmdbApi.get(`/tv/${tvId}/credits`);
    return response.data;
  },
  getVideos: async (tvId) => {
    const response = await tmdbApi.get(`/tv/${tvId}/videos`);
    return response.data;
  },
  getReviews: async (tvId, page = 1) => {
    const response = await tmdbApi.get(`/tv/${tvId}/reviews`, { params: { page } });
    return response.data;
  },
  getSimilar: async (tvId, page = 1) => {
    const response = await tmdbApi.get(`/tv/${tvId}/similar`, { params: { page } });
    return response.data;
  },
  getRecommendations: async (tvId, page = 1) => {
    const response = await tmdbApi.get(`/tv/${tvId}/recommendations`, { params: { page } });
    return response.data;
  },
  getGenres: async () => {
    const response = await tmdbApi.get('/genre/tv/list');
    return response.data;
  },
  search: async (query, page = 1) => {
    const response = await tmdbApi.get('/search/tv', { params: { query, page } });
    return response.data;
  },
};

// Search API Service - Bundles all search functionality
export const searchApi = {
  searchMovies: async (query, page = 1) => {
    const response = await tmdbApi.get('/search/movie', { params: { query, page } });
    return { data: response.data };
  },
  searchTv: async (query, page = 1) => {
    const response = await tmdbApi.get('/search/tv', { params: { query, page } });
    return { data: response.data };
  },
  searchPeople: async (query, page = 1) => {
    const response = await tmdbApi.get('/search/person', { params: { query, page } });
    return { data: response.data };
  },
  searchMulti: async (query, page = 1) => {
    const response = await tmdbApi.get('/search/multi', { params: { query, page } });
    return { data: response.data };
  },
  
  // Backwards compatibility - keep old method names too
  movies: async (query, page = 1) => {
    const response = await tmdbApi.get('/search/movie', { params: { query, page } });
    return response.data;
  },
  tv: async (query, page = 1) => {
    const response = await tmdbApi.get('/search/tv', { params: { query, page } });
    return response.data;
  },
  people: async (query, page = 1) => {
    const response = await tmdbApi.get('/search/person', { params: { query, page } });
    return response.data;
  },
  multi: async (query, page = 1) => {
    const response = await tmdbApi.get('/search/multi', { params: { query, page } });
    return response.data;
  },
};

// General API (Trending, Search Multi, etc.)
export const generalApi = {
  getTrendingMovies: async (timeWindow = 'day') => {
    const response = await tmdbApi.get(`/trending/movie/${timeWindow}`);
    return response.data;
  },
  getTrendingTv: async (timeWindow = 'day') => {
    const response = await tmdbApi.get(`/trending/tv/${timeWindow}`);
    return response.data;
  },
  getTrendingAll: async (timeWindow = 'day') => {
    const response = await tmdbApi.get(`/trending/all/${timeWindow}`);
    return response.data;
  },
  searchMulti: async (query, page = 1) => {
    const response = await tmdbApi.get('/search/multi', { params: { query, page } });
    return response.data;
  },
};

// Person API Service
export const personApi = {
  getDetails: async (personId) => {
    const response = await tmdbApi.get(`/person/${personId}`);
    return response.data;
  },
  getMovieCredits: async (personId) => {
    const response = await tmdbApi.get(`/person/${personId}/movie_credits`);
    return response.data;
  },
  getTvCredits: async (personId) => {
    const response = await tmdbApi.get(`/person/${personId}/tv_credits`);
    return response.data;
  },
  search: async (query, page = 1) => {
    const response = await tmdbApi.get('/search/person', { params: { query, page } });
    return response.data;
  },
};

// Global configuration and utility exports
export const configurationApi = {
  getConfiguration: async () => {
    const response = await tmdbApi.get('/configuration');
    return response.data;
  },
  getCountries: async () => {
    const response = await tmdbApi.get('/configuration/countries');
    return response.data;
  },
  getLanguages: async () => {
    const response = await tmdbApi.get('/configuration/languages');
    return response.data;
  },
  getTimezones: async () => {
    const response = await tmdbApi.get('/configuration/timezones');
    return response.data;
  },
};

export const certificationApi = {
  getMovieCertifications: async () => {
    const response = await tmdbApi.get('/certification/movie/list');
    return response.data;
  },
  getTvCertifications: async () => {
    const response = await tmdbApi.get('/certification/tv/list');
    return response.data;
  },
};

export const watchProviderApi = {
  getRegions: async () => {
    const response = await tmdbApi.get('/watch/providers/regions');
    return response.data;
  },
  getMovieProviders: async (movieId) => {
    const response = await tmdbApi.get(`/movie/${movieId}/watch/providers`);
    return response.data;
  },
  getTvProviders: async (tvId) => {
    const response = await tmdbApi.get(`/tv/${tvId}/watch/providers`);
    return response.data;
  },
};

// Netflix-style lokale Storage Funktionen
export const netflixFeatures = {
  // My List Management
  addToMyList: (item) => {
    const myList = JSON.parse(localStorage.getItem('netflix_my_list') || '[]');
    const exists = myList.find(listItem => listItem.id === item.id && listItem.media_type === item.media_type);
    if (!exists) {
      myList.push({
        ...item,
        added_date: new Date().toISOString(),
        media_type: item.media_type || 'movie'
      });
      localStorage.setItem('netflix_my_list', JSON.stringify(myList));
    }
  },

  removeFromMyList: (id, media_type = 'movie') => {
    const myList = JSON.parse(localStorage.getItem('netflix_my_list') || '[]');
    const filtered = myList.filter(item => !(item.id === id && item.media_type === media_type));
    localStorage.setItem('netflix_my_list', JSON.stringify(filtered));
  },

  getMyList: () => {
    return JSON.parse(localStorage.getItem('netflix_my_list') || '[]');
  },

  isInMyList: (id, media_type = 'movie') => {
    const myList = JSON.parse(localStorage.getItem('netflix_my_list') || '[]');
    return myList.some(item => item.id === id && item.media_type === media_type);
  },

  // Continue Watching Management
  addToContinueWatching: (item, progress = 0) => {
    const continueWatching = JSON.parse(localStorage.getItem('netflix_continue_watching') || '[]');
    const existingIndex = continueWatching.findIndex(watchItem => 
      watchItem.id === item.id && watchItem.media_type === item.media_type
    );
    
    const watchItem = {
      ...item,
      progress,
      last_watched: new Date().toISOString(),
      media_type: item.media_type || 'movie'
    };

    if (existingIndex >= 0) {
      continueWatching[existingIndex] = watchItem;
    } else {
      continueWatching.unshift(watchItem);
    }

    // Limitiere auf 20 Items
    if (continueWatching.length > 20) {
      continueWatching.splice(20);
    }

    localStorage.setItem('netflix_continue_watching', JSON.stringify(continueWatching));
  },

  removeFromContinueWatching: (id, media_type = 'movie') => {
    const continueWatching = JSON.parse(localStorage.getItem('netflix_continue_watching') || '[]');
    const filtered = continueWatching.filter(item => !(item.id === id && item.media_type === media_type));
    localStorage.setItem('netflix_continue_watching', JSON.stringify(filtered));
  },

  getContinueWatching: () => {
    return JSON.parse(localStorage.getItem('netflix_continue_watching') || '[]');
  },

  // Rating System (Thumbs Up/Down)
  setRating: (id, media_type, rating) => {
    const ratings = JSON.parse(localStorage.getItem('netflix_ratings') || '{}');
    const key = `${media_type}_${id}`;
    ratings[key] = {
      rating, // 'up' oder 'down'
      date: new Date().toISOString()
    };
    localStorage.setItem('netflix_ratings', JSON.stringify(ratings));
  },

  getRating: (id, media_type) => {
    const ratings = JSON.parse(localStorage.getItem('netflix_ratings') || '{}');
    const key = `${media_type}_${id}`;
    return ratings[key]?.rating || null;
  },

  // Profile Management
  createProfile: (name, isKids = false, avatar = null) => {
    const profiles = JSON.parse(localStorage.getItem('netflix_profiles') || '[]');
    const newProfile = {
      id: Date.now().toString(),
      name,
      isKids,
      avatar: avatar || `https://i.pravatar.cc/150?u=${name}`,
      created_date: new Date().toISOString(),
      settings: {
        language: 'fr-FR',
        maturity_rating: isKids ? 'kids' : 'all',
        autoplay: true
      }
    };
    
    if (profiles.length < 5) {
      profiles.push(newProfile);
      localStorage.setItem('netflix_profiles', JSON.stringify(profiles));
      return newProfile;
    }
    return null;
  },

  getProfiles: () => {
    const profiles = JSON.parse(localStorage.getItem('netflix_profiles') || '[]');
    // Erstelle Standard-Profil falls keines existiert
    if (profiles.length === 0) {
      const defaultProfile = {
        id: 'main',
        name: 'Profil Principal',
        isKids: false,
        avatar: 'https://i.pravatar.cc/150?u=main',
        created_date: new Date().toISOString(),
        settings: {
          language: 'fr-FR',
          maturity_rating: 'all',
          autoplay: true
        }
      };
      profiles.push(defaultProfile);
      localStorage.setItem('netflix_profiles', JSON.stringify(profiles));
    }
    return profiles;
  },

  getCurrentProfile: () => {
    const currentProfileId = localStorage.getItem('netflix_current_profile') || 'main';
    const profiles = netflixFeatures.getProfiles();
    return profiles.find(p => p.id === currentProfileId) || profiles[0];
  },

  setCurrentProfile: (profileId) => {
    localStorage.setItem('netflix_current_profile', profileId);
  },

  // Region/Country preference
  setRegion: (region) => {
    localStorage.setItem('netflix_region', region);
    // Update axios default region immediately
    if (typeof updateDefaultRegion === 'function') {
      updateDefaultRegion(region);
    }
  },

  getRegion: () => {
    return localStorage.getItem('netflix_region') || 'FR'; // Default to France
  },

  // Contextual Call-outs (wie "Emmy Winner", "Trending" etc.)
  getContextualCallouts: (item) => {
    const callouts = [];
    
    if (item.vote_average >= 8.0) callouts.push('Très bien noté');
    if (item.popularity > 100) callouts.push('Tendance');
    if (item.vote_count > 5000) callouts.push('Très regardé');
    if (item.release_date && new Date(item.release_date) > new Date('2023-01-01')) callouts.push('Nouveau');
    if (item.original_language !== 'en') callouts.push('International');
    
    // Simuliere Award-Status für hochbewertete Inhalte
    if (item.vote_average >= 8.5 && item.vote_count > 1000) {
      callouts.push('Primé');
    }
    
    return callouts.slice(0, 2); // Max 2 Call-outs
  },

  // Skip Intro Simulation
  hasIntro: (id, media_type) => {
    // Simuliere dass 60% der Inhalte ein Intro haben
    return Math.random() > 0.4;
  },

  getIntroLength: (id, media_type) => {
    // Zufällige Intro-Länge zwischen 30-90 Sekunden
    return Math.floor(Math.random() * 60) + 30;
  }
};

// Add all API methods directly to tmdbApi for backwards compatibility
Object.assign(tmdbApi, {
  // Movie methods
  getMovieDetails: movieApi.getDetails,
  getPopularMovies: movieApi.getPopular,
  getTopRatedMovies: movieApi.getTopRated,
  getUpcomingMovies: movieApi.getUpcoming,
  getNowPlayingMovies: movieApi.getNowPlaying,
  getMovieCredits: movieApi.getCredits,
  getMovieVideos: movieApi.getVideos,
  getMovieReviews: movieApi.getReviews,
  getSimilarMovies: movieApi.getSimilar,
  getMovieRecommendations: movieApi.getRecommendations,
  getMovieGenres: movieApi.getGenres,
  searchMovies: movieApi.search,

  // TV methods
  getTvDetails: tvApi.getDetails,
  getTvSeason: tvApi.getSeason,
  getPopularTv: tvApi.getPopular,
  getTopRatedTv: tvApi.getTopRated,
  getOnTheAirTv: tvApi.getOnTheAir,
  getAiringTodayTv: tvApi.getAiringToday,
  getTvCredits: tvApi.getCredits,
  getTvVideos: tvApi.getVideos,
  getTvReviews: tvApi.getReviews,
  getSimilarTv: tvApi.getSimilar,
  getTvRecommendations: tvApi.getRecommendations,
  getTvGenres: tvApi.getGenres,
  searchTv: tvApi.search,

  // General methods
  getTrendingMovies: generalApi.getTrendingMovies,
  getTrendingTv: generalApi.getTrendingTv,
  getTrendingAll: generalApi.getTrendingAll,
  searchMulti: generalApi.searchMulti,

  // Person methods
  getPersonDetails: personApi.getDetails,
  getPersonMovieCredits: personApi.getMovieCredits,
  getPersonTvCredits: personApi.getTvCredits,
  searchPeople: personApi.search,

  // Configuration methods
  getConfiguration: configurationApi.getConfiguration,
  getCountries: configurationApi.getCountries,
  getLanguages: configurationApi.getLanguages,
  getTimezones: configurationApi.getTimezones,

  // Certification methods
  getMovieCertifications: certificationApi.getMovieCertifications,
  getTvCertifications: certificationApi.getTvCertifications,

  // Watch provider methods
  getWatchProviderRegions: watchProviderApi.getRegions,
  getMovieWatchProviders: watchProviderApi.getMovieProviders,
  getTvWatchProviders: watchProviderApi.getTvProviders,

  // Additional methods for discover and other functionality
  discoverMovies: async (params = {}) => {
    const response = await tmdbApi.get('/discover/movie', { params });
    return response.data;
  },

  discoverTv: async (params = {}) => {
    const response = await tmdbApi.get('/discover/tv', { params });
    return response.data;
  },

  getTop10Movies: async (timeWindow = 'day') => {
    const response = await tmdbApi.get(`/trending/movie/${timeWindow}`);
    return response.data;
  },

  getTop10Tv: async (timeWindow = 'day') => {
    const response = await tmdbApi.get(`/trending/tv/${timeWindow}`);
    return response.data;
  },

  getReleaseDates: async (movieId) => {
    const response = await tmdbApi.get(`/movie/${movieId}/release_dates`);
    return response.data;
  },

  getTrendingWithFilters: async (params = {}) => {
    const { timeWindow = 'day', mediaType = 'all', ...otherParams } = params;
    const response = await tmdbApi.get(`/trending/${mediaType}/${timeWindow}`, { params: otherParams });
    return response.data;
  },
});

// Error interceptor
tmdbApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('TMDb API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.error('🔑 Ungültiger API-Schlüssel! Bitte überprüfen Sie Ihren VITE_TMDB_API_KEY in der .env Datei.');
    }
    return Promise.reject(error);
  }
);

export default tmdbApi;