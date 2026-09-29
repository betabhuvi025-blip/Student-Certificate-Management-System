import React from 'react';
import { Menu, LogOut, Award, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import ThemeSwitcher from './ThemeSwitcher';

const Navbar = ({ onToggleSidebar, activeTab, setActiveTab }) => {
    const { user, logout } = useAuth();

    return (
        <header className="top-navbar">
            <div className="navbar-brand">
                <button
                    className="btn btn-outline btn-sm"
                    style={{ display: 'none', padding: '0.4rem', border: 'none' }}
                    id="mobile-menu-btn"
                    onClick={onToggleSidebar}
                    aria-label="Toggle Navigation"
                >
                    <Menu size={20} />
                </button>
                <div className="navbar-logo-icon">
                    <Award size={22} />
                </div>
                <div>
                    <h1 className="navbar-title">Certificate Tracker</h1>
                    <div className="navbar-subtitle">Department of Information Technology</div>
                </div>
            </div>

            <div className="navbar-actions">
                <ThemeSwitcher />

                {user && (
                    <span className={`role-badge ${user.role}`}>
                        {user.role}
                    </span>
                )}

                <NotificationDropdown />

                {user && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                            onClick={() => setActiveTab('profile')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                cursor: 'pointer',
                                padding: '0.35rem 0.6rem',
                                borderRadius: '8px',
                                transition: 'background 0.15s ease'
                            }}
                            title="View Profile"
                        >
                            <div className="user-avatar" style={{ width: 34, height: 34, fontSize: '0.85rem' }}>
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div style={{ textAlign: 'left', display: 'none' }} className="user-nav-meta">
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{user.name}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.roll_no || user.role}</div>
                            </div>
                        </button>

                        <button
                            onClick={logout}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.4rem 0.65rem' }}
                            title="Log Out"
                        >
                            <LogOut size={16} />
                            <span style={{ fontSize: '0.82rem' }}>Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
