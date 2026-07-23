// store/userContent.js
import axios from "axios";
import toast from "react-hot-toast";
import { create } from "zustand";
import { useAuthStore } from "./authUser";

export const useUserContentStore = create((set, get) => ({
  watchlist: [],
  favorites: [],
  isLoading: false,
  error: null,

  // Modify the token retrieval in fetchWatchlist and other functions
  fetchWatchlist: async () => {
    console.log("Fetching watchlist...");
    set({ isLoading: true, error: null });
    try {
      // Get token directly from localStorage instead of a getToken function
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const { data } = await axios.get(`/api/user/watchlist`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("Watchlist data:", data);
      set({ watchlist: data.watchlist || [], isLoading: false });
    } catch (error) {
      console.error("Watchlist error:", error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch watchlist', 
        isLoading: false 
      });
      toast.error('Failed to fetch watchlist');
    }
  },

  fetchFavorites: async () => {
    set({ isLoading: true, error: null });
    
    // First check authentication 
    const token = useAuthStore.getState().getToken();
    if (!token) {
      set({ 
        error: "No authentication token found. Please log in.", 
        isLoading: false,
        favorites: []
      });
      return; // Don't show error toast - let the UI handle this
    }
    
    try {
      const { data } = await axios.get(`/api/user/likes`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      set({ favorites: data.likes || [], isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch favorites', 
        isLoading: false,
        favorites: []
      });
      toast.error('Failed to fetch favorites');
    }
  },

  addToWatchlist: async (movieId, mediaType) => {
    // First check authentication 
    const token = useAuthStore.getState().getToken();
    if (!token) {
      toast.error("Please log in to add to your watchlist");
      return false;
    }
    
    try {
      await axios.post(`/api/user/watchlist/${movieId}`, 
        { media_type: mediaType }, // Match the expected backend format
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      toast.success('Added to watchlist');
      
      // Refresh watchlist after adding
      get().fetchWatchlist();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to watchlist');
      return false;
    }
  },

  addToFavorites: async (movieId, mediaType) => {
    // First check authentication 
    const token = useAuthStore.getState().getToken();
    if (!token) {
      toast.error("Please log in to add to your favorites");
      return false;
    }
    
    try {
      await axios.post(`/api/user/likes/${movieId}`, 
        { media_type: mediaType }, // Match the expected backend format
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      toast.success('Added to favorites');
      
      // Refresh favorites after adding
      get().fetchFavorites();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to favorites');
      return false;
    }
  },

  removeFromWatchlist: async (movieId) => {
    // First check authentication 
    const token = useAuthStore.getState().getToken();
    if (!token) {
      toast.error("Please log in to manage your watchlist");
      return false;
    }
    
    try {
      await axios.delete(`/api/user/watchlist/${movieId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update local state by filtering out the removed item
      set(state => ({
        watchlist: state.watchlist.filter(item => item.id !== parseInt(movieId))
      }));
      
      toast.success('Removed from watchlist');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove from watchlist');
      return false;
    }
  },

  removeFromFavorites: async (movieId) => {
    // First check authentication 
    const token = useAuthStore.getState().getToken();
    if (!token) {
      toast.error("Please log in to manage your favorites");
      return false;
    }
    
    try {
      await axios.delete(`/api/user/likes/${movieId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update local state by filtering out the removed item
      set(state => ({
        favorites: state.favorites.filter(item => item.id !== parseInt(movieId))
      }));
      
      toast.success('Removed from favorites');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove from favorites');
      return false;
    }
  },

  // Check if an item is in the watchlist
  isInWatchlist: (itemId) => {
    return get().watchlist.some(item => item.id === parseInt(itemId));
  },
  
  // Check if an item is in favorites
  isInFavorites: (itemId) => {
    return get().favorites.some(item => item.id === parseInt(itemId));
  }
}));