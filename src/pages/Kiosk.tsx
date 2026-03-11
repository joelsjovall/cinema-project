

export default function Kiosk() {
    return (
        <div className="kiosk-page">
            <div className="kiosk-hero">
                <div className="hero-content">
                    <h1>Välkommen till Kiosk-menyn!</h1>
                    <p>Köp i våra fysiska biografer!</p>
                </div>
            </div>

            <div className="kiosk-container">
                

                <div className="products-grid">
                    <div className="product-card">
                        <img
                            className="product-image popcorn"
                            src="/pictures/kiosk_bilder/bio-popcorn.jpg"
                            alt="Popcorn"
                        />
                        <div className="product-info">
                            <h3>Popcorn</h3>
                            <p>Smaker : Salt / ost / sourcream & onion</p>
                            <div className="price1">Liten - 69.90kr</div>
                            <div className="price2">Medium - 79.90kr</div>
                            <div className="price3">Stor - 84.90kr</div>

                        </div>
                    </div>

                    <div className="product-card">
                        <img
                            className="product-image"
                            src="/pictures/kiosk_bilder/bio-chips.jpg"
                            alt="Varma chips"
                        />
                        <div className="product-info">
                            <h3>Varma chips</h3>
                            <p>Smaker :  Lättsaltade / sourcream & onion / grill</p>
                            <div className="price1">Liten - 69.90kr</div>
                            <div className="price2">Medium - 80kr</div>
                            <div className="price3">Stor - 84.90kr</div>
                        </div>
                    </div>

                    <div className="product-card">
                        <img
                            className="product-image drink"
                            src="/pictures/kiosk_bilder/bio-l%C3%A4sk.jpeg"
                            alt="LÃ¤sk"
                        />
                        <div className="product-info">
                            <h3>Läsk</h3>
                            <p>Coca Cola / Coca Cola Zero / Fanta / Fanta Zero / Fanta Exotic / Sprite / Sprite Zero</p>
                            <div className="price1">Liten -  29.90kr</div>
                            <div className="price2">Medium - 39.90kr</div>
                            <div className="price3">Stor - 44.90kr</div>

                        </div>
                    </div>

                    <div className="product-card">
                        <img
                            className="product-image"
                            src="/pictures/kiosk_bilder/bio-godis.webp"
                            alt="Godis och choklad"
                        />
                        <div className="product-info">
                            <h3>Godis och choklad</h3>
                            <p>Massor av sorter!</p>
                            <div className="price1">Bilar - 34.90kr</div>
                            <div className="price2">Marabou - 44.90kr</div>
                            <div className="price3">Gott & Blandat 34.90 kr</div>

                        </div>
                    </div>
                </div>

                <div className="deals-banner">
                    <h3>Populära kombos!</h3>
                    <p>Popcorn stor + Läsk stor = <strong>120 kr</strong> <span className="savings">(spara 10 kr)</span></p>
                    <p>Popcorn liten + Läsk liten + Gott & Blandat = <strong>120 kr</strong> <span className="savings">(Mest populär!)</span></p>
                </div>
            </div>
        </div>
    );
};;
