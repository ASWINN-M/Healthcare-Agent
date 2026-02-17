import React, { useState } from 'react';
import api from '../services/api';

const SymptomAnalysis = () => {
    const [symptoms, setSymptoms] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const userId = localStorage.getItem('user_id');

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!symptoms.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await api.post('/analyze', {
                user_id: parseInt(userId),
                symptoms: symptoms
            });
            setResult(response.data);
        } catch (err) {
            setError('Failed to analyze symptoms. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="analysis-container">
            <div className="analysis-card">
                <h2>Symptom Checker</h2>
                <p className="subtitle">Describe your symptoms to get instant analysis and advice.</p>

                <form onSubmit={handleAnalyze}>
                    <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="E.g., I have a headache and mild fever..."
                        rows="5"
                        className="symptom-input"
                        required
                    />
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Analyzing...' : 'Analyze Symptoms'}
                    </button>
                </form>

                {error && <div className="error-message">{error}</div>}

                {result && (
                    <div className="result-section">
                        <div className={`risk-badge ${result.risk_level.toLowerCase()}`}>
                            Risk Level: {result.risk_level}
                        </div>

                        <div className="advice-box">
                            <h3>Medical Advice</h3>
                            <p>{result.advice}</p>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        .analysis-container {
          max-width: 800px;
          margin: 0 auto;
        }
        .analysis-card {
          background: white;
          padding: 2.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        h2 {
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }
        .subtitle {
          color: #6b7280;
          margin-bottom: 2rem;
        }
        .symptom-input {
          width: 100%;
          padding: 1rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-family: inherit;
          font-size: 1rem;
          margin-bottom: 1.5rem;
          resize: vertical;
        }
        .symptom-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .btn-primary {
          width: 100%;
          padding: 1rem;
          background-color: var(--primary-color);
          color: white;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1.1rem;
        }
        .btn-primary:active {
          transform: translateY(1px);
        }
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .result-section {
          margin-top: 2.5rem;
          border-top: 1px solid #e5e7eb;
          padding-top: 2rem;
          animation: fadeIn 0.5s ease-out;
        }
        .risk-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          background-color: #e5e7eb;
          color: #374151;
        }
        .risk-badge.high {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .risk-badge.medium {
          background-color: #fef3c7;
          color: #92400e;
        }
        .risk-badge.low {
          background-color: #d1fae5;
          color: #065f46;
        }
        .advice-box {
          background-color: #f8fafc;
          border-left: 4px solid var(--primary-color);
          padding: 1.5rem;
          border-radius: 0 8px 8px 0;
        }
        .advice-box h3 {
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }
        .advice-box p {
          color: #4b5563;
        }
        .error-message {
          margin-top: 1rem;
          color: var(--error);
          text-align: center;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default SymptomAnalysis;
