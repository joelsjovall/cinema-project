import { useState, useEffect, useRef } from "react";
import { Form, Button, Spinner } from "react-bootstrap";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatResponse {
  choices?: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  error?: string;
}

const suggestedQuestions = [
  "Vad kostar en biljett",
  "Vilka salonger har ni?",
  "Vad finns i kiosken?",
  "Hur bokar jag?",
  "När går The Lion King?",
  "Vad är er inriktning?",
];

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const clearChat = () => {
    if (isLoading) return;
    setMessages([]);
    setInput("");
  };

  const sendMessage = async (customText?: string) => {
    const text = (customText ?? input).trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const recentMessages = nextMessages.slice(-6);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: recentMessages }),
      });

      const rawText = await response.text();

      let data: ChatResponse;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error("Server returned HTML instead of JSON");
      }

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.choices?.[0]?.message?.content || "No response",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: error instanceof Error ? error.message : "Unknown error",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ai-inner">
      <div className="messages">
        {messages.length === 0 && (
          <>
            <div className="empty-message">
              Börja chatta med AI-assistenten.
            </div>

            <div className="ai-suggestions">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  type="button"
                  className="ai-question-btn"
                  onClick={() => sendMessage(question)}
                  disabled={isLoading}
                >
                  {question}
                </button>
              ))}
            </div>
          </>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`message-row ${
              message.role === "user" ? "user-row" : "assistant-row"
            }`}
          >
            <div
              className={`message-bubble ${
                message.role === "user" ? "user-bubble" : "assistant-bubble"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="loading-row">
            <Spinner animation="border" size="sm" />
            <span>AI skriver...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <div className="ai-actions">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={clearChat}
            disabled={isLoading || messages.length === 0}
          >
            Rensa chatten
          </Button>
        </div>

        <Form.Control
          as="textarea"
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Skriv ditt meddelande..."
          rows={1}
          disabled={isLoading}
        />

        <Button
          variant="primary"
          onClick={() => sendMessage()}
          disabled={!input.trim() || isLoading}
        >
          skicka
        </Button>
      </div>
    </div>
  );
}
