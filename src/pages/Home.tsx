import { useState, useEffect } from "react";

const API = "";

interface Movie {
  id: number;
  title: string;
  genre: string;
  ageRestriction: number;
  screeningDate: string;
  image_url?: string | null;
}


export default function Home() {
    console.log("Home component loaded");
    const [movies, setMovies] = useState<Movie[]>([]);
    const [availableGenres, setAvailableGenres] = useState<string[]>([]);
    const [availableMaxAges, setAvailableMaxAges] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Search state
    const [searchTitle, setSearchTitle] = useState("");

    // Filter state
    const [filterGenre, setFilterGenre] = useState("");
    const [filterMaxAge, setFilterMaxAge] = useState("");
    const [filterDate, setFilterDate] = useState("");

    // Load all movies on mount
    useEffect(() => {
        fetchAll();
        fetchFilterOptions();
    }, []);

    function updateFilterOptions(movieList: Movie[]) {
        const genres = Array.from(new Set(movieList.map((m) => m.genre))).sort((a, b) =>
            a.localeCompare(b)
        );
        const ages = Array.from(new Set(movieList.map((m) => m.ageRestriction))).sort(
            (a, b) => a - b
        );
        setAvailableGenres(genres);
        setAvailableMaxAges(ages);
    }

    async function fetchFilterOptions() {
        try {
            const [genresRes, agesRes] = await Promise.all([
                fetch(`${API}/movies/options/genres`),
                fetch(`${API}/movies/options/ages`),
            ]);

            if (!genresRes.ok || !agesRes.ok) {
                throw new Error("Could not load filter options");
            }

            const genres = await genresRes.json();
            const ages = await agesRes.json();
            setAvailableGenres(genres);
            setAvailableMaxAges(ages);
        } catch (e) {
            console.log("Options error:", e);
        }
    }

    async function fetchAll() {
        console.log("Fetching movies...");
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API}/movies`);
            console.log("Response:", res);
            const data = await res.json();
            console.log("Data:", data);
            const list = Array.isArray(data) ? data : data.movies ?? [];
            setMovies(list);
            updateFilterOptions(list);
        } catch (e) {
            console.log("Error:", e);
            setError("Could not load movies.");
        } finally {
            setLoading(false);
        }
    }

    async function handleSearch() {
        if (!searchTitle.trim()) {
            fetchAll();
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch(
                `${API}/movies/search?title=${encodeURIComponent(searchTitle)}`
            );
            const data = await res.json();
            setMovies(data);
        } catch {
            setError("Search failed.");
        } finally {
            setLoading(false);
        }
    }

    async function handleFilter() {
        setLoading(true);
        setError("");
        const params = new URLSearchParams();
        if (filterGenre) params.append("genre", filterGenre);
        if (filterMaxAge) params.append("maxAge", filterMaxAge);
        if (filterDate) params.append("date", filterDate);

        try {
            const res = await fetch(`${API}/movies/filter?${params.toString()}`);
            const data = await res.json();
            setMovies(data);
        } catch {
            setError("Filter failed.");
        } finally {
            setLoading(false);
        }
    }

    function handleReset() {
        setSearchTitle("");
        setFilterGenre("");
        setFilterMaxAge("");
        setFilterDate("");
        fetchAll();
        fetchFilterOptions();
    }

    return (
        <div className="container py-4">
            <h1 className="mb-4">Filmer på bio just nu</h1>

            {/* ── Search ── */}
            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title">Sök</h5>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by title..."
                            value={searchTitle}
                            onChange={(e) => setSearchTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <button className="btn btn-primary" onClick={handleSearch}>
                            Sök
                        </button>
                        <button className="btn btn-outline-secondary" onClick={handleReset}>
                            Rensa
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Filter ── */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Filter</h5>
                    <div className="row g-2">
                        <div className="col-md-4">
                            <select
                                className="form-control"
                                value={filterGenre}
                                onChange={(e) => setFilterGenre(e.target.value)}
                            >
                                <option value="">Alla genrer</option>
                                {availableGenres.map((genre) => (
                                    <option key={genre} value={genre}>
                                        {genre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <select
                                className="form-control"
                                value={filterMaxAge}
                                onChange={(e) => setFilterMaxAge(e.target.value)}
                            >
                                <option value="">Alla åldersgränser</option>
                                {availableMaxAges.map((age) => (
                                    <option key={age} value={age}>
                                        Up to {age}+
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <input
                                type="date"
                                className="form-control"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="mt-2">
                        <button className="btn btn-primary me-2" onClick={handleFilter}>
                            Applicera Filter
                        </button>
                        <button className="btn btn-outline-secondary" onClick={handleReset}>
                            Rensa
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Results ── */}
            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status" />
                </div>
            ) : movies.length === 0 ? (
                <div className="alert alert-info">Inga filmer hittade.</div>
            ) : (
                <div className="row row-cols-1 row-cols-md-3 g-3">
                    {movies.map((movie) => 
                        <div className="col" key={`${movie.id}-${movie.screeningDate}`}>
                            <div className="card h-100">
                                <div className="card-body">
                                    <img
                                        src={movie.image_url ?? "/images/placeholder.jpg"}
                                        alt={movie.title}
                                        className="img-fluid" />
                                    <h5 className="card-title">{movie.title}</h5>
                                    <p className="card-text text-muted mb-1">{movie.genre}</p>
                                    <span className="badge bg-secondary me-2">
                                        Åldersgräns {movie.ageRestriction}+
                                    </span>
                                    <span className="badge bg-primary">
                                        {new Date(movie.screeningDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
