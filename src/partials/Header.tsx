import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';

function Header() {
  const navigate = useNavigate();
  const { user, logout, authLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function goTo(path: string) {
    navigate(path);
    setMobileMenuOpen(false);
  }

  function handleAuthClick() {
    if (user) {
      goTo('/mina-sidor');
      return;
    }
    goTo('/login');
  }

  return (
    <header className="custom-header fixed-top text-white">
      <div className="header-logo img">
        <img src="pictures/util_images/logo.png" alt="logga" />
      </div>

      <div className="bubble-group">
        <button className="bubble left" onClick={() => navigate('/')}>Startsida</button>
        <button className="bubble middle" onClick={() => navigate('/Kommande_Filmer')}>Kommande filmer</button>
        <button className="bubble right" onClick={() => navigate('/kiosk')}>Kiosken</button>
      </div>

      <div className="right-area">
        <div className="avatar-logo img">
          <img src="pictures/util_images/avatar.png" alt="avatar" />
        </div>

        <button
          className="mina-sidor-btn"
          onClick={handleAuthClick}
          disabled={authLoading}
        >
          Mina sidor
        </button>
      </div>

      <button
        className={`mobile-menu-toggle${mobileMenuOpen ? ' is-open' : ''}`}
        type="button"
        aria-label="Meny"
        aria-expanded={mobileMenuOpen}
        onClick={() => setMobileMenuOpen((prev) => !prev)}
      >
        <span />
        <span />
        <span />
      </button>

      {mobileMenuOpen && (
        <nav className="mobile-menu-panel">
          <button type="button" onClick={() => goTo('/')}>Startsida</button>
          <button type="button" onClick={() => goTo('/Kommande_Filmer')}>Kommande filmer</button>
          <button type="button" onClick={() => goTo('/kiosk')}>Kiosken</button>
          <button type="button" onClick={handleAuthClick} disabled={authLoading}>Mina sidor</button>
        </nav>
      )}
    </header>
  );
}

export default Header;
