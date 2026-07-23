import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authUser";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import WatchPage from "./pages/WatchPage";
import Footer from "./components/Footer";
import SearchPage from "./pages/SearchPage";
import SearchHistoryPage from "./pages/SearchHistoryPage";
import NotFoundPage from "./pages/404";
import WatchlistPage from "./pages/Watchlist";
import FavoritesPage from "./pages/Favorites";

function App() {
  const { 
    user, 
    isCheckingAuth, 
    authCheck,
    setIsCheckingAuth 
  } = useAuthStore();
  // This pulls 4 things from Zustand (authUser.js)
  // user - current logged - in user info.. null if not logged in
  // isCheckingAuth flag to show loader while checking
  // authCheck() function to ask backend if cookie / session is valid
  // setIsCheckingAuth - manual override to stop loading state
  // Zustand is a small tool that gives you one global place to store and manage React state, without extra files or complicated setup.
  // inorder to avoid some unnecessary props...

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token') || 
                      document.cookie.includes('session');
                      // checks for token.. local storage (from zustand login)
                      // or cookie set by backend
        // if either exists it calls authCheck to check if it's valid
        if (token) {
          await authCheck();
          // call backend to validate token
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [authCheck, setIsCheckingAuth]);

  if (isCheckingAuth) {
    // if isCheckingAuth is true  show loading...
    // else render all routes
    return (
      <div className='h-screen'>
        <div className='flex justify-center items-center bg-black h-full'>
          <Loader className='animate-spin text-red-600 size-10' />
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route 
          path='/login' 
          element={!user ? <LoginPage /> : <Navigate to="/" />} 
          // this says if user from zustand (useAuthStore) is null , render Login page
          // and once login page is done ,.. if zustand's user state is updated... then app.jsx will re-run that is re-render
          // else redirect to / user already logged in..
        />
        <Route 
          path='/signup' 
          element={!user ? <SignUpPage /> : <Navigate to="/" />} 
        />
        <Route 
          path='/watch/:id' 
          element={user ? <WatchPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path='/search' 
          element={user ? <SearchPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path='/history' 
          element={user ? <SearchHistoryPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path='/watchlist' 
          element={user ? <WatchlistPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path='/favorites' 
          element={user ? <FavoritesPage /> : <Navigate to="/login" />} 
        />
        <Route path='/*' element={<NotFoundPage />} />
      </Routes>
      <Footer />
      <Toaster />
    </>
  );
}

export default App;