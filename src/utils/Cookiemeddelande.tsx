import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";

const STORAGE_KEY = "Cookiemeddelande";
const RESET_EVENT = "cookiemeddelande:reset";

export default function WelcomePopup() {
  const [show, setShow] = useState(false);
  const [deniedOnce, setDeniedOnce] = useState(false);

  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem(STORAGE_KEY);
      if (!hasSeen) {
        setShow(true);
      }
    } catch {
      // Om localStorage är otillgänglig, visa en gång per session
      setShow(true);
    }
  }, []);

  useEffect(() => {
    function handleReset(_event: Event) {
      setDeniedOnce(false);
      setShow(true);
    }

    window.addEventListener(RESET_EVENT, handleReset);
    return () => window.removeEventListener(RESET_EVENT, handleReset);
  }, []);

  function handleClose(choice: "accepted" | "denied") {
    if (choice === "accepted") {
      try {
        localStorage.setItem(STORAGE_KEY, choice);
      } catch {
        // Ignorera lagringsfel och stäng popup-fönstret
      }
      setDeniedOnce(false);
      setShow(false);
      return;
    }

    // Nekad: håll popup-fönstret uppe och visa nya meddelandet(Du måste acceptera)
    setDeniedOnce(true);
  }

  return (
    <Modal
      show={show}
      onHide={() => { }}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header>
        <Modal.Title>Välkommen till Gröna Dukens Bio</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {deniedOnce ? (
          <p className="mb-0">
            Du måste acceptera alla cookies för att besöka sidan.
          </p>
        ) : (
          <p className="mb-0">
            Vi använder cookies för att förbättra din upplevelse, analysera trafik och
            för marknadsföring. Genom att klicka på &quot;Acceptera alla&quot; godkänner
            du vår användning av cookies.
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => handleClose("accepted")}>
          Acceptera alla
        </Button>
        <Button variant="outline-secondary" onClick={() => handleClose("denied")}>
          Nej, avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
}



