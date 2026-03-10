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

function formatDate(date?: string) {
    return date?.split("T")[0] ?? "";
}

export default function MinaSidor() {
    const navigate = useNavigate();
    const { user, logout, authLoading } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [confirmId, setConfirmId] = useState<number | null>(null);

    async function loadBookings() {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API}/bookings/me`, { credentials: "include" });
            const data = await res.json();
            if (!res.ok || data?.error) {
                throw new Error(data?.error ?? "Kunde inte ladda bokningar.");
            }
            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Kunde inte ladda bokningar.");
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }

    async function cancelBooking(id: number) {
        try {
            const res = await fetch(`${API}/bookings/${id}/cancel`, {
                method: "DELETE",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok || data?.error) {
                throw new Error(data?.error ?? "Kunde inte avbryta bokningen.");
            }
            setConfirmId(null);
            await loadBookings();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Kunde inte avbryta bokningen.");
        }
    }

    useEffect(() => {
        if (!user) return;
        loadBookings().catch(() => null);
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
        <div className="center-page mina-page">
            <div className="mina-box">
                <div className="mina-hero">
                    {(() => {
                        const rawPoints = (user as { points?: unknown } | null)?.points;
                        const points = typeof rawPoints === "number" ? rawPoints : Number(rawPoints ?? 0);
                        const safePoints = Number.isFinite(points) ? points : 0;
                        return (
                            <>
                                <h1>Mina sidor</h1>
                                <p>Inloggad som {user.email ?? "ok�nd anv�ndare"}</p>
                                <p>Dina poäng: {safePoints}</p>
                            </>
                        );
                    })()}
                </div>

                <div className="mina-section">
                    <h3>Dina bokningar:</h3>
                    {loading ? (
                        <p>Laddar bokningar...</p>
                    ) : error ? (
                        <p className="text-danger mt-2 mb-2">{error}</p>
                    ) : bookings.length === 0 ? (
                        <p>Du har inga bokningar ännu.</p>
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
                                        <div className="booking-title">{b.title ?? "Ok�nd film"}</div>
                                        <div className="booking-row">
                                            <span>{formatDate(b.screeningDate)}</span>
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
                                        {b.status !== "cancelled" && (
                                            confirmId === b.id ? (
                                                <div className="booking-confirm">
                                                    <span>Är du säkerpå att du vill avbryta din bokning?</span>
                                                    <button
                                                        className="booking-confirm-yes"
                                                        onClick={() => cancelBooking(b.id)}
                                                    >
                                                        Ja
                                                    </button>
                                                    <button
                                                        className="booking-confirm-no"
                                                        onClick={() => setConfirmId(null)}
                                                    >
                                                        Nej
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="booking-cancel-btn"
                                                    onClick={() => setConfirmId(b.id)}
                                                >
                                                    Avbryt bokning
                                                </button>
                                            )
                                        )}
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


