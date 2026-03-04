import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';

function Header() {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileHeader, setShowMobileHeader] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const mobileBreakpoint = 768;
    const minDelta = 6;
    const revealNearTop = 24;

    function onScroll() {
      const currentY = window.scrollY || 0;
      const isMobile = window.innerWidth <= mobileBreakpoint;

      if (!isMobile || mobileMenuOpen) {
        setShowMobileHeader(true);
        lastScrollY.current = currentY;
        return;
      }

      if (currentY <= revealNearTop) {
        setShowMobileHeader(true);
        lastScrollY.current = currentY;
        return;
      }

      const delta = currentY - lastScrollY.current;
      if (Math.abs(delta) < minDelta) return;

      setShowMobileHeader(delta < 0);
      lastScrollY.current = currentY;
    }

    function onResize() {
      if (window.innerWidth > mobileBreakpoint) {
        setShowMobileHeader(true);
      }
    }

    lastScrollY.current = window.scrollY || 0;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [mobileMenuOpen]);

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
    <header className={`custom-header fixed-top text-white${showMobileHeader ? '' : ' mobile-header-hidden'}`}>
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
