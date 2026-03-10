import { Link } from "react-router-dom";

type FooterProps = {
  onChatToggle: () => void;
};

const COOKIES_STORAGE_KEY = "Cookiemeddelande";
const COOKIES_RESET_EVENT = "cookiemeddelande:reset";

function Footer({ onChatToggle }: FooterProps) {
  function handleCookiesReset() {
    try {
      localStorage.removeItem(COOKIES_STORAGE_KEY);
    } catch {
      // Ignore storage errors for demo reset.
    }

    window.dispatchEvent(new Event(COOKIES_RESET_EVENT));
  }

  return (
    <footer id="site-footer" className="footer q text-white py-3">
      <div className="container-fluid">
        <div className="row align-items-center">
          <div className="col-3"></div>

          <div className="col-6 d-flex justify-content-center gap-5">
            <div className="text-center">
              <h6>
                <Link
                  to="/om-biografen"
                  className="text-black text-decoration-none"
                >
                  Hjälp och kontakt
                </Link>
              </h6>
              <p className="mb-0">
                <Link
                  to="/om-biografen"
                  className="text-black text-decoration-none"
                >
                  Om biografen
                </Link>
              </p>
            </div>

            <div className="text-center">
              <h6>
                <button
                  type="button"
                  className="btn btn-link p-0 text-black text-decoration-none"
                  onClick={handleCookiesReset}
                >
                  Cookies
                </button>
              </h6>
              <p className="mb-0">
                <a
                  href="tel:0763207855"
                  className="text-black text-decoration-none"
                >
                  0763207855
                </a>
              </p>
            </div>
          </div>

          <div className="col-3 text-end">
            <p className="mb-1">Behöver du hjälp?</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onChatToggle}
            >
              Chatta med vår ai-bot
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
