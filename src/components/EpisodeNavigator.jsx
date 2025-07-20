import { useEffect, useState } from 'react';

const EpisodeNavigator = ({ tvId, seasons, selectedSeason, selectedEpisode, onChange, onServerChange }) => {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEpisodes = async () => {
      setLoading(true);
      try {
        const res = await import('../services/tmdb');
        const tmdbApi = res.tvApi || res.tmdbApi;
        const seasonData = await tmdbApi.getTvSeason(tvId, selectedSeason);
        setEpisodes(seasonData.episodes || []);
      } catch {
        setEpisodes([]);
      } finally {
        setLoading(false);
      }
    };
    if (tvId && selectedSeason) fetchEpisodes();
  }, [tvId, selectedSeason]);

  // Hilfsfunktionen für Vor/Zurück-Buttons
  const currentSeasonIndex = seasons.findIndex(s => s.season_number === selectedSeason);
  const currentEpisodeIndex = episodes.findIndex(e => e.episode_number === selectedEpisode);

  // Finde die letzte Episode der vorherigen Staffel
  const getPrevEpisode = () => {
    if (currentEpisodeIndex > 0) {
      return { season: selectedSeason, episode: episodes[currentEpisodeIndex - 1].episode_number };
    } else if (currentSeasonIndex > 0) {
      const prevSeason = seasons[currentSeasonIndex - 1];
      // Hole Episoden der vorherigen Staffel synchron (nur für Button-Status)
      return { season: prevSeason.season_number, episode: null };
    }
    return null;
  };

  // Finde die erste Episode der nächsten Staffel
  const getNextEpisode = () => {
    if (currentEpisodeIndex < episodes.length - 1) {
      return { season: selectedSeason, episode: episodes[currentEpisodeIndex + 1].episode_number };
    } else if (currentSeasonIndex < seasons.length - 1) {
      const nextSeason = seasons[currentSeasonIndex + 1];
      // Hole Episoden der nächsten Staffel synchron (nur für Button-Status)
      return { season: nextSeason.season_number, episode: null };
    }
    return null;
  };

  // Async-Handler für echte Navigation
  const handlePrev = async () => {
    if (currentEpisodeIndex > 0) {
      onChange(selectedSeason, episodes[currentEpisodeIndex - 1].episode_number);
    } else if (currentSeasonIndex > 0) {
      const prevSeason = seasons[currentSeasonIndex - 1];
      try {
        const res = await import('../services/tmdb');
        const tmdbApi = res.tvApi || res.tmdbApi;
        const seasonData = await tmdbApi.getTvSeason(tvId, prevSeason.season_number);
        const lastEp = seasonData.episodes[seasonData.episodes.length - 1];
        onChange(prevSeason.season_number, lastEp.episode_number);
      } catch {
        // Fehler ignorieren
      }
    }
  };

  const handleNext = async () => {
    if (currentEpisodeIndex < episodes.length - 1) {
      onChange(selectedSeason, episodes[currentEpisodeIndex + 1].episode_number);
    } else if (currentSeasonIndex < seasons.length - 1) {
      const nextSeason = seasons[currentSeasonIndex + 1];
      try {
        const res = await import('../services/tmdb');
        const tmdbApi = res.tvApi || res.tmdbApi;
        const seasonData = await tmdbApi.getTvSeason(tvId, nextSeason.season_number);
        const firstEp = seasonData.episodes[0];
        onChange(nextSeason.season_number, firstEp.episode_number);
      } catch {
        // Fehler ignorieren
      }
    }
  };

  // Button-Status korrekt setzen
  const prevAvailable = (() => {
    if (currentEpisodeIndex > 0) return true;
    if (currentSeasonIndex > 0) return true;
    return false;
  })();
  const nextAvailable = (() => {
    if (currentEpisodeIndex < episodes.length - 1) return true;
    if (currentSeasonIndex < seasons.length - 1) return true;
    return false;
  })();

  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4">
      {/* Server-Wechsel-Button */}
      {onServerChange && (
        <button
          onClick={onServerChange}
          className="px-4 py-2 bg-[#222] text-white rounded-lg font-bold hover:bg-[#e50914] transition-all mb-2 md:mb-0"
        >
          Changer de serveur
        </button>
      )}
      {/* Saison Dropdown */}
      <div>
        <label className="text-white font-semibold mr-2">Saison:</label>
        <select
          value={selectedSeason}
          onChange={e => onChange(Number(e.target.value), 1)}
          className="bg-[#181818] text-white px-4 py-2 rounded-lg border border-[#333] focus:outline-none focus:border-[#e50914]"
        >
          {seasons.map(season => (
            <option key={season.id} value={season.season_number}>
              {season.name || `Saison ${season.season_number}`}
            </option>
          ))}
        </select>
      </div>
      {/* Episode Dropdown */}
      <div>
        <label className="text-white font-semibold mr-2">Épisode:</label>
        <select
          value={selectedEpisode}
          onChange={e => onChange(selectedSeason, Number(e.target.value))}
          className="bg-[#181818] text-white px-4 py-2 rounded-lg border border-[#333] focus:outline-none focus:border-[#e50914]"
        >
          {episodes.map(ep => (
            <option key={ep.id} value={ep.episode_number}>
              {ep.episode_number} - {ep.name}
            </option>
          ))}
        </select>
      </div>
      {/* Vor/Zurück-Buttons */}
      <div className="flex gap-2 mt-2 md:mt-0">
        <button
          onClick={handlePrev}
          disabled={!prevAvailable}
          className="px-4 py-2 rounded-lg font-bold bg-[#222] text-white border border-[#333] hover:bg-[#333] disabled:opacity-50"
        >
          Précédent
        </button>
        <button
          onClick={handleNext}
          disabled={!nextAvailable}
          className="px-4 py-2 rounded-lg font-bold bg-[#e50914] text-white border border-[#e50914] hover:bg-[#b0060f] disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default EpisodeNavigator; 