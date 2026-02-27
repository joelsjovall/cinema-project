import { useNavigate } from "react-router-dom";

export default function OmBiografen() {
  const navigate = useNavigate();

  const goHome = () => navigate("/");
  const goKiosk = () => navigate("/kiosk");

  return (
    <div className="home-page container-fluid pb-4">
      <h1 className="mb-4">Om biografen</h1>

      <p
        style={{
          maxWidth: 900,
          margin: "0 auto 24px auto",
          opacity: 0.85,
          lineHeight: 1.6,
        }}
      >
        Filmvisarna är en modern biografupplevelse med fokus på komfort,
        kvalitet och enkel bokning. Välj film, välj tid och njut av vår salong –
        med större dukar, 3D-visningar och snacks från kiosken.
      </p>

      <h2 className="mb-3" style={{ fontSize: 24 }}>
        Våra upplevelser
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 22,
        }}
      >
        {/* 3D -> Startsida */}
        <div
          onClick={goHome}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && goHome()}
          style={{
            cursor: "pointer",
            background: "rgba(40,40,40,0.85)",
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
          }}
        >
          <img
            src="/pictures/Cinema_thumbnail/31.jpg"
            alt="3D"
            style={{
              width: "100%",
              height: 230,
              objectFit: "cover",
              display: "block",
            }}
          />
          <div style={{ padding: 18 }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: 22 }}>3D</h3>
            <p style={{ margin: 0, opacity: 0.85, lineHeight: 1.55 }}>
              Upplev filmer närmare än någonsin – där scenerna känns levande i
              salongen.
            </p>
          </div>
        </div>

        {/* XL (ingen klick) */}
        <div
          style={{
            background: "rgba(40,40,40,0.85)",
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
          }}
        >
          <img
            src="/pictures/Cinema_thumbnail/32.jpg"
            alt="XL"
            style={{
              width: "100%",
              height: 230,
              objectFit: "cover",
              display: "block",
            }}
          />
          <div style={{ padding: 18 }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: 22 }}>XL</h3>
            <p style={{ margin: 0, opacity: 0.85, lineHeight: 1.55 }}>
              Större duk, större känsla – perfekt för storfilm.
            </p>
          </div>
        </div>

        {/* Nachos -> Kiosk */}
        <div
          onClick={goKiosk}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && goKiosk()}
          style={{
            cursor: "pointer",
            background: "rgba(40,40,40,0.85)",
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
          }}
        >
          <img
            src="/pictures/Cinema_thumbnail/33.jpg"
            alt="Nachos och snacks"
            style={{
              width: "100%",
              height: 230,
              objectFit: "cover",
              display: "block",
            }}
          />
          <div style={{ padding: 18 }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: 22 }}>
              Nachos och snacks
            </h3>
            <p style={{ margin: 0, opacity: 0.85, lineHeight: 1.55 }}>
              Välj snacks från kiosken – nachos, popcorn och dryck till din
              filmkväll.
            </p>
          </div>
        </div>
      </div>

      <div style={{ height: 18 }} />

      <div className="text-muted" style={{ opacity: 0.85 }}>
        Har du frågor: Du kan kan enkelt kontakta oss via telefonnummer eller
        chatta med vår AI-chattbot.
      </div>
    </div>
  );
}
