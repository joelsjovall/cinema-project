import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/auth";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Kunde inte ansluta till servern.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="center-page">
            <div className="login-box">
                <h2>Logga in</h2>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">E-post</label>
                    <input
                        id="email"
                        type="email"
                        className="login-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label htmlFor="password">Lösenord</label>
                    <input
                        id="password"
                        type="password"
                        className="login-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && <p className="text-danger mt-2 mb-2">{error}</p>}

                    <button className="login-btn" type="submit" disabled={loading}>
                        {loading ? "Loggar in..." : "Logga in"}
                    </button>
                </form>

                <p className="login-text">
                    Har du inget konto? <a href="/Createaccount">Bli medlem!</a>
                </p>
            </div>
        </div>
    );
}
