import React, { useState } from 'react';
import { Award, Lock, Mail, User, ArrowRight, BookOpen, Hash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from '../components/ThemeSwitcher';

const Register = ({ onSwitchToLogin }) => {
    const { register } = useAuth();
    const [role, setRole] = useState('student');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rollNo, setRollNo] = useState('');
    const [year, setYear] = useState('3rd Year');
    const [section, setSection] = useState('A');
    const [department, setDepartment] = useState('Information Technology');

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const errs = {};
        if (!name.trim()) errs.name = 'Full name is required';
        if (!email.trim()) {
            errs.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errs.email = 'Valid email is required';
        }
        if (!password) {
            errs.password = 'Password is required';
        } else if (password.length < 6) {
            errs.password = 'Password must be at least 6 characters';
        }

        if (role === 'student') {
            if (!rollNo.trim()) errs.rollNo = 'College roll number is required (e.g. 21IT042)';
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);
            await register({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                role,
                department,
                year: role === 'student' ? year : null,
                section: role === 'student' ? section : null,
                roll_no: role === 'student' ? rollNo.trim().toUpperCase() : null
            });
        } catch (err) {
            setErrors({ general: err.message || 'Registration failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--login-bg)',
            padding: '2rem 1.5rem',
            position: 'relative'
        }}>
            {/* Top-right theme selector */}
            <div style={{ position: 'absolute', top: '1.25rem', right: '1.5rem', zIndex: 10 }}>
                <ThemeSwitcher />
            </div>

            <div style={{
                background: 'var(--bg-card)',
                borderRadius: '20px',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-color)',
                width: '100%',
                maxWidth: '520px',
                overflow: 'hidden',
                backdropFilter: 'blur(16px)'
            }}>
                <div style={{
                    background: 'var(--banner-gradient)',
                    borderBottom: '1px solid var(--banner-border)',
                    color: '#ffffff',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: 44,
                        height: 44,
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.75rem auto'
                    }}>
                        <Award size={26} color="#ffffff" />
                    </div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                        Create Portal Account
                    </h2>
                    <p style={{ fontSize: '0.82rem', color: '#bfdbfe', marginTop: '0.25rem' }}>
                        Register for the IT Department Certificate Tracker
                    </p>
                </div>

                <div style={{ padding: '2rem' }}>
                    {errors.general && (
                        <div style={{
                            background: '#fff1f2',
                            color: '#e11d48',
                            border: '1px solid #fecdd3',
                            borderRadius: '10px',
                            padding: '0.75rem 1rem',
                            fontSize: '0.85rem',
                            marginBottom: '1.25rem'
                        }}>
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Role Selector Tabs */}
                        <div className="form-group">
                            <label className="form-label">Select Your Role</label>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '0.4rem',
                                background: '#f1f5f9',
                                padding: '4px',
                                borderRadius: '10px'
                            }}>
                                {['student', 'faculty', 'hod'].map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        style={{
                                            padding: '0.5rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: role === r ? '#ffffff' : 'transparent',
                                            color: role === r ? '#1e3a8a' : '#64748b',
                                            fontWeight: role === r ? 700 : 500,
                                            fontSize: '0.82rem',
                                            cursor: 'pointer',
                                            textTransform: 'capitalize',
                                            boxShadow: role === r ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    className="form-input"
                                    style={{ paddingLeft: '2.4rem' }}
                                    placeholder="e.g. Priya Sharma"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            {errors.name && <p className="form-error">{errors.name}</p>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                                <input
                                    type="email"
                                    className="form-input"
                                    style={{ paddingLeft: '2.4rem' }}
                                    placeholder="e.g. name@college.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            {errors.email && <p className="form-error">{errors.email}</p>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                                <input
                                    type="password"
                                    className="form-input"
                                    style={{ paddingLeft: '2.4rem' }}
                                    placeholder="Min 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            {errors.password && <p className="form-error">{errors.password}</p>}
                        </div>

                        {role === 'student' && (
                            <div style={{
                                background: '#f8fafc',
                                padding: '1rem',
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                                marginBottom: '1.25rem'
                            }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                                    Academic Information
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Roll Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <Hash size={18} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                                        <input
                                            type="text"
                                            className="form-input"
                                            style={{ paddingLeft: '2.4rem' }}
                                            placeholder="e.g. 21IT042"
                                            value={rollNo}
                                            onChange={(e) => setRollNo(e.target.value)}
                                        />
                                    </div>
                                    {errors.rollNo && <p className="form-error">{errors.rollNo}</p>}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
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

                                    <div className="form-group" style={{ marginBottom: 0 }}>
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
                            </div>
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
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Complete Registration'}
                            <ArrowRight size={18} />
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            style={{ background: 'none', border: 'none', color: 'var(--primary-500)', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
