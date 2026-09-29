import React, { useState, useEffect } from 'react';
import {
    Award,
    Clock,
    CheckCircle2,
    XCircle,
    Trophy,
    Plus,
    FileText,
    ExternalLink,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import CertificateModal from '../components/CertificateModal';
import EmptyState from '../components/EmptyState';

const StudentDashboard = ({ onOpenAddModal, onNavigatePortfolio, onNavigateLeaderboard }) => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [recentAchievements, setRecentAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCert, setSelectedCert] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const [analyticsRes, achRes] = await Promise.all([
                api.get('/analytics/student'),
                api.get('/achievements', { sortBy: 'created_at', sortOrder: 'DESC' })
            ]);

            setAnalytics(analyticsRes);
            setRecentAchievements(achRes.achievements || []);
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const stats = analytics?.stats || {};
    const totalPoints = parseInt(stats.total_points || 0);

    return (
        <div>
            {/* Header Banner */}
            <div style={{
                background: 'var(--banner-gradient)',
                border: '1px solid var(--banner-border)',
                color: 'white',
                borderRadius: '16px',
                padding: '1.75rem 2rem',
                marginBottom: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: 'var(--banner-shadow)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: 'rgba(255, 255, 255, 0.15)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        backdropFilter: 'blur(8px)'
                    }}>
                        <Sparkles size={14} color="#fef08a" /> Student Portfolio &bull; Roll: {user?.roll_no || 'N/A'}
                    </div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', margin: 0 }}>
                        Welcome back, {user?.name}!
                    </h2>
                    <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
                        Track your co-curricular events, certificates, and earned activity points for IT Department.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className="btn"
                        style={{
                            background: '#ffffff',
                            color: '#0f172a',
                            fontWeight: 700,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                        }}
                        onClick={onOpenAddModal}
                    >
                        <Plus size={18} /> Add Achievement
                    </button>
                </div>
            </div>

            {/* KPI Stat Cards */}
            <div className="stats-grid">
                <StatCard
                    icon={Award}
                    label="Total Submissions"
                    value={stats.total || 0}
                    subtext="All event entries"
                    color="blue"
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Approved Entries"
                    value={stats.approved || 0}
                    subtext={`${stats.wins || 0} Wins • ${stats.participated || 0} Participated`}
                    color="emerald"
                />
                <StatCard
                    icon={Clock}
                    label="Pending Verification"
                    value={stats.pending || 0}
                    subtext="Awaiting faculty review"
                    color="amber"
                />
                <StatCard
                    icon={Trophy}
                    label="Total Activity Points"
                    value={`${totalPoints} pts`}
                    subtext={`Rank #${analytics?.rank || 1} of ${analytics?.totalStudents || 1}`}
                    color="purple"
                />
            </div>

            {/* Category Breakdown & Overview Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
                {/* Category Progress Card */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Event Category Breakdown</h3>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Activity distribution</span>
                    </div>

                    {(!analytics?.categoryBreakdown || analytics.categoryBreakdown.length === 0) ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                            No category data available yet.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {analytics.categoryBreakdown.map((item, idx) => {
                                const count = parseInt(item.count || 0);
                                const total = parseInt(stats.total || 1);
                                const percentage = Math.round((count / total) * 100);
                                const colors = ['#2563eb', '#059669', '#d97706', '#9333ea', '#e11d48', '#0891b2'];
                                const color = colors[idx % colors.length];

                                return (
                                    <div key={item.category}>
                                         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                                            <span style={{ fontWeight: 600, color: 'var(--slate-600)' }}>{item.category}</span>
                                            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{count} ({percentage}%)</span>
                                        </div>
                                        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${percentage}%`,
                                                height: '100%',
                                                background: color,
                                                borderRadius: '9999px',
                                                transition: 'width 0.4s ease'
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Points System Explanation Card */}
                <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <div className="card-header">
                        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Trophy size={20} color="#d97706" /> Department Points Scheme
                        </h3>
                    </div>

                    <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        <p style={{ marginBottom: '1rem' }}>
                            Every approved co-curricular achievement contributes towards your semester activity credit and departmental leaderboard rank:
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <div style={{ background: 'var(--bg-card-subtle)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-500)' }}>+10 Pts</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Win / 1st / 2nd Place</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Hackathon, Paper, Code Blitz</div>
                            </div>

                            <div style={{ background: 'var(--bg-card-subtle)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald-500)' }}>+5 Pts</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Participation</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Workshops, Seminars, NPTEL</div>
                            </div>
                        </div>

                        <button
                            className="btn btn-secondary btn-sm"
                            style={{ width: '100%', justifyContent: 'space-between' }}
                            onClick={onNavigateLeaderboard}
                        >
                            <span>View Full Department Leaderboard</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Achievements Table */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <h3 className="card-title">Recent Submissions</h3>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                            Review current status and verification remarks
                        </p>
                    </div>
                    <button
                        className="btn btn-outline btn-sm"
                        onClick={onNavigatePortfolio}
                    >
                        View All Portfolio
                    </button>
                </div>

                {recentAchievements.length === 0 ? (
                    <EmptyState
                        title="No achievements yet"
                        description="Start building your academic portfolio by submitting your first hackathon, workshop, or certificate."
                        actionLabel="Add Your First Achievement"
                        onAction={onOpenAddModal}
                    />
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Achievement & Category</th>
                                    <th>Event Level</th>
                                    <th>Type</th>
                                    <th>Event Date</th>
                                    <th>Approval Status</th>
                                    <th>Remarks</th>
                                    <th>Certificate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentAchievements.slice(0, 5).map(ach => (
                                    <tr key={ach.id}>
                                         <td>
                                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{ach.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ach.category}</div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--slate-600)', fontWeight: 500 }}>
                                                {ach.event_type}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px',
                                                background: ach.status === 'win' ? '#eff6ff' : '#f1f5f9',
                                                color: ach.status === 'win' ? '#1d4ed8' : '#475569',
                                                textTransform: 'uppercase'
                                            }}>
                                                {ach.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                                {ach.event_date}
                                            </span>
                                        </td>
                                        <td>
                                            <StatusBadge status={ach.approval_status} />
                                        </td>
                                        <td style={{ maxWidth: '240px' }}>
                                            <span style={{ fontSize: '0.8rem', color: ach.review_comment ? '#334155' : '#94a3b8' }}>
                                                {ach.review_comment || 'Pending faculty review'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={() => setSelectedCert(ach)}
                                                title="View Certificate"
                                            >
                                                <FileText size={14} /> Preview
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Certificate Preview Modal */}
            <CertificateModal
                isOpen={!!selectedCert}
                onClose={() => setSelectedCert(null)}
                achievement={selectedCert}
            />
        </div>
    );
};

export default StudentDashboard;
