import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API = "";

interface Movie {
  id: number;
  title: string;
  genre: string;
  ageRestriction: number;
  screeningDate: string;
  image_url?: string | null;
  description?: string | null;
  trailer_url?: string | null;
}

interface Screening {
  id?: number;
  screeningDate?: string | null;
  screeningTime?: string | null;
  movieId?: number | string | null;
  salonId?: number | string | null;
}

function normalizeScreening(raw: Screening) {
  const screeningDate =
    raw.screeningDate ??
    (raw as any).screeningdate ??
    (raw as any).screening_date ??
    (raw as any).date ??
    null;

  const screeningTime =
    raw.screeningTime ??
    (raw as any).screeningtime ??
    (raw as any).screening_time ??
    (raw as any).time ??
    null;

  const movieId =
    raw.movieId ??
    (raw as any).movieid ??
    (raw as any).movie_id ??
    null;

  const salonId =
    raw.salonId ??
    (raw as any).salonid ??
    (raw as any).salon_id ??
    null;

  return { screeningDate, screeningTime, movieId, salonId };
}

function formatDateLabel(dateKey: string) {
  const d = new Date(`${dateKey}T00:00:00`);
  return d.toLocaleDateString("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}

export default function Movie() {
  const { id } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [timesByDate, setTimesByDate] = useState<Record<string, string[]>>({});
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Ingen film vald.");
      setLoading(false);
      return;
    }

    async function fetchMovieAndScreenings() {
      setLoading(true);
      setError("");
      try {
        const movieRes = await fetch(`${API}/movies/${id}`);
        if (!movieRes.ok) {
          throw new Error("Could not load movie");
        }

        const movieData = await movieRes.json();
        setMovie(movieData);

        let movieScreenings: Screening[] = [];
        try {
          const screeningsRes = await fetch(`${API}/movies/${id}/screenings`);
          if (screeningsRes.ok) {
            const allScreenings: Screening[] = await screeningsRes.json();
            movieScreenings = allScreenings.filter((s) => {
              const normalized = normalizeScreening(s);
              return String(normalized.movieId) === String(id);
            });
          } else {
            console.error("Could not load screenings:", screeningsRes.status);
          }
        } catch (e) {
          console.error("Screenings fetch failed:", e);
        }

        const grouped = new Map<string, Set<string>>();
        for (const s of movieScreenings) {
          const normalized = normalizeScreening(s);
          const dateKey = normalized.screeningDate?.slice(0, 10);
          if (!dateKey) continue;

          let timeValue = normalized.screeningTime ?? "";
          if (!timeValue && normalized.screeningDate?.includes("T")) {
            const d = new Date(normalized.screeningDate);
            if (!Number.isNaN(d.getTime())) {
              timeValue = d.toLocaleTimeString("sv-SE", {
                hour: "2-digit",
                minute: "2-digit"
              });
            }
          }

          if (!grouped.has(dateKey)) grouped.set(dateKey, new Set<string>());
          if (timeValue) grouped.get(dateKey)!.add(timeValue);
        }

        const sortedDates = Array.from(grouped.keys()).sort(
          (a, b) => new Date(`${a}T00:00:00`).getTime() - new Date(`${b}T00:00:00`).getTime()
        );

        const timesObject: Record<string, string[]> = {};
        for (const dateKey of sortedDates) {
          timesObject[dateKey] = Array.from(grouped.get(dateKey) ?? []).sort();
        }

        setAvailableDates(sortedDates);
        setTimesByDate(timesObject);
        setSelectedDate("");
        setSelectedTime("");
      } catch {
        setError("Kunde inte ladda filmens detaljer.");
      } finally {
        setLoading(false);
      }
    }

    fetchMovieAndScreenings();
  }, [id]);

  const availableTimes = useMemo(() => {
    if (!selectedDate) return [];
    return timesByDate[selectedDate] ?? [];
  }, [selectedDate, timesByDate]);

  const canContinue = selectedDate !== "" && selectedTime !== "";

  return (
    <div className="movie-page py-4">
      <Link to="/" className="btn btn-outline-secondary mb-3">Tillbaka</Link>

      {loading ? (
        <div className="spinner-border" role="status" />
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : !movie ? (
        <div className="alert alert-info">Ingen film hittades.</div>
      ) : (
        <div className="movie-layout">
          <section className="movie-info">
            <h1 className="movie-title">{movie.title}</h1>
            <p className="movie-meta"><strong>Genre:</strong> {movie.genre}</p>
            <p className="movie-meta"><strong>Åldersgräns:</strong> {movie.ageRestriction}+</p>
            <p className="movie-meta"><strong>Beskrivning:</strong></p>
            {movie.description && <p className="movie-description">{movie.description}</p>}
          </section>

          <aside className="movie-right">
            <div className="trailer-container">
              <div className="ratio ratio-16x9">
                {movie.trailer_url ? (
                  <iframe
                    src={movie.trailer_url}
                    title="Movie Trailer"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <img src={movie.image_url ?? "/images/placeholder.jpg"} alt={movie.title} className="trailer-fallback" />
                )}
              </div>
            </div>

            <div className="date-filter">
              <label htmlFor="screening-date"></label>
              <select
                id="screening-date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime("");
                }}
              >
                <option value="">Välj en dag</option>
                {availableDates.map((dateKey) => (
                  <option key={dateKey} value={dateKey}>
                    {formatDateLabel(dateKey)}
                  </option>
                ))}
              </select>
            </div>

            {selectedDate && (
              <div className="showtime-grid">
                {availableTimes.length > 0 ? (
                  availableTimes.map((time) => (
                    <button
                      key={time}
                      className={`showtime-pill ${selectedTime === time ? "is-active" : ""}`}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))
                ) : (
                  <div className="no-times">Inga tider för valt datum.</div>
                )}
              </div>
            )}

            <div className="showtime-grid single-action">
              <button className="showtime-pill action" type="button" disabled={!canContinue}>
                Gå vidare
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
