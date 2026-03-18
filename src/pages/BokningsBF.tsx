import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

type BookingState = {
    movieTitle?: string;
    screeningTime?: string;
    bookingCode?: string;
    email?: string;
    seats?: number[];
};

export default function BokningsBF() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state as BookingState | null) ?? null;

    const movieTitle = state?.movieTitle ?? "-";
    const screeningTime = state?.screeningTime ?? "-";
    const bookingCode = state?.bookingCode ?? "-";
    const email = state?.email ?? "-";
    const seats = state?.seats ?? [];
    const seatsLabel = seats.length > 0 ? seats.join(", ") : "-";

    return (
        <div className="bokningsbf-page">
            <section className="bokningsbf-card">
                <h1 className="bokningsbf-title">Bokningsbekräftelse</h1>

                <p className="bokningsbf-row">
                    <strong>Film:</strong>{" "}
                    <span>{movieTitle}</span>
                </p>
                <p className="bokningsbf-row">
                    <strong>Tid:</strong>{" "}
                    <span>{screeningTime}</span>
                </p>
                <p className="bokningsbf-row">
                    <strong>Bokningskod:</strong>{" "}
                    <span>{bookingCode}</span>
                </p>
                <p className="bokningsbf-row">
                    <strong>E-post:</strong>{" "}
                    <span>{email}</span>
                </p>
                <p className="bokningsbf-row">
                    <strong>Stol:</strong>{" "}
                    <span>{seatsLabel}</span>
                </p>

                <button className="bubbleHome" onClick={() => navigate('/')}>Startsida</button>
            </section>


        </div>
    );
}
