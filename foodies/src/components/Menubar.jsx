import React, { useContext, useState } from 'react';
import './Menubar.css';
import { assets } from '../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../Context/StoreContext';

const Menubar = () => {
  const [active, setActive] = useState('home');
  const navigate = useNavigate();


  const { quantities,foodList, token, setToken, setQuantities, wishlist } = useContext(StoreContext);
  const uniqueItemsInCart = Object.values(quantities).filter((qty) => qty > 0).length;
  const validWishlistCount = wishlist.filter(id => foodList.some(food => food.id === id)).length;
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setQuantities({});
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">

        {/* Logo */}
        <Link to="/">
          <div className="menu-logo-wrapper">
            <img
              src={assets.second_logo}
              alt="Logo"
              className="menu-logo-img"
            />
          </div>
        </Link>

        {/* Toggler (mobile menu) */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#menuNav"
          aria-controls="menuNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu Items */}
        <div className="collapse navbar-collapse" id="menuNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 mt-2 mt-lg-0">
            <li className="nav-item">
              <Link
                className={`nav-link ${active === 'home' ? 'active-link' : ''}`}
                to="/"
                onClick={() => setActive('home')}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${active === 'explore' ? 'active-link' : ''}`}
                to="/explore"
                onClick={() => setActive('explore')}
              >
                Explore
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${active === 'contact-us' ? 'active-link' : ''}`}
                to="/contact"
                onClick={() => setActive('contact-us')}
              >
                Contact Us
              </Link>
            </li>
          </ul>

          {/* Right section */}
          <div className="d-flex align-items-center gap-3">

            {/* Cart icon */}
            <Link to="/cart" className="cart-wrapper position-relative">
              <img src={assets.cart} alt="cart" height={30} width={30} />
              {uniqueItemsInCart > 0 && (
                <span className="cart-badge">{uniqueItemsInCart}</span>
              )}
            </Link>

           {/* Wishlist icon */}
<Link to="/wishlist" className="position-relative">
  <i className="bi bi-heart fs-4"></i>
  {validWishlistCount > 0 && (
    <span className="cart-badge">{validWishlistCount}</span>
  )}
</Link>

            {/* Login/Logout */}
            {!token ? (
              <>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>

                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={() => navigate('/register')}
                >
                  Register
                </button>
              </>
            ) : (
              <div className="dropdown text-end">
                <a
                  href="/#"
                  className="d-block link-body-emphasis text-decoration-none dropdown-toggle"
                  data-bs-toggle="dropdown"
                >
                  <img
                    src={assets.profile}
                    alt="profile"
                    width={32}
                    height={32}
                    className="rounded-circle"
                  />
                </a>

                <ul className="dropdown-menu text-small">
                  <li className="dropdown-item" onClick={() => navigate('/myorders')}>
                    Orders
                  </li>
                  <li className="dropdown-item" onClick={logout}>
                    Logout
                  </li>
                </ul>
              </div>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Menubar;
