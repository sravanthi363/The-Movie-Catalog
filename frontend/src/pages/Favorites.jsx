import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authUser";
import { useNavigate } from "react-router-dom";
import { Loader, AlertCircle } from "lucide-react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const FavoritesPage = () => {
  const { user, getToken } = useAuthStore();
  const navigate = useNavigate();
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tmdbAvailable, setTmdbAvailable] = useState(true);

  // TMDB API configuration
  const TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYmE4ODA0YjA4NjAxYjExOGExZjFhZjZhMzgzNGI3NCIsInN1YiI6IjY0OWVmZmM0YzlkYmY5MDEwN2UxZTU0MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.EV_B46kJXwRaqfcfXunUdvSCCDyyRzkS13QBLwEgXK4'; 
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";
  const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const token = getToken();

        if (!user || !token) {
          toast.error("Please log in to view your favorites");
          navigate("/login");
          return;
        }

        // 1. First get user's favorites from backend
        const { data } = await axios.get('/api/user/likes', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!data.likes?.length) {
          setFavoriteItems([]);
          setLoading(false);
          return;
        }

        // 2. Process favorite items with TMDB data
        const enhancedItems = await Promise.all(
          data.likes.map(async (item) => {
            try {
              // Determine the correct endpoint based on media type
              const endpoint = item.type === 'tv' ? 'tv' : 'movie';
              
              // Fetch from TMDB with proper authorization header
              const response = await axios.get(
                `${TMDB_BASE_URL}/${endpoint}/${item.id}?append_to_response=videos,credits`,
                {
                  headers: {
                    Authorization: `Bearer ${TMDB_API_KEY}`,
                    'Content-Type': 'application/json;charset=utf-8'
                  },
                  timeout: 5000 // Increased timeout for better reliability
                }
              );

              const tmdbData = response.data;
              
              return {
                id: item.id,
                media_type: item.type || 'movie',
                title: tmdbData.title || tmdbData.name || item.title,
                overview: tmdbData.overview,
                poster_path: tmdbData.poster_path 
                  ? `${TMDB_IMAGE_BASE}${tmdbData.poster_path}`
                  : '/placeholder-poster.png',
                backdrop_path: tmdbData.backdrop_path 
                  ? `${TMDB_IMAGE_BASE}${tmdbData.backdrop_path}`
                  : null,
                release_date: tmdbData.release_date || tmdbData.first_air_date,
                vote_average: tmdbData.vote_average,
                created_at: item.created_at,
                // Additional useful fields
                runtime: tmdbData.runtime,
                genres: tmdbData.genres?.map(g => g.name) || []
              };
            } catch (tmdbError) {
              console.error(`Failed to fetch TMDB data for ${item.type}/${item.id}:`, tmdbError);
              
              // Log more detailed error information for debugging
              if (tmdbError.response) {
                console.error('TMDB Error Response:', {
                  status: tmdbError.response.status,
                  data: tmdbError.response.data
                });
              }
              
              // Fallback to basic data if TMDB fails
              return {
                id: item.id,
                media_type: item.type || 'movie',
                title: item.title || `Item ${item.id}`,
                poster_path: '/placeholder-poster.png',
                created_at: item.created_at
              };
            }
          })
        );

        setFavoriteItems(enhancedItems);
        setTmdbAvailable(enhancedItems.some(item => item.poster_path !== '/placeholder-poster.png'));
      } catch (err) {
        console.error("Favorites error:", err);
        setError(err.response?.data?.message || err.message || 'Failed to load favorites');
        if (err.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, navigate, getToken]);

  const handleRemoveFromFavorites = async (movieId) => {
    try {
      const token = getToken();
      if (!token) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin text-red-600 size-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
        
        {!tmdbAvailable && (
          <div className="bg-yellow-900/30 p-3 rounded mb-4 text-yellow-300">
            Showing basic favorites information (TMDB data unavailable)
          </div>
        )}
        
        {error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="text-red-500 size-16 mb-4" />
            <p className="text-lg text-gray-400">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : favoriteItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-xl mb-4">Your favorites list is empty</p>
            <p className="text-gray-400 mb-6">Add movies and TV shows that you love to your favorites.</p>
            <Link to="/" className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-medium transition-colors">
              Discover Content
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favoriteItems.map((item) => (
              <div key={`${item.id}-${item.media_type}`} className="relative group">
                <div className="aspect-[2/3] rounded overflow-hidden relative">
                  <Link to={`/watch/${item.id}?type=${item.media_type}`}>
                    <img
                      src={item.poster_path}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-poster.png";
                      }}
                    />
                  </Link>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <button
                      onClick={() => handleRemoveFromFavorites(item.id)}
                      className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                <div className="mt-2">
                  <h3 className="font-medium truncate">{item.title}</h3>
                  <p className="text-sm text-gray-400 capitalize">
                    {item.media_type} • {item.release_date?.substring(0,4) || 'N/A'}
                  </p>
                  {item.vote_average && (
                    <p className="text-xs text-yellow-400">
                      Rating: {item.vote_average.toFixed(1)}/10
                    </p>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {item.created_at && (
                      <p>Added: {new Date(item.created_at).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;