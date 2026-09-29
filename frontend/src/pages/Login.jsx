import React, { useState } from 'react';
import { Award, Lock, Mail, ArrowRight, ShieldCheck, GraduationCap, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from '../components/ThemeSwitcher';

const Login = ({ onSwitchToRegister }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email.trim() || !password) {
            setError('Please enter both email and password.');
            return;
        }

        try {
            setLoading(true);
            await login(email.trim(), password);
        } catch (err) {
            setError(err.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = async (demoEmail) => {
        setEmail(demoEmail);
        setPassword('Password123!');
        setError('');
        try {
            setLoading(true);
            await login(demoEmail, 'Password123!');
        } catch (err) {
            setError(err.message || 'Demo login failed.');
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
            padding: '1.5rem',
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
                maxWidth: '480px',
                overflow: 'hidden',
                backdropFilter: 'blur(16px)'
            }}>
                <div style={{
                    background: 'var(--banner-gradient)',
                    borderBottom: '1px solid var(--banner-border)',
                    color: '#ffffff',
                    padding: '2.5rem 2rem 2rem 2rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: 52,
                        height: 52,
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem auto'
                    }}>
                        <Award size={30} color="#ffffff" />
                    </div>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                        Certificate Tracker
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#bfdbfe', marginTop: '0.35rem' }}>
                        Department of Information Technology &bull; Academic Portal
                    </p>
                </div>

                <div style={{ padding: '2rem' }}>
                    {error && (
                        <div style={{
                            background: '#fff1f2',
                            color: '#e11d48',
                            border: '1px solid #fecdd3',
                            borderRadius: '10px',
                            padding: '0.75rem 1rem',
                            fontSize: '0.85rem',
                            marginBottom: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">College Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                                <input
                                    type="email"
                                    className="form-input"
                                    style={{ paddingLeft: '2.4rem' }}
                                    placeholder="student@college.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                                <input
                                    type="password"
                                    className="form-input"
                                    style={{ paddingLeft: '2.4rem' }}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In to Portal'}
                            <ArrowRight size={18} />
                        </button>
                    </form>

                    {/* Quick Demo Switcher */}
                    <div style={{
                        marginTop: '1.75rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px dashed var(--border-color)'
                    }}>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '0.75rem',
                            textAlign: 'center'
                        }}>
                            ⚡ 1-Click Demo Login
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ flexDirection: 'column', padding: '0.6rem 0.3rem', gap: '0.2rem', fontSize: '0.78rem' }}
                                onClick={() => handleQuickLogin('student@college.edu')}
                                disabled={loading}
                            >
                                <GraduationCap size={16} color="var(--primary-500)" />
                                <span>Student</span>
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ flexDirection: 'column', padding: '0.6rem 0.3rem', gap: '0.2rem', fontSize: '0.78rem' }}
                                onClick={() => handleQuickLogin('faculty@college.edu')}
                                disabled={loading}
                            >
                                <Users size={16} color="var(--emerald-500)" />
                                <span>Faculty</span>
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ flexDirection: 'column', padding: '0.6rem 0.3rem', gap: '0.2rem', fontSize: '0.78rem' }}
                                onClick={() => handleQuickLogin('hod@college.edu')}
                                disabled={loading}
                            >
                                <ShieldCheck size={16} color="#c084fc" />
                                <span>HOD</span>
                            </button>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Don't have an account yet?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToRegister}
                            style={{ background: 'none', border: 'none', color: 'var(--primary-500)', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Register New Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
