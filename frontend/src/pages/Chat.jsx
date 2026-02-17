import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';

const Chat = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hello! I am your healthcare assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const userId = localStorage.getItem('user_id');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await api.post('/chat', {
                user_id: parseInt(userId),
                message: userMessage.text
            });

            const botMessage = { role: 'assistant', text: response.data.response };
            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            const errorMessage = { role: 'assistant', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-window">
                <div className="messages-area">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role}`}>
                            <div className="message-bubble">
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="message assistant">
                            <div className="message-bubble typing">
                                <span>.</span><span>.</span><span>.</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="input-area">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your health question..."
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading || !input.trim()}>
                        Send
                    </button>
                </form>
            </div>

            <style>{`
        .chat-container {
          height: calc(100vh - 140px);
          max-width: 800px;
          margin: 0 auto;
        }
        .chat-window {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .message {
          display: flex;
        }
        .message.user {
          justify-content: flex-end;
        }
        .message.assistant {
          justify-content: flex-start;
        }
        .message-bubble {
          max-width: 80%;
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          line-height: 1.5;
        }
        .message.user .message-bubble {
          background-color: var(--primary-color);
          color: white;
          border-bottom-right-radius: 0.25rem;
        }
        .message.assistant .message-bubble {
          background-color: #f3f4f6;
          color: #1f2937;
          border-bottom-left-radius: 0.25rem;
        }
        .input-area {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 0.75rem;
          background: white;
        }
        .input-area input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 999px;
          outline: none;
        }
        .input-area input:focus {
          border-color: var(--primary-color);
        }
        .input-area button {
          padding: 0.75rem 1.5rem;
          background-color: var(--primary-color);
          color: white;
          border-radius: 999px;
          font-weight: 600;
          transition: background-color 0.2s;
        }
        .input-area button:hover:not(:disabled) {
          background-color: var(--secondary-color);
        }
        .input-area button:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }
        .typing span {
          animation: blink 1.4s infinite both;
          font-size: 1.5rem;
          line-height: 0.5;
          margin: 0 1px;
        }
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
        </div>
    );
};

export default Chat;
