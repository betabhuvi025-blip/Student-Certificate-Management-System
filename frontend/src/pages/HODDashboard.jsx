import React, { useState, useEffect } from 'react';
import {
    Users,
    Award,
    CheckCircle,
    TrendingUp,
    BarChart3,
    PieChart as PieIcon,
    Calendar,
    Download,
    ChevronRight,
    Trophy
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import api from '../api/client';
import StatCard from '../components/StatCard';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const HODDashboard = ({ onNavigateApprovals, onNavigateReports, onNavigateLeaderboard }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [yearFilter, setYearFilter] = useState('');
    const [sectionFilter, setSectionFilter] = useState('');

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const params = {};
            if (yearFilter) params.year = yearFilter;
            if (sectionFilter) params.section = sectionFilter;

            const res = await api.get('/analytics/department', params);
            setAnalytics(res);
        } catch (err) {
            console.error('Failed to load department analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, [yearFilter, sectionFilter]);

    const summary = analytics?.summary || {};
    const totalSubmissions = parseInt(summary.total_submissions || 0);
    const approvedCount = parseInt(summary.approved_count || 0);
    const pendingCount = parseInt(summary.pending_count || 0);
    const approvalRate = totalSubmissions > 0 ? Math.round((approvedCount / totalSubmissions) * 100) : 0;
    const totalPoints = parseInt(summary.total_points || 0);

    // 1. Trend Line Chart Config
    const trendData = analytics?.trend || [];
    const lineChartData = {
        labels: trendData.length > 0 ? trendData.map(t => t.month) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Event Submissions',
                data: trendData.length > 0 ? trendData.map(t => t.count) : [2, 5, 8, 4, 9, 12],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.35,
                pointBackgroundColor: '#1e3a8a',
                pointRadius: 4
            }
        ]
    };

    // 2. Category Pie / Doughnut Config
    const catData = analytics?.categoryDistribution || [];
    const catColors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    const doughnutChartData = {
        labels: catData.map(c => c.category),
        datasets: [
            {
                data: catData.map(c => c.count),
                backgroundColor: catColors.slice(0, catData.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
    };

    // 3. Year-wise Bar Chart Config
    const yearData = analytics?.yearDistribution || [];
    const barChartData = {
        labels: yearData.map(y => y.year || 'Unknown'),
        datasets: [
            {
                label: 'Total Submissions',
                data: yearData.map(y => y.submission_count || 0),
                backgroundColor: '#3b82f6',
                borderRadius: 6
            },
            {
                label: 'Approved Submissions',
                data: yearData.map(y => y.approved_count || 0),
                backgroundColor: '#10b981',
                borderRadius: 6
            }
        ]
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <BarChart3 size={24} color="var(--primary-500)" /> Departmental Analytics &amp; Executive Overview
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Real-time student participation metrics, approval workflows, and achievement trends for IT Department.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <select
                        className="form-select"
                        style={{ width: '130px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                    >
                        <option value="">All Years</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                    </select>

                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={onNavigateReports}
                    >
                        <Download size={14} /> Export Reports
                    </button>
                </div>
            </div>

            {/* KPI Stat Cards */}
            <div className="stats-grid">
                <StatCard
                    icon={Users}
                    label="Registered IT Students"
                    value={analytics?.studentCount || 0}
                    subtext="Active student records"
                    color="blue"
                />
                <StatCard
                    icon={Award}
                    label="Total Achievements"
                    value={totalSubmissions}
                    subtext={`${approvedCount} verified entries`}
                    color="emerald"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Approval Rate"
                    value={`${approvalRate}%`}
                    subtext={`${pendingCount} awaiting verification`}
                    color="amber"
                />
                <StatCard
                    icon={Trophy}
                    label="Department Activity Points"
                    value={`${totalPoints} pts`}
                    subtext="Across all approved events"
                    color="purple"
                />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
                {/* Participation Trend Line Chart */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Participation Trend Over Time</h3>
                            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Monthly submission velocity</p>
                        </div>
                    </div>
                    <div style={{ height: 260, position: 'relative' }}>
                        <Line
                            data={lineChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { precision: 0 } },
                                    x: { grid: { display: false } }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Category Breakdown Pie Chart */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Category-Wise Distribution</h3>
                            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Hackathons, workshops, NPTEL, etc.</p>
                        </div>
                    </div>
                    <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {catData.length === 0 ? (
                            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No category data</div>
                        ) : (
                            <Doughnut
                                data={doughnutChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } }
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Year-Wise Distribution & Top Performers Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
                {/* Year-Wise Bar Chart */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Year-Wise Student Participation</h3>
                            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Submissions and approvals by academic year</p>
                        </div>
                    </div>
                    <div style={{ height: 250 }}>
                        <Bar
                            data={barChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } } },
                                scales: {
                                    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { precision: 0 } },
                                    x: { grid: { display: false } }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Top-Performing Students Leaderboard Table */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Top-Performing Students</h3>
                            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Current semester activity points leaders</p>
                        </div>
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={onNavigateLeaderboard}
                        >
                            Full Leaderboard
                        </button>
                    </div>

                    {(!analytics?.topStudents || analytics.topStudents.length === 0) ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                            No student points recorded yet.
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Student & Roll</th>
                                        <th>Year & Sec</th>
                                        <th>Wins</th>
                                        <th>Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.topStudents.slice(0, 5).map((s, idx) => (
                                        <tr key={s.id}>
                                            <td>
                                                <span style={{
                                                    fontWeight: 800,
                                                    fontSize: '0.9rem',
                                                    color: idx === 0 ? '#d97706' : idx === 1 ? 'var(--text-muted)' : idx === 2 ? '#b45309' : 'var(--text-main)'
                                                }}>
                                                    #{idx + 1}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.roll_no || 'N/A'}</div>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                                                    {s.year || 'N/A'} ({s.section || 'A'})
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1d4ed8' }}>
                                                    {s.wins || 0}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{
                                                    fontWeight: 800,
                                                    color: '#059669',
                                                    fontSize: '0.92rem'
                                                }}>
                                                    {s.points || 0} pts
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HODDashboard;
