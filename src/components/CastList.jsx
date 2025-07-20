import { Link } from 'react-router-dom';
import { getProfileUrl } from '../services/tmdb';

const CastList = ({ cast, title = "Distribution", maxItems = 10 }) => {
  if (!cast || cast.length === 0) {
    return null;
  }

  const displayCast = cast.slice(0, maxItems);

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {displayCast.map((person) => (
          <Link
            key={person.id}
            to={`/person/${person.id}`}
            className="group block text-center"
          >
            <div className="mb-2">
              <img
                src={getProfileUrl(person.profile_path)}
                alt={person.name}
                className="w-full aspect-[2/3] object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  e.target.src = '/placeholder-profile.jpg';
                }}
              />
            </div>
            
            <div className="text-sm">
              <p className="font-semibold text-white group-hover:text-netflix-red transition-colors duration-200">
                {person.name}
              </p>
              {person.character && (
                <p className="text-gray-400 text-xs mt-1">
                  {person.character}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
      
      {cast.length > maxItems && (
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            Et {cast.length - maxItems} autres membres de la distribution...
          </p>
        </div>
      )}
    </div>
  );
};

export default CastList; 