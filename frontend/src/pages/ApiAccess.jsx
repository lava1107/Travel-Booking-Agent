import React, { useState } from 'react';
import api from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export default function ApiAccess() {
  const { t } = useLanguage();
  const [apiKey, setApiKey] = useState('lyan_live_8f3a2c7e4b9d0a12_2026');
  const [copiedKey, setCopiedKey] = useState(false);
  const [selectedLang, setSelectedLang] = useState('curl'); // 'curl', 'javascript', 'python'
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/trips');
  const [testParam, setTestParam] = useState('destination=Goa&limit=2');
  const [apiResponse, setApiResponse] = useState(null);
  const [loadingTest, setLoadingTest] = useState(false);
  const [responseStatus, setResponseStatus] = useState(null);
  const [responseTime, setResponseTime] = useState(null);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleGenerateNewKey = () => {
    const chars = '0123456789abcdef';
    let rand = '';
    for (let i = 0; i < 16; i++) {
      rand += chars[Math.floor(Math.random() * chars.length)];
    }
    const newKey = `lyan_live_${rand}_${new Date().getFullYear()}`;
    setApiKey(newKey);
  };

  const handleTestEndpoint = async () => {
    setLoadingTest(true);
    setApiResponse(null);
    const start = performance.now();
    try {
      let res;
      if (selectedEndpoint === '/api/nlp/search') {
        res = await api.post('/nlp/search', { query: testParam || 'Beach holiday from Chennai under 25000' });
      } else {
        const queryStr = testParam.trim() ? `?${testParam}` : '';
        res = await api.get(`${selectedEndpoint}${queryStr}`);
      }
      const dur = Math.round(performance.now() - start);
      setResponseTime(`${dur}ms`);
      setResponseStatus(`${res.status} OK`);
      setApiResponse(res.data);
    } catch (err) {
      const dur = Math.round(performance.now() - start);
      setResponseTime(`${dur}ms`);
      setResponseStatus(err.response ? `${err.response.status} Error` : 'Network Error');
      setApiResponse(err.response?.data || { error: err.message });
    } finally {
      setLoadingTest(false);
    }
  };

  const getCodeSnippet = () => {
    const baseUrl = window.location.origin;
    if (selectedLang === 'curl') {
      if (selectedEndpoint === '/api/nlp/search') {
        return `curl -X POST "${baseUrl}/api/nlp/search" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "Family trip from Chennai to Munnar under 30000"}'`;
      }
      return `curl -X GET "${baseUrl}${selectedEndpoint}?${testParam}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Accept: application/json"`;
    }

    if (selectedLang === 'javascript') {
      if (selectedEndpoint === '/api/nlp/search') {
        return `// Natural Language Semantic Travel Search
const response = await fetch('${baseUrl}/api/nlp/search', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: 'Luxury beach resort in Goa from Coimbatore'
  })
});

const data = await response.json();
console.log('Classified Intent:', data.intent);
console.log('Extracted Entities:', data.entities);
console.log('Matching Packages:', data.data);`;
      }
      return `// Fetch Travel Packages Catalog
const response = await fetch('${baseUrl}${selectedEndpoint}?${testParam}', {
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Accept': 'application/json'
  }
});

const data = await response.json();
console.log('Live Travel Packages:', data.data);`;
    }

    if (selectedLang === 'python') {
      if (selectedEndpoint === '/api/nlp/search') {
        return `import requests

url = "${baseUrl}/api/nlp/search"
headers = {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
}
payload = {
    "query": "Honeymoon package from Madurai to Kashmir under 50000"
}

response = requests.post(url, json=payload, headers=headers)
result = response.json()
print("NLP Intent:", result.get("intent"))
print("Total Matches:", result.get("total_matches"))`;
      }
      return `import requests

url = "${baseUrl}${selectedEndpoint}"
headers = {
    "Authorization": "Bearer ${apiKey}"
}
params = {
    "source": "Chennai",
    "destination": "Goa",
    "limit": 5
}

response = requests.get(url, headers=headers, params=params)
data = response.json()
print("Packages:", len(data.get("data", [])))`;
    }
  };

  return (
    <div className="section-wrapper" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#eff6ff', color: '#1d4ed8', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.75rem' }}>
          <span>⚡ Lyan Travels REST API & NLP Gateway</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
          Developer REST API & Semantic Query Portal
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '800px' }}>
          Integrate 700+ verified travel packages, real-time seat inventory, machine learning intent classification, and booking webhooks directly into third-party travel platforms, mobile apps, or enterprise ERP systems.
        </p>
      </div>

      {/* Grid: Left API Keys & Endpoints | Right Interactive Tester */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Left Column: API Credentials & Guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* API Key Box */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
              🔑 Production API Credentials
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Authenticate all HTTP requests by providing your private key in the <code>Authorization: Bearer &lt;TOKEN&gt;</code> header.
            </p>

            <div style={{ background: '#0f172a', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', fontFamily: 'monospace', fontSize: '0.9rem', color: '#38bdf8', overflowX: 'auto', marginBottom: '1rem' }}>
              <span>{apiKey}</span>
              <button
                type="button"
                onClick={handleCopyKey}
                style={{ background: copiedKey ? '#22c55e' : '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px', padding: '0.35rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
              >
                {copiedKey ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleGenerateNewKey}
                style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
              >
                🔄 Roll New API Key
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#16a34a', fontWeight: '700', marginLeft: 'auto' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span>
                Live API Tier: Unlimited (100 req/min)
              </div>
            </div>
          </div>

          {/* Core Endpoints Overview */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '1rem' }}>
              📡 Core REST Endpoints & Contracts
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div
                onClick={() => { setSelectedEndpoint('/api/trips'); setTestParam('destination=Goa&limit=2'); }}
                style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: selectedEndpoint === '/api/trips' ? '2px solid var(--primary)' : '1px solid var(--border-light)', background: selectedEndpoint === '/api/trips' ? '#f0f9ff' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ background: '#16a34a', color: '#fff', fontSize: '0.68rem', fontWeight: '800', padding: '0.15rem 0.4rem', borderRadius: '3px' }}>GET</span>
                  <code style={{ fontWeight: '700', fontSize: '0.88rem' }}>/api/trips</code>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Filter 700+ packages by origin, destination, maxPrice, transport, and category.
                </div>
              </div>

              <div
                onClick={() => { setSelectedEndpoint('/api/nlp/search'); setTestParam('query=Chennai to Goa under 25000'); }}
                style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: selectedEndpoint === '/api/nlp/search' ? '2px solid var(--primary)' : '1px solid var(--border-light)', background: selectedEndpoint === '/api/nlp/search' ? '#f0f9ff' : '#fff', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ background: '#2563eb', color: '#fff', fontSize: '0.68rem', fontWeight: '800', padding: '0.15rem 0.4rem', borderRadius: '3px' }}>POST</span>
                  <code style={{ fontWeight: '700', fontSize: '0.88rem' }}>/api/nlp/search</code>
                  <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.65rem', fontWeight: '700', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>AI Engine</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Calibrated TF-IDF classifier + SpaCy slot extractor returning ranked packages.
                </div>
              </div>

              <div
                onClick={() => { setSelectedEndpoint('/api/destinations'); setTestParam(''); }}
                style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: selectedEndpoint === '/api/destinations' ? '2px solid var(--primary)' : '1px solid var(--border-light)', background: selectedEndpoint === '/api/destinations' ? '#f0f9ff' : '#fff', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ background: '#16a34a', color: '#fff', fontSize: '0.68rem', fontWeight: '800', padding: '0.15rem 0.4rem', borderRadius: '3px' }}>GET</span>
                  <code style={{ fontWeight: '700', fontSize: '0.88rem' }}>/api/destinations</code>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  22 Domestic & International curated destinations with starting fares and best seasons.
                </div>
              </div>

              <div
                onClick={() => { setSelectedEndpoint('/api/health'); setTestParam(''); }}
                style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: selectedEndpoint === '/api/health' ? '2px solid var(--primary)' : '1px solid var(--border-light)', background: selectedEndpoint === '/api/health' ? '#f0f9ff' : '#fff', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ background: '#16a34a', color: '#fff', fontSize: '0.68rem', fontWeight: '800', padding: '0.15rem 0.4rem', borderRadius: '3px' }}>GET</span>
                  <code style={{ fontWeight: '700', fontSize: '0.88rem' }}>/api/health</code>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Server health, Python 3.14 cluster status, and NLP model load telemetry.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive API Console & Code Generator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Interactive Tester Box */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>
                🧪 Interactive API Explorer
              </h3>
              {responseStatus && (
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem' }}>
                  <span style={{ background: responseStatus.includes('200') ? '#dcfce7' : '#fee2e2', color: responseStatus.includes('200') ? '#15803d' : '#b91c1c', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>
                    {responseStatus}
                  </span>
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
                    {responseTime}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div style={{ background: '#e2e8f0', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', fontWeight: '800', fontSize: '0.85rem', color: '#0f172a' }}>
                {selectedEndpoint === '/api/nlp/search' ? 'POST' : 'GET'}
              </div>
              <input
                type="text"
                value={selectedEndpoint}
                readOnly
                style={{ flex: 1, minWidth: '160px', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', background: '#f8fafc', fontWeight: '600', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                {selectedEndpoint === '/api/nlp/search' ? 'JSON Query Body / Prompt:' : 'Query Parameters (e.g. key=val&key2=val2):'}
              </label>
              <input
                type="text"
                value={testParam}
                onChange={(e) => setTestParam(e.target.value)}
                placeholder="e.g. destination=Goa&limit=2"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={handleTestEndpoint}
              disabled={loadingTest}
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
            >
              {loadingTest ? 'Executing Request…' : '🚀 Send Live HTTP Request'}
            </button>

            {/* Live Response Output */}
            {apiResponse && (
              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)' }}>Response Payload (JSON):</span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2))}
                    style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Copy JSON
                  </button>
                </div>
                <pre style={{ background: '#0f172a', color: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', maxHeight: '240px', overflowY: 'auto', fontFamily: 'Consolas, monospace', lineHeight: '1.4' }}>
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Multi-Language Code Snippets */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>
                💻 Integration Code Snippets
              </h3>
              <div style={{ display: 'flex', gap: '0.25rem', background: '#f1f5f9', padding: '0.2rem', borderRadius: '6px' }}>
                {['curl', 'javascript', 'python'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setSelectedLang(l)}
                    style={{ background: selectedLang === l ? '#fff' : 'transparent', border: 'none', padding: '0.25rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', color: selectedLang === l ? 'var(--primary)' : '#64748b', cursor: 'pointer', boxShadow: selectedLang === l ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: '1.1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', overflowX: 'auto', fontFamily: 'Consolas, monospace', lineHeight: '1.5', margin: 0 }}>
              {getCodeSnippet()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
