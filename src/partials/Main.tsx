function Main() {
  return (
    <header className="header">
      <div>
        <img
          src="../pictures/util_images/logo.png"   // ← rätt src (utan extra /../ om möjligt)
          alt="Gröna Dukens logo"
        />
      </div>

      <nav className="nav">
        <a href="/">Startsida</a>
        <a href="/kommmande">Kommande filmer</a>   {/* ← använd /kommmande istället för # */}
        <a href="/kiosk">Kiosken</a>
      </nav>

      <div className="account">
        <a className="btn" href="/login">
          Mina sidor
        </a>
        <div className="avatar"></div>  {/* tom div för avatar – fyll på senare */}
      </div>
    </header>
  );
}

export default Main;