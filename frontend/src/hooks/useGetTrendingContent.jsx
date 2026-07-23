import { useEffect, useState } from "react";
import { useContentStore } from "../store/content";
import axios from "axios";

const useGetTrendingContent = () => {
  const [trendingContent, setTrendingContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { contentType } = useContentStore();

  useEffect(() => {
    const getTrendingContent = async () => {
      setLoading(true);
      try {
        // Handle different content types with appropriate endpoints
        let endpoint;
        
        if (contentType === "watchlist" || contentType === "favorites") {
          // For user-specific content, we'll handle differently
          const token = localStorage.getItem('token');
          if (!token) {
            console.log("No token for user content");
            setTrendingContent([]);
            setLoading(false);
            return;
          }
          
          // Map to the correct endpoint
          endpoint = contentType === "watchlist" 
            ? "/api/user/watchlist" 
            : "/api/user/likes";
            
          const { data } = await axios.get(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          // Extract the right property based on content type
          const content = contentType === "watchlist" ? data.watchlist : data.likes;
          setTrendingContent(content || []);
        } else {
          // For regular content types (movie, tv)
          endpoint = `/api/v1/${contentType}/trending`;
          const res = await axios.get(endpoint);
          setTrendingContent(res.data.content);
        }
      } catch (err) {
        console.error(`Error fetching ${contentType} content:`, err);
        setError(err.message || `Failed to load ${contentType} content`);
        setTrendingContent([]);
      } finally {
        setLoading(false);
      }
    };

    getTrendingContent();
  }, [contentType]);

  return { trendingContent, loading, error };
};

export default useGetTrendingContent;