import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { formatINR } from '../utils/currency';
import { useAuth } from '../context/AuthContext';
import { aiTravelBrain } from '../utils/aiTravelBrain';

export default function ChatbotWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! Welcome to Lyan Travels AI Concierge. ✈️\n\nI can plan custom itineraries, search domestic & international packages departing from Tamil Nadu (Chennai, Coimbatore, Madurai, Trichy, Salem, etc.) across Budget, Economy, Standard, Premium, and Luxury tiers, or book trips directly for you.\n\nWhere would you like to travel next?",
      intent: 'greeting',
      confidence: 0.99,
      entities: {},
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Pre-seed aiTravelBrain with available packages
  useEffect(() => {
    api.get('/trips')
      .then((res) => {
        if (res.data?.data) {
          aiTravelBrain.setPackages(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Listen for package card "Book with AI Agent" click
  useEffect(() => {
    const handleExternalBookAI = (e) => {
      const trip = e.detail?.trip;
      if (trip) {
        setIsOpen(true);
        const prompt = `Book package ${trip.id}: ${trip.title} for 2 travelers`;
        handleSend(prompt);
      }
    };
    window.addEventListener('lyan_book_ai', handleExternalBookAI);
    return () => window.removeEventListener('lyan_book_ai', handleExternalBookAI);
  }, []);

  const handleSend = async (messageText) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    // Add user message
    const userMsg = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/chat/message', {
        message: textToSend,
        context: context,
      });

      const data = response.data;
      if (data.context) {
        setContext(data.context);
      }

      const botMsg = {
        sender: 'bot',
        text: data.reply || "I've processed your travel request.",
        intent: data.intent,
        confidence: data.confidence,
        entities: data.entities || {},
        booking: data.booking || null,
        bookingConfirmed: data.booking_confirmed || false,
        requiresLogin: data.requires_login || false,
        packages: data.packages || [],
        humanHandoff: data.human_handoff || false,
        suggestions: data.suggestions || [],
      };

      setMessages((prev) => [...prev, botMsg]);

      // If booking was confirmed, notify the page
      if (data.booking_confirmed && data.booking) {
        window.dispatchEvent(
          new CustomEvent('lyan_booking_confirmed', {
            detail: { booking: data.booking, note: data.booking_note },
          })
        );
      }
    } catch (err) {
      console.warn('Backend chat offline, switching to autonomous AI Travel Brain:', err);
      // Autonomous GPT Travel Brain Execution - zero crash, rich conversational travel intelligence
      const aiResult = aiTravelBrain.processUserMessage(textToSend, context, user);

      if (aiResult.context) {
        setContext(aiResult.context);
      }

      const botMsg = {
        sender: 'bot',
        text: aiResult.reply,
        intent: aiResult.intent || 'search_trips',
        confidence: aiResult.confidence || 0.98,
        entities: aiResult.entities || {},
        booking: aiResult.booking || null,
        bookingConfirmed: aiResult.booking_confirmed || false,
        requiresLogin: aiResult.requires_login || false,
        packages: aiResult.packages || [],
        humanHandoff: aiResult.human_handoff || false,
        suggestions: aiResult.suggestions || [
          'Book the first one',
          'Book the second one',
          'Which one has breakfast?',
          'Talk to human agent'
        ],
      };

      setMessages((prev) => [...prev, botMsg]);

      if (aiResult.booking_confirmed && aiResult.booking) {
        window.dispatchEvent(
          new CustomEvent('lyan_booking_confirmed', {
            detail: { booking: aiResult.booking, note: aiResult.booking_note },
          })
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearContext = () => {
    setContext({});
    setMessages([
      {
        sender: 'bot',
        text: "Dialogue context refreshed! What journey would you like to plan or explore from Tamil Nadu?",
        intent: 'greeting',
        confidence: 0.99,
        entities: {},
      },
    ]);
  };

  const quickPrompts = [
    "Find trips from Chennai under 40k",
    "Where can 4 people travel from Coimbatore for less than 1 lakh?",
    "Show beach trips but not Maldives",
    "Book package 2 for 2 travelers",
    "What is my booking status?",
    "Cancel my Goa booking",
    "Talk to human agent"
  ];

  const hasActiveSlots = Object.keys(context).length > 0;

  return (
    <div className="chatbot-root">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          className="chatbot-toggle-btn"
          onClick={() => setIsOpen(true)}
          title="Open Lyan Travels AI Travel Agent"
        >
          <span className="toggle-icon">🤖</span>
          <div className="toggle-text">
            <span className="toggle-label">AI Travel Agent</span>
            <span className="toggle-sub">Live Booking & Advice</span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-title">
              <span style={{ fontSize: '1.5rem' }}>🤖</span>
              <div>
                <h4>Lyan Travels AI Agent</h4>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <span className="chat-status-pill">🟢 Machine Learning + Tools</span>
                  {hasActiveSlots && (
                    <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.25)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      Context Active
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleClearContext}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                title="Clear conversation state"
              >
                Reset
              </button>
              <button className="chat-close-btn" onClick={() => setIsOpen(false)} title="Close chat">
                ✕
              </button>
            </div>
          </div>

          {/* Quick Handoff Action Banner */}
          <div style={{ background: '#f0f9ff', padding: '0.45rem 1rem', borderBottom: '1px solid #bae6fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
            <span style={{ color: '#0369a1', fontWeight: '600' }}>Need human assistance?</span>
            <button
              type="button"
              onClick={() => handleSend("I want to talk to someone")}
              style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '0.25rem 0.65rem', borderRadius: '4px', fontSize: '0.74rem', fontWeight: '700', cursor: 'pointer' }}
            >
              👤 Talk to Human Agent
            </button>
          </div>

          {/* Messages Area */}
          <div className="chat-messages">
            {messages.map((m, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className={`chat-bubble ${m.sender} ${m.isError ? 'error' : ''}`}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>

                  {/* Render package cards inside chat if returned */}
                  {m.packages && m.packages.length > 0 && !m.bookingConfirmed && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {m.packages.slice(0, 3).map((pkg, pIdx) => (
                        <div key={pIdx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem', display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                          <img
                            src={pkg.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=300&q=80'}
                            alt={pkg.title}
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {pkg.title}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              📍 {pkg.source || 'Chennai'} ➔ {pkg.destination} • {pkg.category || 'Standard'}
                            </div>
                            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.2rem' }}>
                              ₹{Number(pkg.amount).toLocaleString('en-IN')} / pax
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSend(`Book package ${pkg.id}: ${pkg.title}`)}
                            style={{ padding: '0.35rem 0.65rem', background: 'var(--accent-coral)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            Book This
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render Confirmation Card inside chat */}
                  {m.bookingConfirmed && m.booking && (
                    <div style={{ marginTop: '0.75rem', background: '#ecfdf5', border: '1.5px solid #10b981', borderRadius: '8px', padding: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: '800', color: '#047857' }}>OFFICIAL BOARDING VOUCHER</span>
                        <span style={{ fontSize: '0.72rem', background: '#10b981', color: '#fff', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>CONFIRMED</span>
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#064e3b' }}>{m.booking.trip_title || m.booking.tripTitle}</div>
                      <div style={{ fontSize: '0.76rem', color: '#047857', marginTop: '0.25rem' }}>
                        PNR: <strong>{m.booking.booking_code || m.booking.bookingCode}</strong> • Date: {m.booking.travel_date || m.booking.travelDate}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#047857' }}>
                        Total Paid: <strong>₹{Number(m.booking.total_amount || m.booking.totalAmount).toLocaleString('en-IN')}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/my-bookings')}
                        style={{ marginTop: '0.65rem', width: '100%', padding: '0.4rem', background: '#047857', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        View in My Trips ➔
                      </button>
                    </div>
                  )}

                  {/* Login CTA */}
                  {m.requiresLogin && (
                    <div style={{ marginTop: '0.65rem' }}>
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        style={{ padding: '0.4rem 0.85rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Sign In to Complete Booking ➔
                      </button>
                    </div>
                  )}
                </div>

                {/* Suggestions pill row */}
                {m.suggestions && m.suggestions.length > 0 && idx === messages.length - 1 && (
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                    {m.suggestions.map((s, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        className="chat-chip"
                        onClick={() => handleSend(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="chat-bubble bot" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <span>🤖 AI Agent analyzing & executing tools…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Strip */}
          <div className="chat-quick-actions">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                type="button"
                className="chat-chip"
                onClick={() => handleSend(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="chat-form"
            >
              <input
                type="text"
                placeholder="Ask e.g. 'Trip from Chennai to Goa under 25k'..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button type="submit" className="chat-send-btn" disabled={loading || !input.trim()}>
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
