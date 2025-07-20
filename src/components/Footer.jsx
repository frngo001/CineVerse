const Footer = () => {
  return (
    <footer className="bg-netflix-black border-t border-netflix-gray py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-6">
            <span className="text-netflix-red text-2xl font-bold">CineVerse</span>
          </div>
          
          <div className="text-gray-400 text-sm space-y-3 max-w-2xl mx-auto">
            <p className="text-base">
              Votre plateforme de streaming pour découvrir les meilleurs films et séries
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 text-xs">
              <span>Films en haute qualité</span>
              <span>•</span>
              <span>Séries populaires</span>
              <span>•</span>
              <span>Streaming illimité</span>
              <span>•</span>
              <span>Interface moderne</span>
            </div>
            
            <div className="text-xs text-gray-500 space-y-1 pt-4 border-t border-gray-700">
              <p>© {new Date().getFullYear()} CineVerse. Tous droits réservés.</p>
              <p>Plateforme de démonstration inspirée des meilleurs services de streaming</p>
              <p>Données fournies par The Movie Database (TMDb)</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 