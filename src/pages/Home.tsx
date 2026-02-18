import { useState, useEffect } from "react";

const API = "http://localhost:3001";

interface Movie {
    id: number;
    title: string;
    genre: string;
    ageRestriction: number;
    screeningDate: string;
}

export default function Home() {
    console.log("Home component loaded");
    const [movies, setMovies] = useState<Movie[]>([]);
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
    }, []);

    async function fetchAll() {
        console.log("Fetching movies...");
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API}/movies`);
            console.log("Response:", res);
            const data = await res.json();
            console.log("Data:", data);
            setMovies(data);
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
    }

    return (
        <div className="container py-4">
            <h1 className="mb-4">🎬 Movies</h1>

            {/* ── Search ── */}
            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title">Search</h5>
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
                            Search
                        </button>
                        <button className="btn btn-outline-secondary" onClick={handleReset}>
                            Reset
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
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Genre (e.g. Action)"
                                value={filterGenre}
                                onChange={(e) => setFilterGenre(e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Max age restriction"
                                value={filterMaxAge}
                                onChange={(e) => setFilterMaxAge(e.target.value)}
                            />
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
                            Apply Filters
                        </button>
                        <button className="btn btn-outline-secondary" onClick={handleReset}>
                            Reset
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
                <div className="alert alert-info">No movies found.</div>
            ) : (
                <div className="row row-cols-1 row-cols-md-3 g-3">
                    {movies.map((movie) => (
                        <div className="col" key={`${movie.id}-${movie.screeningDate}`}>
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title">{movie.title}</h5>
                                    <p className="card-text text-muted mb-1">{movie.genre}</p>
                                    <span className="badge bg-secondary me-2">
                                        Age {movie.ageRestriction}+
                                    </span>
                                    <span className="badge bg-primary">
                                        {new Date(movie.screeningDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
