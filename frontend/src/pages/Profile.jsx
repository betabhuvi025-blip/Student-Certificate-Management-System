import React, { useState, useEffect } from 'react';
import { User, Mail, Hash, BookOpen, Award, CheckCircle, ShieldCheck, Trophy, Save } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, refreshProfile } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [year, setYear] = useState('3rd Year');
    const [section, setSection] = useState('A');
    const [rollNo, setRollNo] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const loadProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get('/profile/me');
            const u = res.user;
            setProfileData(u);
            setStats(res.stats);

            setName(u.name || '');
            setDepartment(u.department || 'Information Technology');
            setYear(u.year || '3rd Year');
            setSection(u.section || 'A');
            setRollNo(u.roll_no || '');
        } catch (err) {
            console.error('Failed to load profile:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            setSaving(true);
            const res = await api.put('/profile/me', {
                name,
                department,
                year,
                section,
                roll_no: rollNo
            });
            setMessage('Profile updated successfully!');
            await refreshProfile();
            await loadProfile();
        } catch (err) {
            setError(err.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Academic Profile &amp; Settings
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Manage your personal student information, academic department details, and activity standing.
                </p>
            </div>

            {message && (
                <div style={{
                    background: '#f0fdf4',
                    color: '#15803d',
                    border: '1px solid #bbf7d0',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    fontSize: '0.88rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <CheckCircle size={18} />
                    <span>{message}</span>
                </div>
            )}

            {error && (
                <div style={{
                    background: '#fff1f2',
                    color: '#e11d48',
                    border: '1px solid #fecdd3',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    fontSize: '0.88rem',
                    marginBottom: '1.5rem'
                }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {/* Profile Form Card */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Edit Details</h3>
                    </div>

                    <form onSubmit={handleSave}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    className="form-input"
                                    style={{ paddingLeft: '2.4rem' }}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">College Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                                <input
                                    type="email"
                                    className="form-input"
                                    style={{ paddingLeft: '2.4rem', background: '#f8fafc', color: '#64748b' }}
                                    value={profileData?.email || ''}
                                    disabled
                                />
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Email cannot be changed after registration.</span>
                        </div>

                        {profileData?.role === 'student' && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">College Roll Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <Hash size={18} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                                        <input
                                            type="text"
                                            className="form-input"
                                            style={{ paddingLeft: '2.4rem' }}
                                            value={rollNo}
                                            onChange={(e) => setRollNo(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Academic Year</label>
                                        <select
                                            className="form-select"
                                            value={year}
                                            onChange={(e) => setYear(e.target.value)}
                                        >
                                            <option value="1st Year">1st Year</option>
                                            <option value="2nd Year">2nd Year</option>
                                            <option value="3rd Year">3rd Year</option>
                                            <option value="4th Year">4th Year</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Section</label>
                                        <select
                                            className="form-select"
                                            value={section}
                                            onChange={(e) => setSection(e.target.value)}
                                        >
                                            <option value="A">Section A</option>
                                            <option value="B">Section B</option>
                                            <option value="C">Section C</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <input
                                type="text"
                                className="form-input"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            style={{ width: '100%', padding: '0.75rem' }}
                            disabled={saving}
                        >
                            <Save size={16} />
                            {saving ? 'Saving changes...' : 'Save Profile Changes'}
                        </button>
                    </form>
                </div>

                {/* Profile Overview & Standing Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                        <div className="user-avatar" style={{
                            width: 72,
                            height: 72,
                            fontSize: '1.75rem',
                            margin: '0 auto 1rem auto'
                        }}>
                            {name ? name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                            {name}
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                            {profileData?.email}
                        </p>

                        <div style={{ marginTop: '0.75rem' }}>
                            <span className={`role-badge ${profileData?.role}`}>
                                {profileData?.role}
                            </span>
                        </div>

                        {profileData?.role === 'student' && stats && (
                            <div style={{
                                marginTop: '1.5rem',
                                paddingTop: '1.5rem',
                                borderTop: '1px solid #f1f5f9',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '0.5rem'
                            }}>
                                <div>
                                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2563eb' }}>
                                        {stats.total_points || 0}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Points</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669' }}>
                                        {stats.approved_count || 0}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Approved</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#d97706' }}>
                                        {stats.pending_count || 0}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Pending</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Department Badges Card */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Earned Activity Badges</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <div style={{ width: 34, height: 34, borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Award size={18} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>Verified Contributor</div>
                                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Active student in IT Department</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <div style={{ width: 34, height: 34, borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Trophy size={18} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>Leaderboard Contender</div>
                                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Ranked in department points table</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
