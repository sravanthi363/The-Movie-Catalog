import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut, Menu, Search } from "lucide-react";
import { useAuthStore } from "../store/authUser";
import { useContentStore } from "../store/content";
import { useUserContentStore } from "../store/userContent";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const [hasToken, setHasToken] = useState(false);

  // Check for token on component mount and when user changes
  useEffect(() => {
    const token = useAuthStore.getState().getToken(); 
    setHasToken(!!token);
    console.log("Token available:", !!token);
  }, [user]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const { setContentType } = useContentStore();

  const handleFavoritesClick = () => {
    setContentType("favorites");
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error("No token available for favorites");
      return;
    }
    
    if (user) {
      useUserContentStore.getState().fetchFavorites();
    }
  };

  const handleWatchlistClick = () => {
    setContentType("watchlist");
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error("No token available for watchlist");
      return;
    }
    
    if (user) {
      useUserContentStore.getState().fetchWatchlist();
    }
  };

  return (
    <header className='max-w-6xl mx-auto flex flex-wrap items-center justify-between p-4 h-20'>
      <div className='flex items-center gap-10 z-50'>
        <Link to='/'>
          <img 
            src='/netflix-logo.png'  
            style={{ 
              background: "transparent", 
              mixBlendMode: "multiply",
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              objectFit: "cover"
            }} 
            alt='Netflix Logo' 
            className='w-32 sm:w-40' 
          />
        </Link>

        {/* desktop navbar items */}
        <div className='hidden sm:flex gap-2 items-center'>
          <Link to='/' className='hover:text-indigo-400' onClick={() => setContentType("movie")}>
            Movies &nbsp;
          </Link>
          <Link to='/' className='hover:text-indigo-400' onClick={() => setContentType("tv")}>
            Tv Shows &nbsp;
          </Link>
          <Link 
            to={hasToken ? '/watchlist' : '/login'} 
            className='hover:text-indigo-400'
            onClick={hasToken ? handleWatchlistClick : null}
          >
            My Watchlist
          </Link>

          <Link 
            to={hasToken ? '/favorites' : '/login'} 
            className='hover:text-indigo-400'
            onClick={hasToken ? handleFavoritesClick : null}
          >
            My Favorites
          </Link>
        </div>
      </div>

      <div className='flex gap-2 items-center z-50'>
        <Link to={"/search"}>
          <Search className='size-6 cursor-pointer' />
        </Link>
        {user && user.image && (
          <img src={user.image} alt='Avatar' className='h-8 rounded cursor-pointer' />
        )}
        {hasToken && (
          <LogOut className='size-6 cursor-pointer text-indigo-400 hover:text-white' onClick={logout} />
        )}

        <div className='sm:hidden'>
          <Menu className='size-6 cursor-pointer' onClick={toggleMobileMenu} />
        </div>
      </div>

      {/* mobile navbar items */}
      {isMobileMenuOpen && (
        <div className='w-full sm:hidden mt-4 z-50 bg-black border rounded border-gray-800'>
          <Link to={"/"} className='block hover:underline p-2' onClick={() => {
            toggleMobileMenu();
            setContentType("movie");
          }}>
            Movies
          </Link>
          <Link to={"/"} className='block hover:underline p-2' onClick={() => {
            toggleMobileMenu();
            setContentType("tv");
          }}>
            Tv Shows
          </Link>
          <Link 
            to={hasToken ? '/watchlist' : '/login'} 
            className='block hover:underline p-2' 
            onClick={() => {
              toggleMobileMenu();
              if (hasToken) handleWatchlistClick();
            }}
          >
            My Watchlist
          </Link>
          <Link 
            to={hasToken ? '/favorites' : '/login'} 
            className='block hover:underline p-2' 
            onClick={() => {
              toggleMobileMenu();
              if (hasToken) handleFavoritesClick();
            }}
          >
            My Favorites
          </Link>
          <Link to={"/search"} className='block hover:underline p-2' onClick={toggleMobileMenu}>
            Search
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;