import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer q text-white py-3">
      <div className="container-fluid">
        <div className="row align-items-center footer-row">
          {/* Tom vänsterkolumn för balans */}
          <div className="col-md-3 d-none d-md-block"></div>

          {/* Centrerade länkar */}
          <div className="col-12 col-md-6 d-flex justify-content-center gap-4 gap-md-5 footer-links">
            <div className="text-center footer-link-block">
              <h6>
                <Link to="/om-biografen" className="text-black text-decoration-none">
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

            <div className="text-center footer-link-block">
              <h6>
                <a
                  href="/kundservice"
                  className="text-black text-decoration-none"
                >
                  Kundservice
                </a>
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

          <div className="col-12 col-md-3 text-center text-md-end footer-help">
            <p className="mb-1">Behöver du hjälp?</p>
            <button className="btn btn-primary">Chatta med vår ai-bot</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
