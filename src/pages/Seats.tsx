export default function Seats() {
    return (
        <div className="booking-wrapper">

            <h2 className="movie-title">Dark Horizon</h2>
            <p className="movie-info">Måndag 25 januari, Lilla Salongen, kl 18:00</p>

            <div className="ticket-section">
                <h3>Välj antal biljetter:</h3>

                <div className="ticket-row">
                    <span>Vuxen</span>
                    <span>140 kr</span>
                    <input type="number" min="0" defaultValue="0" />
                </div>

                <div className="ticket-row">
                    <span>Pensionär</span>
                    <span>120 kr</span>
                    <input type="number" min="0" defaultValue="0" />
                </div>

                <div className="ticket-row">
                    <span>Barn</span>
                    <span>80 kr</span>
                    <input type="number" min="0" defaultValue="0" />
                </div>
            </div>

            <div className="seat-section">
                <h3>Vänligen välj plats:</h3>

                <div className="legend">
                    <span className="legend-item green">Tomma</span>
                    <span className="legend-item yellow">Valda</span>
                    <span className="legend-item red">Upptagna</span>
                </div>

                <div className="seat-grid">
                    {Array.from({ length: 55 }).map((_, i) => (
                        <div key={i} className="seat available">{i + 1}</div>
                    ))}
                </div>
            </div>

            <div className="email-section">
                <p>För att boka utan att vara inloggad, ange din email:</p>
                <input type="email" placeholder="E-post" />
            </div>

            <button className="confirm-btn">Bekräfta</button>

        </div>




    );

}
