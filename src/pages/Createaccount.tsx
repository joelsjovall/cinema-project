function Createaccount() {

    return (
        <div className="center-page">
            <div className="register-box">
                <h2>Registrera ny användare</h2>

                <label>E‑post</label>
                <input type="email" className="register-input" />

                <label>Lösenord</label>
                <input type="password" className="register-input" />

                <div className="name-row">
                    <div>
                        <label>Namn</label>
                        <input type="text" className="register-input" />
                    </div>

                    <div>
                        <label>Efternamn</label>
                        <input type="text" className="register-input" />
                    </div>
                </div>

                <button className="register-btn">Registrera</button>

                <p className="register-text">
                    Har du redan ett konto? <a href="/login">Logga in!</a>
                </p>
            </div>
        </div>





    );




}
export default Createaccount;