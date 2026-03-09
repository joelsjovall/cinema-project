import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "./partials/Header";
import Main from "./partials/Main";
import Footer from "./partials/Footer";
import AiChatDock from "./partials/AiChatDock";

// turn off when not needed for debugging
const showBootstrapBreakpoints = true;

export default function App() {
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <>
      <Header />
      <Main />

      <AiChatDock isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <Footer onChatToggle={() => setIsChatOpen((prev) => !prev)} />
    </>
  );
}