import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Profile = () => {
    const [profile, setProfile] = useState({
        blood_group: '',
        allergies: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const userId = localStorage.getItem('user_id');
    const userName = localStorage.getItem('user_name');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get(`/profile/${userId}`);
            setProfile(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load profile');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await api.put('/profile/update', {
                user_id: parseInt(userId),
                blood_group: profile.blood_group,
                allergies: profile.allergies
            });
            setSuccess('Profile updated successfully');
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update profile');
        }
    };

    if (loading) return <div className="text-center">Loading profile...</div>;

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="avatar">{userName ? userName.charAt(0).toUpperCase() : 'U'}</div>
                    <h2>{userName}</h2>
                    <p>User ID: {userId}</p>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Blood Group</label>
                        {isEditing ? (
                            <select
                                value={profile.blood_group}
                                onChange={(e) => setProfile({ ...profile, blood_group: e.target.value })}
                                className="form-control"
                            >
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        ) : (
                            <div className="value-display">{profile.blood_group || 'Not set'}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Allergies</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={profile.allergies}
                                onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                                className="form-control"
                            />
                        ) : (
                            <div className="value-display">{profile.allergies || 'None'}</div>
                        )}
                    </div>

                    <div className="form-actions">
                        {isEditing ? (
                            <>
                                <button type="submit" className="btn-primary">Save Changes</button>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={() => setIsEditing(true)}
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <style>{`
        .profile-container {
          display: flex;
          justify-content: center;
          padding: 2rem 0;
        }
        .profile-card {
          background: white;
          padding: 2.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 500px;
        }
        .profile-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .avatar {
          width: 80px;
          height: 80px;
          background-color: var(--primary-color);
          color: white;
          font-size: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin: 0 auto 1rem;
          font-weight: 600;
        }
        .profile-header h2 {
          margin-bottom: 0.25rem;
        }
        .profile-header p {
          color: #6b7280;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
        }
        .value-display {
          padding: 0.75rem;
          background-color: #f9fafb;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          color: #374151;
        }
        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
        .btn-primary, .btn-secondary {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-primary {
          background-color: var(--primary-color);
          color: white;
          flex: 1;
        }
        .btn-secondary {
          background-color: white;
          border: 1px solid #d1d5db;
          color: #374151;
          flex: 1;
        }
        .error-message {
          color: var(--error);
          background-color: #fee2e2;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          text-align: center;
        }
        .success-message {
          color: var(--success);
          background-color: #d1fae5;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          text-align: center;
        }
      `}</style>
        </div>
    );
};

export default Profile;
