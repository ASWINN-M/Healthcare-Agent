import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/login', { email, password });
            localStorage.setItem('user_id', response.data.user_id);
            localStorage.setItem('user_name', response.data.name);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Welcome Back</h2>
                <p className="auth-subtitle">Login to access your healthcare assistant</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    <button type="submit" className="btn-primary">Login</button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </p>
            </div>

            <style>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: var(--background-color);
        }
        .auth-card {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }
        h2 {
          text-align: center;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }
        .auth-subtitle {
          text-align: center;
          color: #6b7280;
          margin-bottom: 2rem;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
        }
        input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .btn-primary {
          width: 100%;
          padding: 0.75rem;
          background-color: var(--primary-color);
          color: white;
          border-radius: 6px;
          font-weight: 600;
          font-size: 1rem;
          transition: background-color 0.2s;
        }
        .btn-primary:hover {
          background-color: var(--secondary-color);
        }
        .error-message {
          background-color: #fee2e2;
          color: var(--error);
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        .auth-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.9rem;
        }
        .auth-footer a {
          color: var(--primary-color);
          font-weight: 500;
        }
        .auth-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
        </div>
    );
};

export default Login;
