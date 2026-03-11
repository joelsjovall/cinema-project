import { useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AiChatDock({ isOpen, onClose }: Props) {
  useEffect(() => {
    const updateFooterHeight = () => {
      const footer = document.getElementById("site-footer");
      const footerHeight = footer?.offsetHeight ?? 0;

      // Sätt CSS-variabel så chatten alltid ligger ovanför footern
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
    <div className="ai-chat-dock" role="dialog" aria-label="AI chat">
      <div className="ai-chat-dock__header">
        <span>AI-Chat</span>

        <button
          type="button"
          className="ai-chat-dock__close"
          onClick={onClose}
          aria-label="Close chat"
        >
          ×
        </button>
      </div>

      <div className="ai-chat-dock__body">
        <div className="p-3">
          <p className="mb-2">AI-chat.</p>
        </div>
      </div>
    </div>
  );
}
