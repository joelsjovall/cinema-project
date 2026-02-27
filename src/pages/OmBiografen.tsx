import { useNavigate } from "react-router-dom";

export default function OmBiografen() {
  const navigate = useNavigate();

  const goHome = () => navigate("/");
  const goKiosk = () => navigate("/kiosk");

  return (
    <div className="om-biografen-page container-fluid">
      <h1 className="title">Om Biografen</h1>

      <p className="intro">
        Gröna Duken är en modern biografupplevelse med fokus på komfort,
        kvalitet och enkel bokning. Välj film, välj tid och välj din plats –
        sedan är det bara att luta sig tillbaka och njuta.
      </p>

      <h2 className="subtitle">Våra upplevelser</h2>

      <div className="grid">
        {/* Välj plats */}
        <div
          className="card clickable"
          onClick={goHome}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && goHome()}
        >
          <img
            className="img"
            src="/pictures/Cinema_thumbnail/31.jpg"
            alt="Välj plats"
          />

          <div className="body">
            <h3 className="card-title">Välj plats</h3>
            <p className="card-text">
              Efter att du valt film och tid kan du välja din plats i salongen.
            </p>
          </div>
        </div>

        {/* Dukarna */}
        <div className="card">
          <img
            className="img"
            src="/pictures/Cinema_thumbnail/32.jpg"
            alt="Dukarna"
          />

          <div className="body">
            <h3 className="card-title">Dukarna</h3>
            <p className="card-text">
              Större duk, större känsla – perfekt för storfilm.
            </p>
          </div>
        </div>

        {/* Dryck & Snacks */}
        <div
          className="card clickable"
          onClick={goKiosk}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && goKiosk()}
        >
          <img
            className="img"
            src="/pictures/Cinema_thumbnail/33.jpg"
            alt="Dryck & Snacks"
          />

          <div className="body">
            <h3 className="card-title">Dryck & Snacks</h3>
            <p className="card-text">
              Välj dryck och snacks från kiosken till din favoritfilm.
            </p>
          </div>
        </div>
      </div>

      <div className="footer-note">
        Har du frågor? Kontakta oss via telefon eller chatta med vår
        AI-chattbot.
      </div>
    </div>
  );
}
