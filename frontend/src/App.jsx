import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import api from './api/client';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import Portfolio from './pages/Portfolio';
import ApprovalsList from './pages/ApprovalsList';
import HODDashboard from './pages/HODDashboard';
import Leaderboard from './pages/Leaderboard';
import ReportsExport from './pages/ReportsExport';
import Profile from './pages/Profile';
import AddAchievementModal from './pages/AddAchievementModal';
import NotFound from './pages/NotFound';

function AppContent() {
    const { user, loading } = useAuth();
    const [authView, setAuthView] = useState('login'); // 'login' or 'register'
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Modal state for adding/editing achievements
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAchievement, setEditingAchievement] = useState(null);

    // Pending count for faculty/HOD sidebar badge
    const [pendingCount, setPendingCount] = useState(0);

    const fetchPendingCount = async () => {
        if (!user || user.role === 'student') return;
        try {
            const res = await api.get('/approvals/pending');
            setPendingCount(res.count || 0);
        } catch (e) {
            console.error('Failed to fetch pending count:', e);
        }
    };

    useEffect(() => {
        if (user) {
            // Set default tab according to role
            if (user.role === 'hod') {
                setActiveTab('analytics');
            } else {
                setActiveTab('dashboard');
            }
            fetchPendingCount();
        }
    }, [user?.id, user?.role]);

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                gap: '1rem'
            }}>
                <div style={{
                    width: 48,
                    height: 48,
                    border: '4px solid #e2e8f0',
                    borderTopColor: '#2563eb',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                }} />
                <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
                    Loading Certificate Tracker...
                </div>
                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (!user) {
        if (authView === 'register') {
            return <Register onSwitchToLogin={() => setAuthView('login')} />;
        }
        return <Login onSwitchToRegister={() => setAuthView('register')} />;
    }

    const handleOpenAddModal = () => {
        setEditingAchievement(null);
        setIsAddModalOpen(true);
    };

    const handleEditAchievement = (ach) => {
        setEditingAchievement(ach);
        setIsAddModalOpen(true);
    };

    const handleAchievementSaved = () => {
        fetchPendingCount();
    };

    // Render active tab content
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                if (user.role === 'student') {
                    return (
                        <StudentDashboard
                            onOpenAddModal={handleOpenAddModal}
                            onNavigatePortfolio={() => setActiveTab('portfolio')}
                            onNavigateLeaderboard={() => setActiveTab('leaderboard')}
                        />
                    );
                } else {
                    return (
                        <HODDashboard
                            onNavigateApprovals={() => setActiveTab('approvals')}
                            onNavigateReports={() => setActiveTab('reports')}
                            onNavigateLeaderboard={() => setActiveTab('leaderboard')}
                        />
                    );
                }

            case 'analytics':
                return (
                    <HODDashboard
                        onNavigateApprovals={() => setActiveTab('approvals')}
                        onNavigateReports={() => setActiveTab('reports')}
                        onNavigateLeaderboard={() => setActiveTab('leaderboard')}
                    />
                );

            case 'portfolio':
            case 'all-submissions':
                return (
                    <Portfolio
                        onOpenAddModal={handleOpenAddModal}
                        onEditAchievement={handleEditAchievement}
                    />
                );

            case 'add-entry':
                return (
                    <Portfolio
                        onOpenAddModal={handleOpenAddModal}
                        onEditAchievement={handleEditAchievement}
                    />
                );

            case 'approvals':
                return (
                    <ApprovalsList
                        onRefreshCounts={fetchPendingCount}
                    />
                );

            case 'leaderboard':
                return <Leaderboard />;

            case 'reports':
                return <ReportsExport />;

            case 'profile':
                return <Profile />;

            default:
                return (
                    <NotFound
                        onGoHome={() => setActiveTab(user.role === 'hod' ? 'analytics' : 'dashboard')}
                    />
                );
        }
    };

    return (
        <div className="app-container">
            {/* Sidebar */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                    if (tab === 'add-entry') {
                        handleOpenAddModal();
                    } else {
                        setActiveTab(tab);
                    }
                }}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                pendingCount={pendingCount}
            />

            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.4)',
                        zIndex: 45
                    }}
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Application Area */}
            <div className="main-content">
                <Navbar
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                <main className="page-wrapper">
                    {renderContent()}
                </main>
            </div>

            {/* Global Add/Edit Achievement Modal */}
            <AddAchievementModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAchievementSaved}
                initialData={editingAchievement}
            />
        </div>
    );
}

export default function App() {
    return (
        <NotificationProvider>
            <AppContent />
        </NotificationProvider>
    );
}
