import { useState } from 'react';
import { FaPlay } from 'react-icons/fa';
import { getImageUrl, tmdbApi } from '../services/tmdb';

const SeasonList = ({ seasons, tvId, onEpisodeSelect, activeSeason, activeEpisode }) => {
  const [selectedSeason, setSelectedSeason] = useState(activeSeason || null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter out season 0 (specials) and sort by season number
  const regularSeasons = seasons
    .filter(season => season.season_number > 0)
    .sort((a, b) => a.season_number - b.season_number);

  const handleSeasonClick = async (season) => {
    setSelectedSeason(season.season_number);
    setLoading(true);
    try {
      const seasonData = await tmdbApi.getTvSeason(tvId, season.season_number);
      setEpisodes(seasonData.episodes || []);
    } catch (e) {
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load: select first season if none selected
  if (!selectedSeason && regularSeasons.length > 0) {
    handleSeasonClick(regularSeasons[0]);
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 mb-8">
      {/* Staffel-Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {regularSeasons.map((season) => (
          <button
            key={season.id}
            onClick={() => handleSeasonClick(season)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200
              ${selectedSeason === season.season_number ? 'bg-[#e50914] text-white shadow' : 'bg-[#222] text-gray-200 hover:bg-[#333]'}`}
          >
            {season.name || `Season ${season.season_number}`}
          </button>
        ))}
      </div>
      {/* Episoden-Grid */}
      <div className="mb-4">
        <div className="text-white font-semibold mb-2">Episodes - Season {selectedSeason}</div>
        {loading ? (
          <div className="text-gray-400 py-8 text-center">Lade Episoden...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {episodes.map((ep) => (
              <button
                key={ep.id}
                onClick={() => onEpisodeSelect && onEpisodeSelect(selectedSeason, ep.episode_number, ep)}
                className={`rounded-lg px-0 py-2 font-bold text-lg border-2 transition-all duration-150
                  ${activeEpisode === ep.episode_number ? 'bg-[#e50914] text-white border-[#e50914]' : 'bg-[#181818] text-white border-[#333] hover:bg-[#333] hover:border-[#e50914]'}`}
                title={ep.name}
              >
                {ep.episode_number}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeasonList; 