export default function Login() {
    return (
        <div className="center-page">
            <div className="login-box">
                <h2>Logga in</h2>

                <label>E‑post</label>
                <input type="email" className="login-input" />

                <label>Lösenord</label>
                <input type="password" className="login-input" />

                <button className="login-btn">Logga in</button>

                <p className="login-text">
                    Har du inget konto? <a href="/register">Bli medlem!</a>
                </p>
            </div>
        </div>
    );
}
