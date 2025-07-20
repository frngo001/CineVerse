import { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const ReviewList = ({ reviews, title = "Avis des utilisateurs" }) => {
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  if (!reviews || reviews.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <p className="text-gray-400">Aucun avis disponible pour le moment.</p>
      </div>
    );
  }

  const toggleReview = (reviewId) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 300) => {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  const getRatingStars = (rating) => {
    const normalizedRating = rating / 2; // TMDb ratings are out of 10, we want out of 5
    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <FaStar
            key={index}
            className={`text-sm ${
              index < fullStars
                ? 'text-yellow-400'
                : index === fullStars && hasHalfStar
                ? 'text-yellow-400'
                : 'text-gray-600'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-400">{normalizedRating.toFixed(1)}/5</span>
      </div>
    );
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      
      <div className="space-y-6">
        {reviews.slice(0, 5).map((review) => {
          const isExpanded = expandedReviews.has(review.id);
          const needsTruncation = review.content && review.content.length > 300;
          
          return (
            <div key={review.id} className="bg-netflix-gray p-6 rounded-lg">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-white font-semibold mb-1">
                    {review.author || 'Utilisateur anonyme'}
                  </h4>
                  {review.author_details?.rating && (
                    <div className="mb-2">
                      {getRatingStars(review.author_details.rating)}
                    </div>
                  )}
                  <p className="text-gray-400 text-sm">
                    {formatDate(review.created_at)}
                  </p>
                </div>
              </div>
              
              {/* Review Content */}
              <div className="text-gray-200 leading-relaxed">
                <p>
                  {isExpanded || !needsTruncation
                    ? review.content
                    : truncateContent(review.content)
                  }
                </p>
                
                {needsTruncation && (
                  <button
                    onClick={() => toggleReview(review.id)}
                    className="text-netflix-red hover:text-red-400 text-sm mt-2 transition-colors duration-200"
                  >
                    {isExpanded ? 'Voir moins' : 'Voir plus'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {reviews.length > 5 && (
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            Affichage de 5 avis sur {reviews.length}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewList; 