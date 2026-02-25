import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "";

function Createaccount() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    email,
                    password,
                    firstName,
                    lastName,
                }),
            });
            const data = await res.json();
            if (!res.ok || data?.error) {
                setError(data?.error ?? "Registrering misslyckades.");
                return;
            }
            setSuccess("Kontot är skapat. Du kan logga in nu.");
            setTimeout(() => navigate("/login"), 600);
        } catch {
            setError("Kunde inte ansluta till servern.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="center-page">
            <div className="register-box">
                <h2>Registrera ny användare</h2>

                <form onSubmit={handleSubmit}>
                    <label>E-post</label>
                    <input
                        type="email"
                        className="register-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Lösenord</label>
                    <input
                        type="password"
                        className="register-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className="name-row">
                        <div>
                            <label>Namn</label>
                            <input
                                type="text"
                                className="register-input"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label>Efternamn</label>
                            <input
                                type="text"
                                className="register-input"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="text-danger mt-2 mb-2">{error}</p>}
                    {success && <p className="text-success mt-2 mb-2">{success}</p>}

                    <button className="register-btn" type="submit" disabled={loading}>
                        {loading ? "Registrerar..." : "Registrera"}
                    </button>
                </form>

                <p className="register-text">
                    Har du redan ett konto? <a href="/login">Logga in!</a>
                </p>
            </div>
        </div>
    );
}
export default Createaccount;
