import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authUser";
import axios from "axios";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import toast from "react-hot-toast";

const FavoritesList = ({ contentType = "movie" }) => {
  const { user, getToken } = useAuthStore();
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  // TMDB API configuration
  const TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYmE4ODA0YjA4NjAxYjExOGExZjFhZjZhMzgzNGI3NCIsInN1YiI6IjY0OWVmZmM0YzlkYmY5MDEwN2UxZTU0MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.EV_B46kJXwRaqfcfXunUdvSCCDyyRzkS13QBLwEgXK4'; 
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";
  const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        
        if (!user) {
          setFavoriteItems([]);
          setLoading(false);
          return;
        }
        
        const token = getToken();
        if (!token) {
          setFavoriteItems([]);
          setLoading(false);
          return;
        }

        // Get favorites from backend
        const { data } = await axios.get('/api/user/likes', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.likes?.length) {
          setFavoriteItems([]);
          setLoading(false);
          return;
        }

        // Filter by content type if specified
        const filteredItems = contentType === 'all' 
          ? data.likes 
          : data.likes.filter(item => item.type === contentType);
        
        // Only show the first 10 items at most
        const limitedItems = filteredItems.slice(0, 10);

        // Process favorite items with TMDB data
        const enhancedItems = await Promise.all(
          limitedItems.map(async (item) => {
            try {
              // Determine the correct endpoint based on media type
              const endpoint = item.type === 'tv' ? 'tv' : 'movie';
              
              // Fetch from TMDB with proper authorization header
              const response = await axios.get(
                `${TMDB_BASE_URL}/${endpoint}/${item.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${TMDB_API_KEY}`,
                    'Content-Type': 'application/json;charset=utf-8'
                  },
                  timeout: 5000
                }
              );

              const tmdbData = response.data;
              
              return {
                id: item.id,
                media_type: item.type || 'movie',
                title: tmdbData.title || tmdbData.name || item.title,
                poster_path: tmdbData.poster_path 
                  ? `${TMDB_IMAGE_BASE}${tmdbData.poster_path}`
                  : '/placeholder-poster.png',
                release_date: tmdbData.release_date || tmdbData.first_air_date
              };
            } catch (tmdbError) {
              console.error(`Failed to fetch TMDB data for ${item.type}/${item.id}:`, tmdbError);
              
              // Fallback to basic data if TMDB fails
              return {
                id: item.id,
                media_type: item.type || 'movie',
                title: item.title || `Item ${item.id}`,
                poster_path: '/placeholder-poster.png'
              };
            }
          })
        );

        setFavoriteItems(enhancedItems);
      } catch (err) {
        console.error("Favorites list error:", err);
        // Don't show errors in this component as it might be part of another page
        setFavoriteItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, getToken, contentType]);

  const handleRemoveFromFavorites = async (e, movieId) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const token = getToken();
      if (!token) {
        toast.error("Session expired. Please log in again.");
        return;
      }
      
      await axios.delete(`/api/user/likes/${movieId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFavoriteItems(prev => prev.filter(item => item.id !== movieId));
      toast.success("Removed from favorites");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to remove item');
    }
  };

  const scrollLeft = () => {
    if (sliderRef.current) sliderRef.current.scrollBy({ left: -sliderRef.current.offsetWidth / 2, behavior: "smooth" });
  };
  
  const scrollRight = () => {
    if (sliderRef.current) sliderRef.current.scrollBy({ left: sliderRef.current.offsetWidth / 2, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="py-4">
        <div className="flex space-x-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-36 flex-none">
              <div className="aspect-[2/3] bg-gray-800 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-800 rounded mt-2 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (favoriteItems.length === 0) {
    return (
      <div className="py-4">
        <div className="flex flex-col items-center justify-center p-6 bg-gray-900/50 rounded text-center">
          <Heart className="text-gray-600 mb-3 size-10" />
          <p className="text-gray-400">No favorites yet</p>
          <Link to="/" className="text-sm text-red-600 hover:text-red-500 mt-2">
            Discover new content to add
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 relative group">
      <div className="flex overflow-x-scroll scrollbar-hide gap-4 pb-4" ref={sliderRef}>
        {favoriteItems.map((item) => (
          <Link 
            key={`${item.id}-${item.media_type}`} 
            to={`/watch/${item.id}?type=${item.media_type}`}
            className="w-36 flex-none relative group/item"
          >
            <div className="aspect-[2/3] rounded overflow-hidden">
              <img
                src={item.poster_path}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-110"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder-poster.png";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity flex flex-col justify-end p-2">
                <button
                  onClick={(e) => handleRemoveFromFavorites(e, item.id)}
                  className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-full w-8 h-8 flex items-center justify-center self-end transition-colors"
                >
                  <Heart className="size-5 fill-white" />
                </button>
              </div>
            </div>
            <h4 className="mt-2 text-sm font-medium truncate">{item.title}</h4>
            {item.release_date && (
              <p className="text-xs text-gray-400">{item.release_date.substring(0, 4)}</p>
            )}
          </Link>
        ))}
      </div>
      
      {favoriteItems.length > 3 && (
        <>
          <ChevronRight
            className="absolute top-1/2 -translate-y-1/2 right-0 w-8 h-8
              opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer
              bg-red-600 text-white rounded-full p-1"
            onClick={scrollRight}
          />
          <ChevronLeft
            className="absolute top-1/2 -translate-y-1/2 left-0 w-8 h-8 opacity-0 
            group-hover:opacity-100 transition-all duration-300 cursor-pointer bg-red-600 
            text-white rounded-full p-1"
            onClick={scrollLeft}
          />
        </>
      )}
      
      <div className="mt-2 text-right">
        <Link to="/favorites" className="text-sm text-red-600 hover:text-red-500">
          View all favorites
        </Link>
      </div>
    </div>
  );
};

export default FavoritesList;