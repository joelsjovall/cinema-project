import { useEffect, useState } from "react";

const API = "";
const UPCOMING_YEAR = 2027;

interface Movie {
    id: number;
    title: string;
    genre: string;
    ageRestriction: number;
    screeningDate: string;
    image_url?: string | null;
}

function removeDuplicateMoviesById(movieList: Movie[]): Movie[] {
    const seen = new Set<number>();
    return movieList.filter((movie) => {
        if (seen.has(movie.id)) return false;
        seen.add(movie.id);
        return true;
    });
}

function formatReleaseDate(screeningDate: string): string {
    return new Date(screeningDate).toLocaleDateString("sv-SE", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export default function Kommande() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchUpcomingMovies();
    }, []);

    async function fetchUpcomingMovies() {
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API}/movies`);
            const data = await res.json();
            const list: Movie[] = Array.isArray(data) ? data : data.movies ?? [];

            const upcoming = list
                .filter((movie) => new Date(movie.screeningDate).getFullYear() === UPCOMING_YEAR)
                .sort(
                    (a, b) =>
                        new Date(a.screeningDate).getTime() -
                        new Date(b.screeningDate).getTime()
                );

            const uniqueUpcoming = removeDuplicateMoviesById(upcoming).slice(0, 4);
            setMovies(uniqueUpcoming);
        } catch {
            setError("Could not load upcoming movies.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="kommande-page">
            <div className="kommande-inner">
                <header className="kommande-heading-row">
                    <h1>Kommande filmer :</h1>
                    <h2>{UPCOMING_YEAR}</h2>
                </header>

                {error && <div className="alert alert-danger">{error}</div>}

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border" role="status" />
                    </div>
                ) : (
                    <div className="kommande-grid">
                        {movies.map((movie) => (
                            <article className="kommande-card" key={movie.id}>
                                <img
                                    src={movie.image_url ?? "/images/placeholder.jpg"}
                                    alt={movie.title}
                                    className="kommande-poster"
                                />
                                <h3>{movie.title}</h3>
                                <p className="kommande-genre">{movie.genre}</p>
                                <p className="kommande-release-date">Släpps: {formatReleaseDate(movie.screeningDate)}</p>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}