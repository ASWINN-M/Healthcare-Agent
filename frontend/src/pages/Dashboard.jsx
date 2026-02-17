import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const userName = localStorage.getItem('user_name');

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Welcome back, {userName}</h1>
                <p>How can we help you today?</p>
            </header>

            <div className="card-grid">
                <Link to="/analyze" className="card service-card">
                    <div className="card-icon">🩺</div>
                    <h3>Check Symptoms</h3>
                    <p>Analyze your symptoms and get instant advice</p>
                </Link>

                <Link to="/chat" className="card service-card">
                    <div className="card-icon">💬</div>
                    <h3>AI Assistant</h3>
                    <p>Chat with our healthcare AI for quick answers</p>
                </Link>

                <Link to="/doctors" className="card service-card">
                    <div className="card-icon">👨‍⚕️</div>
                    <h3>Find Doctors</h3>
                    <p>Locate specialists near you</p>
                </Link>

                <Link to="/profile" className="card service-card">
                    <div className="card-icon">👤</div>
                    <h3>My Profile</h3>
                    <p>Manage your health profile and details</p>
                </Link>
            </div>

            <style>{`
        .dashboard-header {
          margin-bottom: 2rem;
          text-align: center;
        }
        .dashboard-header h1 {
          font-size: 2rem;
          color: var(--text-color);
          margin-bottom: 0.5rem;
        }
        .dashboard-header p {
          color: #6b7280;
          font-size: 1.1rem;
        }
        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }
        .card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          border: 1px solid #e5e7eb;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border-color: var(--primary-color);
        }
        .card-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .service-card h3 {
          margin-bottom: 0.5rem;
          color: var(--primary-color);
        }
        .service-card p {
          color: #6b7280;
          font-size: 0.95rem;
        }
      `}</style>
        </div>
    );
};

export default Dashboard;
