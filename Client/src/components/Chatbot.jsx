
import { useEffect, useRef, useState } from 'react';
import './Chatbot.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5159';

export default function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I’m your EMMS assistant. Ask me about machines, maintenance, or breakdowns.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  async function sendMessage(event) {
    event.preventDefault();

    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setInput('');
    setLoading(true);

    try {
      // If your backend requires JWT authentication, send the token here.
      // const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/chat/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: question })
      });
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const data = await response.json();

      // Adjust these fields to match your ChatController response DTO.
      const answer = data.reply ?? 'No response received.';

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: answer }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, I couldn't connect to the chatbot. ${error.message}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-overlay" onMouseDown={onClose}>
      <section
        className="chat-modal"
        role="dialog"
        aria-modal="true"
        aria-label="EMMS AI Assistant"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="chat-header">
          <div className="chat-avatar">AI</div>
          <div className="chat-heading">
            <strong>EMMS AI Assistant</strong>
            <span>Equipment Maintenance Support</span>
          </div>
          <button
            type="button"
            className="chat-close"
            onClick={onClose}
            aria-label="Close chatbot"
          >
            ×
          </button>
        </header>

        <div className="chat-messages" aria-live="polite">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${message.role}`}
            >
              {message.content}
            </div>
          ))}

          {loading && (
            <div className="chat-message assistant">
              Thinking...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form className="chat-input-area" onSubmit={sendMessage}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about machines or maintenance..."
            aria-label="Your message"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            Send
          </button>
        </form>
        <p className="chat-disclaimer">
          AI responses may need verification.
        </p>
      </section>
    </div>
  );
}
