import { Link } from 'react-router-dom';
import { FaHome, FaSearch } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="pt-16 min-h-screen bg-netflix-black flex items-center justify-center">
      <div className="text-center px-4">
        {/* 404 Logo */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold text-netflix-red mb-4">404</h1>
          <div className="w-32 h-1 bg-netflix-red mx-auto"></div>
        </div>
        
        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Page introuvable
          </h2>
          <p className="text-gray-400 text-lg max-w-md mx-auto mb-6">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center space-x-2 bg-netflix-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200"
          >
            <FaHome />
            <span>Retour à l'accueil</span>
          </Link>
          
          <Link
            to="/search"
            className="flex items-center justify-center space-x-2 bg-netflix-gray text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors duration-200"
          >
            <FaSearch />
            <span>Rechercher du contenu</span>
          </Link>
        </div>
        
        {/* Additional Help */}
        <div className="mt-12 text-gray-500 text-sm">
          <p>Si vous pensez qu'il s'agit d'une erreur, veuillez nous contacter.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 