import { useState } from "react";
import { Navigate } from "react-router-dom";

export default function Seats() {
    const seatRows = [8, 9, 10, 10, 10, 10, 12, 12];


    const [adult, setAdult] = useState(0);
    const [senior, setSenior] = useState(0);
    const [child, setChild] = useState(0);


    const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

    // Så at när man klickar ska det bli gult
    const toggleSeat = (seatNumber: number) => {
        setSelectedSeats((prev) =>
            prev.includes(seatNumber)
                ? prev.filter((n) => n !== seatNumber)
                : [...prev, seatNumber]
        );
    };

    return (
        <div className="main-container">

            <div className="booking-wrapper">

                <div className="booking-columns">


                    <div className="left-column">
                        <div className="ticket-section">
                            <h3>Välj antal biljetter:</h3>

                            <div className="ticket-row">
                                <span>Vuxen</span>
                                <span>140 kr</span>

                                <div className="counter">
                                    <button onClick={() => setAdult(Math.max(0, adult - 1))}>-</button>
                                    <span>{adult}</span>
                                    <button onClick={() => setAdult(adult + 1)}>+</button>
                                </div>
                            </div>

                            <div className="ticket-row">
                                <span>Pensionär</span>
                                <span>120 kr</span>

                                <div className="counter">
                                    <button onClick={() => setSenior(Math.max(0, senior - 1))}>-</button>
                                    <span>{senior}</span>
                                    <button onClick={() => setSenior(senior + 1)}>+</button>
                                </div>
                            </div>

                            <div className="ticket-row">
                                <span>Barn</span>
                                <span>80 kr</span>

                                <div className="counter">
                                    <button onClick={() => setChild(Math.max(0, child - 1))}>-</button>
                                    <span>{child}</span>
                                    <button onClick={() => setChild(child + 1)}>+</button>
                                </div>
                            </div>
                        </div>
                        <button className="Bta">Bekräfta</button>

                    </div>


                    <div className="right-column">
                        <div className="seat-section">

                            <h3>Vänligen välj plats:</h3>

                            <div className="legend">
                                <span className="legend-item green">Tomma</span>
                                <span className="legend-item yellow">Valda</span>
                                <span className="legend-item red">Upptagna</span>
                            </div>

                            <div className="seat-layout">
                                {seatRows.map((count, rowIndex) => {
                                    const startNumber = seatRows
                                        .slice(0, rowIndex)
                                        .reduce((a, b) => a + b, 0);

                                    return (
                                        <div key={rowIndex} className="seat-row">
                                            {Array.from({ length: count })
                                                .map((_, seatIndex) => {
                                                    const seatNumber = startNumber + seatIndex + 1;
                                                    return { seatNumber };
                                                })
                                                .reverse()
                                                .map(({ seatNumber }) => (
                                                    <div
                                                        key={seatNumber}
                                                        className={
                                                            selectedSeats.includes(seatNumber)
                                                                ? "seat selected"
                                                                : "seat available"
                                                        }
                                                        onClick={() => toggleSeat(seatNumber)}
                                                    >
                                                        {seatNumber}
                                                    </div>
                                                ))}
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}