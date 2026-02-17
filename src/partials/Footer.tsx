function Footer() {
  return (
    <header className="header">
      <div className="logo">
        <img src="../pictures/util_images/logo.png" alt="Gröna Duken logo" />
      </div>

      <nav className="nav">
        <a href="#">Startsida</a>
        <a href="#">Kommande filmer</a>
        <a href="#">Kiosken</a>
      </nav>

      <div className="account">
        <a className="btn" href="/login">
          Mina sidor
        </a>
        <div className="avatar"></div>
      </div>
    </header>
  );
}

export default Footer;