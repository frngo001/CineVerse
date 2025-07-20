import { Link } from 'react-router-dom';
import { getProfileUrl } from '../services/tmdb';

const PersonCard = ({ person }) => {
  if (!person) return null;

  return (
    <Link to={`/person/${person.id}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-netflix-gray card-hover">
        {/* Profile Image */}
        <div className="aspect-[2/3] w-full">
          <img
            src={getProfileUrl(person.profile_path)}
            alt={person.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.target.src = '/placeholder-profile.jpg';
            }}
          />
        </div>
        
        {/* Overlay with info - appears on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-80 transition-all duration-300 flex items-end">
          <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full">
            <h3 className="font-semibold text-sm mb-1">
              {person.name}
            </h3>
            {person.known_for_department && (
              <p className="text-xs text-gray-300 mb-2">
                {person.known_for_department}
              </p>
            )}
            {person.known_for && person.known_for.length > 0 && (
              <p className="text-xs text-gray-400">
                Connu pour: {person.known_for.slice(0, 2).map(item => item.title || item.name).join(', ')}
              </p>
            )}
          </div>
        </div>
        
        {/* Department badge */}
        {person.known_for_department && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs font-semibold">
            <span className="text-white">{person.known_for_department}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default PersonCard; 