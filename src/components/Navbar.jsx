import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaBars, FaTimes, FaBell } from 'react-icons/fa';
import { netflixFeatures } from '../services/tmdb';
import CountrySelector from './CountrySelector';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentProfile, setCurrentProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const profile = netflixFeatures.getCurrentProfile();
    setCurrentProfile(profile);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Séries', path: '/series' },
    { name: 'Films', path: '/movies' },
    { name: 'Nouveautés les plus regardées', path: '/new-and-popular' },
    { name: 'Ma liste', path: '/my-netflix' }
  ];

  const ProfileSelector = () => {
    const [profiles, setProfiles] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
      const allProfiles = netflixFeatures.getProfiles();
      setProfiles(allProfiles);
    }, []);

    const handleProfileChange = (profileId) => {
      netflixFeatures.setCurrentProfile(profileId);
      setCurrentProfile(netflixFeatures.getCurrentProfile());
      setShowDropdown(false);
      // Refresh page to update content based on new profile
      window.location.reload();
    };

    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 hover:text-gray-300 transition-colors duration-200"
        >
          <img
            src={currentProfile?.avatar || 'https://i.pravatar.cc/32?u=default'}
            alt={currentProfile?.name || 'Profil'}
            className="w-8 h-8 rounded"
          />
          <span className="hidden md:block text-sm">{currentProfile?.name}</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-[#141414] border border-gray-600 rounded-lg shadow-lg z-50">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleProfileChange(profile.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-[#2F2F2F] transition-colors duration-200 ${
                  currentProfile?.id === profile.id ? 'bg-[#2F2F2F]' : ''
                }`}
              >
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-6 h-6 rounded"
                />
                <span className="text-sm">{profile.name}</span>
                {currentProfile?.id === profile.id && (
                  <div className="ml-auto w-2 h-2 bg-red-600 rounded-full"></div>
                )}
              </button>
            ))}
            <div className="border-t border-gray-600 mt-2 pt-2">
              <Link
                to="/profiles"
                className="block px-4 py-2 text-sm hover:bg-[#2F2F2F] transition-colors duration-200"
                onClick={() => setShowDropdown(false)}
              >
                Gérer les profils
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-[#141414] shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
    }`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-red-600 text-2xl font-bold">CineVerse</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-white hover:text-gray-300 transition-colors duration-200 ${
                  location.pathname === link.path ? 'text-red-500 font-medium' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Search and Profile */}
          <div className="flex items-center space-x-4">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Titres, personnes, genres"
                  className="bg-transparent border border-gray-600 text-white px-4 py-2 pl-10 rounded-md focus:outline-none focus:border-red-500 w-64"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </form>

            {/* Mobile Search Button */}
            <button
              onClick={() => navigate('/search')}
              className="md:hidden text-white hover:text-gray-300 transition-colors duration-200"
            >
              <FaSearch className="text-xl" />
            </button>

            {/* Country Selector */}
            <div className="hidden md:block">
              <CountrySelector 
                className="w-40" 
                showLabel={false}
                showLanguageInfo={false}
              />
            </div>

            {/* Notifications */}
            <button className="text-white hover:text-gray-300 transition-colors duration-200">
              <FaBell className="text-xl" />
            </button>

            {/* Profile Selector */}
            <ProfileSelector />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white hover:text-gray-300 transition-colors duration-200"
            >
              {isMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-[#141414] border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 text-white hover:text-gray-300 hover:bg-[#2F2F2F] rounded-md transition-colors duration-200 ${
                    location.pathname === link.path ? 'text-red-500 bg-[#2F2F2F] font-medium' : ''
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="px-3 py-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full bg-[#2F2F2F] border border-gray-600 text-white px-4 py-2 pl-10 rounded-md focus:outline-none focus:border-red-500"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </form>
              
              {/* Mobile Country Selector */}
              <div className="px-3 py-2">
                <CountrySelector showLabel={true} />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 