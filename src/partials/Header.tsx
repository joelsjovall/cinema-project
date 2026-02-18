import React from 'react';


function Header() {
  return (
    <header className="custom-header fixed-top text-white">
      <div className="header-logo img">
        <img src="pictures/util_images/logo.png" alt="logga" />
      </div>

      <div className="bubble-group">
        <button className="bubble left">Startsida</button>
        <button className="bubble middle">Kommande filmer</button>
        <button className="bubble right">Kiosken</button>
      </div>

      <div className="right-area">
        <div className="avatar-logo img">
          <img src="pictures/util_images/avatar.png" alt="avatar" />
        </div>

        <button className="mina-sidor-btn">Mina sidor</button>
      </div>
    </header>
  );
}

export default Header;
