import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
interface Screening {
    id: number;
    salonId: number;
    movieId: number;
    screeningDate: string;
    screeningTime: string;
}

interface Salon {
    id: number;
    name: string;
    totalSeats: number;
}

interface BookedSeatRow {
    seatNumber: number;
}

interface MovieInfo {
    title?: string;
}

interface CreateBookingResponse {
    error?: string;
    bookingId?: number;
    bookingCode?: string;
}

interface LoginUserResponse {
    error?: string;
    email?: string;
}

export default function Seats() {
    const ADULT_PRICE = 140;
    const SENIOR_PRICE = 120;
    const CHILD_PRICE = 80;

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const screeningId = searchParams.get("screeningId") ?? "";

    const [screening, setScreening] = useState<Screening | null>(null);
    const [salon, setSalon] = useState<Salon | null>(null);
    const [movieTitle, setMovieTitle] = useState("");

    const [adult, setAdult] = useState(0);
    const [senior, setSenior] = useState(0);
    const [child, setChild] = useState(0);

    const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
    const [occupiedSeats, setOccupiedSeats] = useState<number[]>([]);
    const [guestEmail, setGuestEmail] = useState("");
    const [loggedInEmail, setLoggedInEmail] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [bookingMessage, setBookingMessage] = useState<string>("");
    const [isBooking, setIsBooking] = useState(false);

    const seatMaps: Record<number, number[]> = {
        1: [6, 8, 9, 10, 10, 12],
        2: [8, 9, 10, 10, 10, 10, 12, 12],
    };

    const seatRows = salon ? seatMaps[Number(salon.id)] ?? [] : [];
    const displayDate = screening?.screeningDate?.split("T")[0] ?? "";

    const totalTickets = adult + senior + child;
    const totalPrice = adult * ADULT_PRICE + senior * SENIOR_PRICE + child * CHILD_PRICE;
    const emailToUse = isLoggedIn ? loggedInEmail.trim() : guestEmail.trim();
    const canConfirm = totalTickets > 0 && selectedSeats.length === totalTickets && emailToUse.length > 0;

    useEffect(() => {
        async function fetchLoginStatus() {
            try {
                const res = await fetch("/api/login", { credentials: "include" });
                if (!res.ok) {
                    setIsLoggedIn(false);
                    setLoggedInEmail("");
                    return;
                }

                const data: LoginUserResponse = await res.json();
                const email = data.email?.trim() ?? "";
                const loggedIn = !data.error && email.length > 0;
                setIsLoggedIn(loggedIn);
                setLoggedInEmail(loggedIn ? email : "");
            } catch {
                setIsLoggedIn(false);
                setLoggedInEmail("");
            }
        }

        fetchLoginStatus();
    }, []);

    useEffect(() => {
        if (!screeningId) {
            setScreening(null);
            setSalon(null);
            setMovieTitle("");
            return;
        }

        async function fetchScreening() {
            try {
                const res = await fetch(`/movies/screenings/${encodeURIComponent(screeningId)}`);
                if (!res.ok) return;

                const data: Screening = await res.json();
                setScreening(data);

                if (data?.salonId != null) {
                    setSalon({
                        id: Number(data.salonId),
                        name: "",
                        totalSeats: 0,
                    });
                }

                if (data?.movieId != null) {
                    const movieRes = await fetch(`/movies/${encodeURIComponent(String(data.movieId))}`);
                    if (movieRes.ok) {
                        const movie: MovieInfo = await movieRes.json();
                        setMovieTitle(movie?.title ?? "");
                    } else {
                        setMovieTitle("");
                    }
                } else {
                    setMovieTitle("");
                }
            } catch {
                setScreening(null);
                setSalon(null);
                setMovieTitle("");
            }
        }

        fetchScreening();
    }, [screeningId]);

    useEffect(() => {
        if (!screeningId) {
            setOccupiedSeats([]);
            return;
        }

        async function fetchBookedSeats() {
            try {
                const res = await fetch(`/movies/screenings/${encodeURIComponent(screeningId)}/booked-seats`);
                if (!res.ok) {
                    setOccupiedSeats([]);
                    return;
                }

                const rows: BookedSeatRow[] = await res.json();
                setOccupiedSeats(rows.map((row) => Number(row.seatNumber)).filter((n) => Number.isFinite(n)));
            } catch {
                setOccupiedSeats([]);
            }
        }

        fetchBookedSeats();
    }, [screeningId]);

    useEffect(() => {
        setSelectedSeats((prev) => prev.filter((seat) => !occupiedSeats.includes(seat)));
    }, [occupiedSeats]);

    const toggleSeat = (seatNumber: number) => {
        if (occupiedSeats.includes(seatNumber)) return;

        setSelectedSeats((prev) =>
            prev.includes(seatNumber) ? prev.filter((n) => n !== seatNumber) : [...prev, seatNumber]
        );
    };

    const handleConfirm = async () => {
        if (!canConfirm || !screeningId || isBooking) return;

        const seatsToBook = [...selectedSeats];
        setIsBooking(true);
        setBookingMessage("");

        try {
            const res = await fetch(`/movies/screenings/${encodeURIComponent(screeningId)}/book`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    selectedSeats: seatsToBook,
                    totalPrice,
                    guestEmail: emailToUse,
                }),
            });

            const data: CreateBookingResponse = await res.json();
            if (!res.ok || data.error) {
                setBookingMessage(data.error ?? "Kunde inte skapa bokning.");
                return;
            }

            setBookingMessage(`Bokning skapad. Kod: ${data.bookingCode ?? "-"}`);
            setSelectedSeats([]);
            setOccupiedSeats((prev) => Array.from(new Set([...prev, ...seatsToBook])));
            navigate("/BokningsBF", {
                state: {
                    movieTitle: movieTitle || "-",
                    screeningTime: `${displayDate} ${screening?.screeningTime ?? ""}`.trim(),
                    bookingCode: data.bookingCode ?? "-",
                    email: emailToUse || "-",
                    seats: seatsToBook,
                },
            });
        } catch {
            setBookingMessage("Kunde inte skapa bokning.");
        } finally {
            setIsBooking(false);
        }
    };

    const renderSeatRows = () =>
        seatRows.map((count, rowIndex) => {
            const startNumber = seatRows.slice(0, rowIndex).reduce((a, b) => a + b, 0);

            return (
                <div key={rowIndex} className="seat-row">
                    {Array.from({ length: count })
                        .map((_, seatIndex) => ({ seatNumber: startNumber + seatIndex + 1 }))
                        .reverse()
                        .map(({ seatNumber }) => (
                            <div
                                key={seatNumber}
                                className={
                                    occupiedSeats.includes(seatNumber)
                                        ? "seat taken"
                                        : selectedSeats.includes(seatNumber)
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
        });

    return (
        <div className="main-container">
            <div className="booking-wrapper">
                <div className="booking-columns">
                    <div className="booking-info">
                        {screening ? (
                            <p>
                                Film: {movieTitle || "-"} | Datum: {displayDate} | Tid: {screening.screeningTime} | Salong: {screening.salonId}
                            </p>
                        ) : (
                            <p>Ingen visning vald.</p>
                        )}
                    </div>

                    <div className="left-column">
                        <div className="ticket-section">
                            <h3>Välj antal biljetter:</h3>

                            <div className="ticket-row">
                                <span>Vuxen</span>
                                <span>{ADULT_PRICE} kr / 180 poäng</span>
                                <div className="counter">
                                    <button onClick={() => setAdult(Math.max(0, adult - 1))}>-</button>
                                    <span>{adult}</span>
                                    <button onClick={() => setAdult(adult + 1)}>+</button>
                                </div>
                            </div>

                            <div className="ticket-row">
                                <span>Pensionär</span>
                                <span>{SENIOR_PRICE} kr / 140 poäng</span>
                                <div className="counter">
                                    <button onClick={() => setSenior(Math.max(0, senior - 1))}>-</button>
                                    <span>{senior}</span>
                                    <button onClick={() => setSenior(senior + 1)}>+</button>
                                </div>
                            </div>

                            <div className="ticket-row">
                                <span>Barn</span>
                                <span>{CHILD_PRICE} kr / 100 poäng</span>
                                <div className="counter">
                                    <button onClick={() => setChild(Math.max(0, child - 1))}>-</button>
                                    <span>{child}</span>
                                    <button onClick={() => setChild(child + 1)}>+</button>
                                </div>
                            </div>

                            <p>Totalt: {totalPrice} kr</p>
                        </div>

                        <button className="Bta" disabled={!canConfirm || isBooking} onClick={handleConfirm}>
                            {isBooking ? "Bokar..." : "Bekräfta"}
                        </button>
                        {bookingMessage && <p>{bookingMessage}</p>}

                    </div>

                    <div className="right-column">
                        <div className="seat-section">
                            <div className="seat-header-row">
                                <h3>Vänligen välj plats:</h3>
                                <div className="legend">
                                    <span className="legend-item green">Tomma</span>
                                    <span className="legend-item yellow">Valda</span>
                                    <span className="legend-item red">Upptagna</span>
                                </div>
                            </div>

                            <div className="seat-layout">{renderSeatRows()}</div>
                            <div className="email-section">
                                <input
                                    type="email"
                                    value={isLoggedIn ? loggedInEmail : guestEmail}
                                    onChange={(e) =>
                                        isLoggedIn ? setLoggedInEmail(e.target.value) : setGuestEmail(e.target.value)
                                    }
                                    placeholder={
                                        isLoggedIn
                                            ? "E-post (kan �ndras fr�n inloggad anv�ndare)"
                                            : "Skriv din e-post"
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}






