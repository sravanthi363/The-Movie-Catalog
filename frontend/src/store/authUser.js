import axios from "axios";
// for sending HTTP requests
import toast from "react-hot-toast";
// for success/ error popups
import { create } from "zustand";
// to make global store

export const useAuthStore = create((set) => ({
  user: null,
  isSigningUp: false,
  isCheckingAuth: true,
  isLoggingOut: false,
  isLoggingIn: false,

  setIsCheckingAuth: (value) => set({ isCheckingAuth: value }),

  // register new user
  signup: async (credentials) => {
    set({ isSigningUp: true });
    try {
      const response = await axios.post("/api/v1/auth/signup", credentials);
      set({ user: response.data.user, isSigningUp: false });
      toast.success("Account created successfully");
    } catch (error) {
      toast.error(error.response.data.message || "Signup failed");
      set({ isSigningUp: false, user: null });
    }
  },

  // manual login
  login: async (credentials) => {
    set({ isLoggingIn: true });
    // set loading - true
    try {
      const response = await axios.post("/api/v1/auth/login", credentials);
      // breakdown - sends POST request to backend
      // this will be forwaded to port 5000 via vite proxy
      set({ user: response.data.user, isLoggingIn: false });
      // set user with backend response, react knows u r logged in
      localStorage.setItem('token', response.data.token); // Store token in localStorage
    } catch (error) {
      set({ isLoggingIn: false, user: null });
      toast.error(error.response.data.message || "Login failed");
    }
  },

  // clear session
  logout: async () => {
    set({ isLoggingOut: true });
    try {
      await axios.post("/api/v1/auth/logout");
      set({ user: null, isLoggingOut: false });
      localStorage.removeItem('token'); // Remove token from localStorage
      toast.success("Logged out successfully");
    } catch (error) {
      set({ isLoggingOut: false });
      toast.error(error.response.data.message || "Logout failed");
    }
  },

  // auto login on page refresh
  authCheck: async () => {
    set({ isCheckingAuth: true });
    // show loader spinning
    try {
      const res = await axios.get("/api/v1/auth/authCheck");
      // call backend, if valid - backend returns token else user set to null
      set({ user: res.data.user });
      // store user in zustand
    } catch (error) {
      set({ user: null });
      // not authenticated
    } finally {
      set({ isCheckingAuth: false });
      // done checking
    }
  },

  // New function to get the token
  getToken: () => {
    return localStorage.getItem('token'); // Retrieve token from localStorage
  },

  // Example of requireAuth function
  requireAuth: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("No authentication token found");
    }
    return token; // Return the token if it exists
  },

  getToken: () => localStorage.getItem('token'),
}));