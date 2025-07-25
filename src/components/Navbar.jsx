import { useState, useEffect } from "react";
import { assets } from "../assets/assets.js";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/rooms" },
    { name: "Experience", path: "/experience" },
    { name: "About", path: "/about" },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isOwner, isAuthenticated, logout, setShowHotelReg, isLoading } = useAppContext();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const userMenu = document.querySelector('.user-menu');
      const userButton = document.querySelector('.user-button');

      if (showUserMenu && userMenu && userButton &&
        !userMenu.contains(e.target) &&
        !userButton.contains(e.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserMenu]);

  useEffect(() => {
    if (location.pathname !== "/") {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 bg-transparent w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${isScrolled
        ? "bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4"
        : "py-4 md:py-6"
        }`}
    >
      {/* Logo */}
      <Link to="/">
        <img
          src={assets.logo}
          alt="logo"
          className={`h-9 ${isScrolled ? "invert opacity-80" : ""}`}
        />
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-4 lg:gap-6">
        {navLinks.map((link, i) => (
          <Link
            key={i}
            to={link.path}
            className={`group flex flex-col gap-0.5 ${isScrolled ? "text-gray-700" : "text-white"
              }`}
          >
            {link.name}
            <div
              className={`${isScrolled ? "bg-gray-700" : "bg-white"
                } h-0.5 w-0 group-hover:w-full transition-all duration-300`}
            />
          </Link>
        ))}

        {isLoading ? (
          <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-primary animate-spin"></div>
        ) : isAuthenticated ? (
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
                className="user-button flex items-center gap-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() ||
                    user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className={`${isScrolled ? 'text-gray-700' : 'text-white'} max-w-[120px] truncate`}>
                  {user?.name ||
                    (user?.email ? user.email.split('@')[0] : 'User')}
                </span>
              </button>
              {showUserMenu && (
                <div
                  className="user-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    to="/my-bookings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    My Bookings
                  </Link>
                  {isOwner && (
                    <Link
                      to="/owner"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Owner Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${isScrolled
                ? "text-gray-700 hover:text-primary"
                : "text-white hover:text-gray-200"
                }`}
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${isScrolled
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-white text-primary hover:bg-gray-100"
                }`}
            >
              Sign up
            </Link>
          </>
        )}

        <button
          onClick={() => (isAuthenticated && isOwner ? navigate("/owner") : setShowHotelReg?.(true))}
          className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${isScrolled
            ? "bg-primary text-white hover:bg-primary/90"
            : "bg-white text-primary hover:bg-gray-100"
            }`}
        >
          {isOwner ? "Dashboard" : "List your property"}
        </button>
      </div>

      {/* Desktop Right */}
      <div className="hidden md:flex items-center gap-4">
        <img
          src={assets.searchIcon}
          className={`${isScrolled && "invert"} h-7 transition-all duration-500`}
          alt="Search"
        />
      </div>

      {/* Mobile Menu Button */}
      <div className="flex items-center gap-3 md:hidden cursor-pointer transition-all duration-500">
        <img
          onClick={() => setIsMenuOpen(true)}
          src={assets.menuIcon}
          alt="menu"
          className={`${isScrolled && "invert"} h-4`}
        />
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <button
          className="absolute top-4 right-4 cursor-pointer"
          onClick={() => setIsMenuOpen(false)}
        >
          <img
            src={assets.closeIcon}
            alt="close"
            className="h-6.5 cursor-pointer transition-all duration-500 hover:rotate-90"
          />
        </button>

        {navLinks.map((link, i) => (
          <Link
            key={i}
            to={link.path}
            onClick={() => setIsMenuOpen(false)}
            className="cursor-pointer transition-all duration-500 hover:bg-stone-200 py-2 px-4 rounded-full w-full flex justify-center items-center"
          >
            {link.name}
          </Link>
        ))}

        <button
          className="border px-4 py-1 text-sm font-light rounded-full cursor-pointer transition-all"
          onClick={() => {
            navigate("/owner");
            setIsMenuOpen(false);
          }}
        >
          {isOwner ? "Dashboard" : "List your Hotel"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
