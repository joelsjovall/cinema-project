import { useEffect } from "react";
import AiChat from "../parts/AiChat";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AiChatDock({ isOpen, onClose }: Props) {
  useEffect(() => {
    const updateFooterHeight = () => {
      const footer = document.getElementById("site-footer");
      const footerHeight = footer?.offsetHeight ?? 0;

      document.documentElement.style.setProperty(
        "--footer-height",
        `${footerHeight}px`,
      );
    };

    updateFooterHeight();
    window.addEventListener("resize", updateFooterHeight);

    return () => {
      window.removeEventListener("resize", updateFooterHeight);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="chat" role="dialog" aria-label="AI chat">
      <div className="chat-header">
        <span>AI-assistent</span>

        <button
          type="button"
          className="chat-close"
          onClick={onClose}
          aria-label="Stäng chat"
        >
          ×
        </button>
      </div>

      <div className="chat-body">
        <AiChat />
      </div>
    </div>
  );
}
