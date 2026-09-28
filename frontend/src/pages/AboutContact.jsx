import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutContact() {
  return (
    <div className="catalog-container" style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="category-pill" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}>
          About Lyan Travels
        </span>
        <h1 style={{ fontSize: '2.4rem', color: '#0f172a', marginTop: '0.75rem', fontWeight: 800 }}>
          Connecting Tamil Nadu to India & The World
        </h1>
        <p style={{ color: '#475569', fontSize: '1.1rem', maxWidth: '750px', margin: '0.75rem auto 0', lineHeight: 1.6 }}>
          Founded in Chennai, Lyan Travels is a modern technology-driven travel management platform designed to make holidays accessible, transparent, and seamless for everyone — from budget backpackers to premium family voyagers.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="feature-card" style={{ background: '#fff', padding: '1.75rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏛️</div>
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.5rem' }}>Tamil Nadu Departure Hubs</h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>
            Direct connections originating from Chennai, Coimbatore, Madurai, Tiruchirappalli, Salem, Tirunelveli, Erode, Vellore, and Puducherry.
          </p>
        </div>

        <div className="feature-card" style={{ background: '#fff', padding: '1.75rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚖️</div>
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.5rem' }}>All Budget Tiers Welcome</h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>
            We provide transparent pricing for Budget, Economy, Standard, Premium, and Luxury packages without hidden surcharges or surprise fees.
          </p>
        </div>

        <div className="feature-card" style={{ background: '#fff', padding: '1.75rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤖</div>
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.5rem' }}>Agentic AI + Human Consultants</h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>
            Plan dynamically with our multi-turn conversational AI assistant, or seamlessly hand off to licensed human travel agents anytime.
          </p>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #0f4c81 0%, #0284c7 100%)', borderRadius: '18px', padding: '2.5rem', color: '#fff', marginBottom: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>Visit Our Flagship Office</h2>
            <p style={{ opacity: 0.9, lineHeight: 1.6, marginBottom: '1rem' }}>
              📍 4th Floor, Anna Salai Commercial Tower, Mount Road, Chennai, Tamil Nadu 600002
            </p>
            <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
              📞 Helpline: +91 44 2855 4900 / +91 98401 23456<br />
              ✉️ Email: support@lyantravels.com | enquiries@lyantravels.com
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', padding: '1.5rem', borderRadius: '12px', backdropFilter: 'blur(8px)' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Operating Hours</h4>
            <p style={{ fontSize: '0.95rem', margin: '0.25rem 0' }}>🗓️ Monday – Saturday: 9:00 AM – 8:30 PM IST</p>
            <p style={{ fontSize: '0.95rem', margin: '0.25rem 0' }}>🗓️ Sunday: 10:00 AM – 5:00 PM IST</p>
            <p style={{ fontSize: '0.9rem', opacity: 0.85, marginTop: '0.75rem' }}>⚡ 24/7 AI Assistance & Emergency Hotline Active</p>
            <div style={{ marginTop: '1rem' }}>
              <Link to="/support" className="btn-primary" style={{ background: '#f97316', border: 'none', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, display: 'inline-block' }}>
                Open Support Ticket ➔
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
