import { useEffect, useState } from "react";

const API = "";

interface Movie {
    id: number;
    title: string;
    genre: string;
    ageRestriction: number;
    screeningDate: string;
    image_url?: string | null;
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

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const upcoming = list
                .filter((movie) => new Date(movie.screeningDate) >= today)
                .sort(
                    (a, b) =>
                        new Date(a.screeningDate).getTime() -
                        new Date(b.screeningDate).getTime()
                )
                .slice(0, 4);
            
            setMovies(upcoming);
            } catch {
            setError("Could not load upcoming movies.");
            } finally {
            setLoading(false);
            }
        }
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
}
