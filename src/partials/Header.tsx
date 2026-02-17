
function Header() {
  return (
    <header className="header">
      <div className="logo">

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

export default Header;