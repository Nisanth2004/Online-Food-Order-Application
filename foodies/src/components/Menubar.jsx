import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../Context/StoreContext";
import { assets } from "../assets/assets";
import { ShoppingCart, Heart, Menu, X, User, ChevronDown } from "lucide-react";

const Menubar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { quantities, token, setToken, setQuantities, wishlist } =
    useContext(StoreContext);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [specialOpen, setSpecialOpen] = useState(false);

  const profileRef = useRef(null);
  const specialRef = useRef(null);

  const cartCount = Object.values(quantities).filter(q => q > 0).length;
  const wishlistCount = wishlist.length;

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setQuantities({});
    navigate("/");
  };

  useEffect(() => {
    const handler = e => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (specialRef.current && !specialRef.current.contains(e.target)) {
        setSpecialOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const linkClass = path =>
    `relative font-medium transition ${
      location.pathname === path
        ? "text-green-600 after:w-full"
        : "text-gray-700 hover:text-green-600 after:w-full"
    } after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-green-600 after:scale-x-0 hover:after:scale-x-100 after:transition-transform`;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={assets.second_logo}
              className="h-10 w-10 rounded-full ring-2 ring-green-200"
              alt="logo"
            />
            <span className="font-extrabold text-green-700 hidden sm:block">
              Cocogrand Organics
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <nav className="hidden md:flex items-center gap-8">

            <Link to="/" className={linkClass("/")}>Home</Link>
            <Link to="/explore" className={linkClass("/explore")}>Explore</Link>

            {/* SPECIALS */}
            <div className="relative" ref={specialRef}>
              <button
                onClick={() => setSpecialOpen(!specialOpen)}
                className="flex items-center gap-1 font-medium text-gray-700 hover:text-green-600 transition"
              >
                Specials <ChevronDown size={16} />
              </button>

              {specialOpen && (
                <div className="absolute top-10 w-52 bg-white rounded-2xl shadow-xl border overflow-hidden animate-fadeIn">

                  {[
                    { label: "🔥 Best Sellers", link: "/explore?type=best-sellers" },
                    { label: "🏆 Top Selling", link: "/explore?type=top-selling" },
                    { label: "⭐ Featured Foods", link: "/explore?type=featured" },
                  ].map(item => (
                    <Link
                      key={item.link}
                      to={item.link}
                      onClick={() => setSpecialOpen(false)}
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                    >
                      {item.label}
                    </Link>
                  ))}

                </div>
              )}
            </div>

            <Link to="/contact" className={linkClass("/contact")}>Contact</Link>
          </nav>

          {/* RIGHT ICONS */}
          <div className="flex items-center gap-4">

            {/* Wishlist */}
            <Link to="/wishlist" className="relative group">
              <Heart className="group-hover:text-red-500 transition" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 rounded-full animate-bounce">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative group">
              <ShoppingCart className="group-hover:text-green-600 transition" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[10px] px-1.5 rounded-full animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* PROFILE */}
            {!token ? (
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-1.5 rounded-full border border-green-600 text-green-700 hover:bg-green-50 transition"
              >
                Login
              </button>
            ) : (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-9 h-9 flex items-center justify-center rounded-full 
                             bg-gradient-to-br from-green-500 to-emerald-600 
                             text-white shadow hover:scale-105 transition"
                >
                  <User size={18} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-44 bg-white rounded-xl shadow-lg border overflow-hidden animate-fadeIn">
                    <button
                      onClick={() => navigate("/myorders")}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      My Orders
                    </button>
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* MOBILE */}
            <button
              className="md:hidden p-2 rounded hover:bg-gray-100 transition"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Menubar;
