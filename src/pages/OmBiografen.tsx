import { useNavigate } from "react-router-dom";

export default function OmBiografen() {
  const navigate = useNavigate();

  const goHome = () => navigate("/");
  const goKiosk = () => navigate("/kiosk");

  return (
    <div className="om-biografen-page home-page container-fluid pb-4">
      <h1 className="om-biografen-title mb-4">Om Biografen</h1>

      <p className="om-biografen-intro">
        Gröna Duken är en modern biografupplevelse med fokus på komfort,
        kvalitet och enkel bokning. Välj film, välj tid och välj din plats –
        sedan är det bara att luta sig tillbaka och njuta.
      </p>

      <h2 className="om-biografen-subtitle mb-3">Våra upplevelser</h2>

      <div className="om-biografen-grid">
        {/* Välj plats -> Startsida */}
        <div
          className="om-biografen-card om-biografen-card--clickable"
          onClick={goHome}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && goHome()}
        >
          <img
            className="om-biografen-img"
            src="/pictures/Cinema_thumbnail/31.jpg"
            alt="Välj plats"
          />

          <div className="om-biografen-body">
            <h3 className="om-biografen-card-title">Välj plats</h3>
            <p className="om-biografen-card-text">
              Efter att du valt film och tid kan du välja din plats i salongen.
            </p>
          </div>
        </div>

        {/* Dukarna (ingen klick) */}
        <div className="om-biografen-card">
          <img
            className="om-biografen-img"
            src="/pictures/Cinema_thumbnail/32.jpg"
            alt="Dukarna"
          />

          <div className="om-biografen-body">
            <h3 className="om-biografen-card-title">Dukarna</h3>
            <p className="om-biografen-card-text">
              Större duk, större känsla – perfekt för storfilm.
            </p>
          </div>
        </div>

        {/* Dryck & Snacks -> Kiosk */}
        <div
          className="om-biografen-card om-biografen-card--clickable"
          onClick={goKiosk}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && goKiosk()}
        >
          <img
            className="om-biografen-img"
            src="/pictures/Cinema_thumbnail/33.jpg"
            alt="Dryck & Snacks"
          />

          <div className="om-biografen-body">
            <h3 className="om-biografen-card-title">Dryck & Snacks</h3>
            <p className="om-biografen-card-text">
              Välj dryck och snacks från kiosken till din favoritfilm.
            </p>
          </div>
        </div>
      </div>

      <div style={{ height: 18 }} />

      <div className="om-biografen-footer-note text-muted">
        Har du frågor: Du kan enkelt kontakta oss via telefonnummer eller chatta
        med vår AI-chattbot.
      </div>
    </div>
  );
}
