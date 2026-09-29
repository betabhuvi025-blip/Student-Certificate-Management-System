import React from 'react';
import {
    LayoutDashboard,
    Award,
    CheckSquare,
    Trophy,
    FileSpreadsheet,
    UserCheck,
    BarChart3,
    Layers,
    PlusCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab, isOpen, onClose, pendingCount = 0 }) => {
    const { user } = useAuth();
    if (!user) return null;

    const role = user.role;

    const studentNav = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'portfolio', label: 'My Portfolio', icon: Award },
        { id: 'add-entry', label: 'Add Achievement', icon: PlusCircle },
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
        { id: 'profile', label: 'Academic Profile', icon: UserCheck }
    ];

    const facultyNav = [
        { id: 'dashboard', label: 'Faculty Overview', icon: LayoutDashboard },
        { id: 'approvals', label: 'Pending Approvals', icon: CheckSquare, badge: pendingCount },
        { id: 'all-submissions', label: 'All Submissions', icon: Layers },
        { id: 'leaderboard', label: 'Student Leaderboard', icon: Trophy },
        { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
        { id: 'profile', label: 'My Profile', icon: UserCheck }
    ];

    const hodNav = [
        { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
        { id: 'approvals', label: 'Department Approvals', icon: CheckSquare, badge: pendingCount },
        { id: 'all-submissions', label: 'Department Records', icon: Layers },
        { id: 'leaderboard', label: 'Top Performers', icon: Trophy },
        { id: 'reports', label: 'Official Reports', icon: FileSpreadsheet },
        { id: 'profile', label: 'My Profile', icon: UserCheck }
    ];

    const navItems = role === 'hod' ? hodNav : role === 'faculty' ? facultyNav : studentNav;

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="portal-tag">College IT Portal</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-600)', marginTop: '0.5rem' }}>
                    Certificate Tracker
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section-title">Navigation</div>
                {navItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(item.id);
                                if (onClose) onClose();
                            }}
                            style={{ textAlign: 'left', width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className="nav-item-badge">{item.badge}</span>
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile-summary">
                    <div className="user-avatar">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="user-details">
                        <div className="user-name">{user.name}</div>
                        <div className="user-subtext">
                            {user.role === 'student' ? (user.roll_no || 'Student') : `${user.role.toUpperCase()} • IT Dept`}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
