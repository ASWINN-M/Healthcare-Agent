import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await api.get('/doctors');
            setDoctors(response.data.doctors);
            setLoading(false);
        } catch (err) {
            setError('Failed to load doctors. Please try again later.');
            setLoading(false);
        }
    };

    return (
        <div className="doctors-container">
            <div className="header">
                <h2>Find Nearby Doctors</h2>
                <p>Specialists in your area based on your location</p>
            </div>

            {loading && <div className="loading">Finding best doctors...</div>}
            {error && <div className="error">{error}</div>}

            <div className="doctors-grid">
                {!loading && !error && doctors.length === 0 && (
                    <p className="no-results">No doctors found nearby.</p>
                )}

                {doctors.map((doc, index) => (
                    <div key={index} className="doctor-card">
                        <div className="doctor-info">
                            <h3>{doc.name}</h3>
                            <span className="specialty">{doc.specialty}</span>
                            <p className="distance">{doc.distance_km} km away</p>
                            <p className="phone">📞 {doc.phone}</p>
                        </div>
                        <button className="btn-book">Book Appointment</button>
                    </div>
                ))}
            </div>

            <style>{`
        .header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .header h2 {
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }
        .header p {
          color: #6b7280;
        }
        .doctors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }
        .doctor-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s;
        }
        .doctor-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .doctor-info {
          margin-bottom: 1.5rem;
        }
        .doctor-info h3 {
          font-size: 1.25rem;
          margin-bottom: 0.25rem;
        }
        .specialty {
          display: inline-block;
          background-color: #eff6ff;
          color: var(--primary-color);
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }
        .distance {
          color: #6b7280;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        .phone {
          font-weight: 500;
          color: #374151;
        }
        .btn-book {
          width: 100%;
          padding: 0.75rem;
          background-color: white;
          border: 1px solid var(--primary-color);
          color: var(--primary-color);
          border-radius: 6px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-book:hover {
          background-color: var(--primary-color);
          color: white;
        }
        .loading {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }
        .error {
          text-align: center;
          color: var(--error);
          padding: 1rem;
          background-color: #fee2e2;
          border-radius: 6px;
        }
        .no-results {
          grid-column: 1 / -1;
          text-align: center;
          color: #6b7280;
        }
      `}</style>
        </div>
    );
};

export default Doctors;
