import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        blood_group: '',
        allergies: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/signup', formData);
            localStorage.setItem('user_id', response.data.user_id);
            localStorage.setItem('user_name', response.data.name);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Signup failed. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Create Account</h2>
                <p className="auth-subtitle">Join for personalized healthcare guidance</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Create a password"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Blood Group</label>
                            <select
                                name="blood_group"
                                value={formData.blood_group}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Allergies</label>
                            <input
                                type="text"
                                name="allergies"
                                value={formData.allergies}
                                onChange={handleChange}
                                placeholder="None or list"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary">Sign Up</button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>

            <style>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: var(--background-color);
          padding: 20px;
        }
        .auth-card {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 450px;
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
          margin-bottom: 1.25rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          font-size: 0.9rem;
        }
        input, select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
          background-color: white;
        }
        input:focus, select:focus {
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
          margin-top: 0.5rem;
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
          font-size: 0.9rem;
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

export default Signup;
