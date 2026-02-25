import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';

function Header() {
  const navigate = useNavigate();
  const { user, logout, authLoading } = useAuth();

  async function handleAuthClick() {
    if (user) {
      await logout();
      navigate("/");
      return;
    }
    navigate("/login");
  }

  return (
    <header className="custom-header fixed-top text-white">
      <div className="header-logo img">
        <img src="pictures/util_images/logo.png" alt="logga" />
      </div>

      <div className="bubble-group">
        <button className="bubble left" onClick={() => navigate("/")}>Startsida</button>
        <button className="bubble middle" onClick={() => navigate("/Kommande_Filmer")}>Kommande filmer</button>
        <button className="bubble right" onClick={() => navigate("/kiosk")}>Kiosken</button>
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
          {user ? "Logga ut" : "Mina sidor"}
        </button>
      </div>
    </header>
  );
}

export default Header;
