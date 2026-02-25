import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/auth";

const API = "";

type Booking = {
    id: number;
    bookingCode?: string;
    screeningId?: number;
    totalPrice?: number;
    created?: string;
    status?: string;
    screeningDate?: string;
    screeningTime?: string;
    salonId?: number;
    salonName?: string;
    title?: string;
    image_url?: string | null;
    seats?: string | null;
};

export default function MinaSidor() {
    const navigate = useNavigate();
    const { user, logout, authLoading } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        setLoading(true);
        setError("");

        fetch(`${API}/bookings/me`, { credentials: "include" })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok || data?.error) {
                    throw new Error(data?.error ?? "Kunde inte ladda bokningar.");
                }
                if (!cancelled) {
                    setBookings(Array.isArray(data) ? data : []);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Kunde inte ladda bokningar.");
                    setBookings([]);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [user]);

    if (authLoading) {
        return (
            <div className="center-page">
                <div className="login-box">
                    <h2>Mina sidor</h2>
                    <p>Laddar...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="center-page">
                <div className="login-box">
                    <h2>Mina sidor</h2>
                    <p>Du måste vara inloggad för att se denna sida.</p>
                    <button className="login-btn" onClick={() => navigate("/login")}>
                        Logga in
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="center-page">
            <div className="mina-box">
                <div className="mina-hero">
                    <h1>Mina sidor</h1>
                    <p>Inloggad som {user.email ?? "okänd användare"}</p>
                </div>

                <div className="mina-section">
                    <h3>Dina bokningar:</h3>
                    {loading ? (
                        <p>Laddar bokningar...</p>
                    ) : error ? (
                        <p className="text-danger mt-2 mb-2">{error}</p>
                    ) : bookings.length === 0 ? (
                        <p>Du har inga bokningar �nnu.</p>
                    ) : (
                        <div className="booking-list">
                            {bookings.map((b) => (
                                <div key={b.id} className="booking-card">
                                    <div className="booking-poster">
                                        {b.image_url ? (
                                            <img src={b.image_url} alt={b.title ?? "Film"} />
                                        ) : (
                                            <div className="poster-placeholder">Ingen bild</div>
                                        )}
                                    </div>
                                    <div className="booking-info">
                                        <div className="booking-title">{b.title ?? "Okänd film"}</div>
                                        <div className="booking-row">
                                            <span>{b.screeningDate ?? ""}</span>
                                            <span>{b.screeningTime ?? ""}</span>
                                        </div>
                                        <div className="booking-row">
                                            <span>{b.salonName ?? (b.salonId ? `Salong ${b.salonId}` : "")}</span>
                                            <span>{b.seats ? `Platser ${b.seats}` : ""}</span>
                                        </div>
                                        <div className="booking-row muted">
                                            <span>{b.bookingCode ? `Bokningskod ${b.bookingCode}` : ""}</span>
                                            <span>{b.totalPrice != null ? `${b.totalPrice} kr` : ""}</span>
                                            <span>{b.status ?? ""}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mina-footer">
                    <button
                        className="login-btn"
                        onClick={async () => {
                            await logout();
                            navigate("/");
                        }}
                    >
                        Logga ut
                    </button>
                </div>
            </div>
        </div>
    );
}
