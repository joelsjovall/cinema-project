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

// Tar bort dubletter sa att varje film (id) bara visas en gang,
// aven om API:et skickar flera visningar med olika datum.
function dedupeMoviesById(movieList: Movie[]): Movie[] {
    const seen = new Set<number>();
    return movieList.filter((movie) => {
        if (seen.has(movie.id)) return false;
        seen.add(movie.id);
        return true;
    });
}


export default function Home() {
    console.log("Home component loaded");
    const [allMovies, setAllMovies] = useState<Movie[]>([]);
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

    // Hamta filmer + filterval nar sidan laddas.
    useEffect(() => {
        fetchAll();
        fetchFilterOptions();
    }, []);

    // Bygg lokala filterval baserat pa aktuell filmlista.
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

    // Hamta filterval fran backend (genrer + aldersgranser).
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

    // Hamta alla filmer, deduplicera och uppdatera listan.
    async function fetchAll() {
        console.log("Fetching movies...");
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API}/movies`);
            console.log("Response:", res);
            const data = await res.json();
            console.log("Data:", data);
            const list = dedupeMoviesById(
              Array.isArray(data) ? data : (data.movies ?? []),
            );
            setAllMovies(list);
            setMovies(list);
            updateFilterOptions(list);
        } catch (e) {
            console.log("Error:", e);
            setError("Could not load movies.");
        } finally {
            setLoading(false);
        }
    }

    // Sok pa titel. Tom sokning fallbackar till alla filmer.
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
            const result = allMovies.filter((m) =>
              m.title.toLowerCase().includes(searchTitle.toLowerCase()),
            );
            setMovies(dedupeMoviesById(result));
        } catch {
            setError("Search failed.");
        } finally {
            setLoading(false);
        }
    }

    // Filtrera filmer med valda query-parametrar.
    function handleFilter() {
      setLoading(true);
      setError("");

      try {
        let result = [...allMovies];

        if (filterGenre) {
          result = result.filter((m) => m.genre === filterGenre);
        }

        if (filterMaxAge) {
          const age = Number(filterMaxAge);
          result = result.filter((m) => m.ageRestriction === age);
          // Om man vill visa filmer som passar användarens ålder:
          // result = result.filter((m) => m.ageRestriction <= age);
        }

        if (filterDate) {
          result = result.filter((m) => {
            const movieDate = new Date(m.screeningDate)
              .toISOString()
              .slice(0, 10);
            return movieDate === filterDate;
          });
        }

        setMovies(dedupeMoviesById(result));
      } catch {
        setError("Filter failed.");
      } finally {
        setLoading(false);
      }
    }

    // Nollstall sok/filter och ladda om standardlistan.
    function handleReset() {
        setSearchTitle("");
        setFilterGenre("");
        setFilterMaxAge("");
        setFilterDate("");
        fetchAll();
        fetchFilterOptions();
    }

    return (
        <div className="home-page container-fluid pb-4">
            <h1 className="mb-4">Filmer på bio just nu</h1>
            <div className="row g-3 mb-4">
                <div className="col-12 col-md-6">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Sök</h5>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Sök efter titel..."
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
                </div>

                <div className="col-12 col-lg-6">
                    <div className="card h-100">
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
                                        <option value="">Alla Åldersgränser</option>
                                        {availableMaxAges.map((age) => (
                                            <option key={age} value={age}>
                                                {age}+
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
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Visa loader under hamtning, annars resultat eller tomlista. */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" role="status" />
                </div>
            ) : movies.length === 0 ? (
                <div className="alert alert-info">Inga filmer hittade.</div>
            ) : (
                <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
                    {movies.map((movie) =>
                        <div className="col" key={movie.id}>
                            <div className="card h-100">
                                <div className="card-body">
                                    <img
                                        src={movie.image_url ?? "/images/placeholder.jpg"}
                                        alt={movie.title}
                                        className="img-fluid movie-poster" />
                                    <h5 className="card-title text-center">{movie.title}</h5>
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
