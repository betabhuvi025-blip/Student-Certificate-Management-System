import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Search, Filter, Sparkles, Award } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';

const Leaderboard = () => {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState('');
    const [section, setSection] = useState('');
    const [search, setSearch] = useState('');

    const loadLeaderboard = async () => {
        try {
            setLoading(true);
            const params = {};
            if (year) params.year = year;
            if (section) params.section = section;
            if (search.trim()) params.search = search.trim();

            const res = await api.get('/analytics/leaderboard', params);
            setLeaderboard(res.leaderboard || []);
        } catch (err) {
            console.error('Failed to load leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeaderboard();
    }, [year, section]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        loadLeaderboard();
    };

    const topThree = leaderboard.slice(0, 3);

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Trophy size={24} color="#d97706" /> Student Points Leaderboard
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Recognizing top co-curricular achievers: 10 pts per Win &bull; 5 pts per Participation (Verified achievements).
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: '1 1 220px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                        <input
                            type="text"
                            className="form-input"
                            style={{ paddingLeft: '2.4rem' }}
                            placeholder="Search by student name or roll..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div style={{ flex: '0 1 150px' }}>
                        <select
                            className="form-select"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                        >
                            <option value="">All Academic Years</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                        </select>
                    </div>

                    <div style={{ flex: '0 1 130px' }}>
                        <select
                            className="form-select"
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                        >
                            <option value="">All Sections</option>
                            <option value="A">Section A</option>
                            <option value="B">Section B</option>
                            <option value="C">Section C</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-secondary btn-sm" style={{ height: '38px' }}>
                        Filter
                    </button>
                </form>
            </div>

            {/* Top 3 Podium Cards */}
            {topThree.length >= 1 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '1.25rem',
                    marginBottom: '1.75rem'
                }}>
                    {/* 1st Place */}
                    {topThree[0] && (
                        <div className="card" style={{
                            background: 'linear-gradient(135deg, #fffbeb, #ffffff)',
                            border: '2px solid #fde68a',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                fontSize: '1.5rem'
                            }}>
                                🥇
                            </div>
                            <div className="user-avatar" style={{
                                width: 56,
                                height: 56,
                                margin: '0 auto 0.75rem auto',
                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                fontSize: '1.3rem'
                            }}>
                                {topThree[0].name.charAt(0)}
                            </div>
                            <div style={{
                                display: 'inline-block',
                                background: '#fef3c7',
                                color: '#b45309',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                padding: '0.2rem 0.6rem',
                                borderRadius: '9999px',
                                textTransform: 'uppercase',
                                marginBottom: '0.5rem'
                            }}>
                                1st Place Rank
                            </div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
                                {topThree[0].name}
                            </h3>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                {topThree[0].roll_no || 'N/A'} &bull; {topThree[0].year} ({topThree[0].section})
                            </div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#b45309' }}>
                                {topThree[0].points} pts
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '0.2rem' }}>
                                {topThree[0].wins_count || 0} Wins &bull; {topThree[0].participated_count || 0} Participations
                            </div>
                        </div>
                    )}

                    {/* 2nd Place */}
                    {topThree[1] && (
                        <div className="card" style={{
                            background: 'linear-gradient(135deg, #f8fafc, #ffffff)',
                            border: '2px solid #e2e8f0',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: 12, right: 12, fontSize: '1.5rem' }}>
                                🥈
                            </div>
                            <div className="user-avatar" style={{
                                width: 56,
                                height: 56,
                                margin: '0 auto 0.75rem auto',
                                background: 'linear-gradient(135deg, #64748b, #475569)',
                                fontSize: '1.3rem'
                            }}>
                                {topThree[1].name.charAt(0)}
                            </div>
                            <div style={{
                                display: 'inline-block',
                                background: '#f1f5f9',
                                color: '#475569',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                padding: '0.2rem 0.6rem',
                                borderRadius: '9999px',
                                textTransform: 'uppercase',
                                marginBottom: '0.5rem'
                            }}>
                                2nd Place Rank
                            </div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
                                {topThree[1].name}
                            </h3>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                {topThree[1].roll_no || 'N/A'} &bull; {topThree[1].year} ({topThree[1].section})
                            </div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#334155' }}>
                                {topThree[1].points} pts
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                                {topThree[1].wins_count || 0} Wins &bull; {topThree[1].participated_count || 0} Participations
                            </div>
                        </div>
                    )}

                    {/* 3rd Place */}
                    {topThree[2] && (
                        <div className="card" style={{
                            background: 'linear-gradient(135deg, #fff7ed, #ffffff)',
                            border: '2px solid #fed7aa',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: 12, right: 12, fontSize: '1.5rem' }}>
                                🥉
                            </div>
                            <div className="user-avatar" style={{
                                width: 56,
                                height: 56,
                                margin: '0 auto 0.75rem auto',
                                background: 'linear-gradient(135deg, #c2410c, #9a3412)',
                                fontSize: '1.3rem'
                            }}>
                                {topThree[2].name.charAt(0)}
                            </div>
                            <div style={{
                                display: 'inline-block',
                                background: '#ffedd5',
                                color: '#9a3412',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                padding: '0.2rem 0.6rem',
                                borderRadius: '9999px',
                                textTransform: 'uppercase',
                                marginBottom: '0.5rem'
                            }}>
                                3rd Place Rank
                            </div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
                                {topThree[2].name}
                            </h3>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                {topThree[2].roll_no || 'N/A'} &bull; {topThree[2].year} ({topThree[2].section})
                            </div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c2410c' }}>
                                {topThree[2].points} pts
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#9a3412', marginTop: '0.2rem' }}>
                                {topThree[2].wins_count || 0} Wins &bull; {topThree[2].participated_count || 0} Participations
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Full Leaderboard Table */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <h3 className="card-title">Complete Department Standings</h3>
                        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                            All ranked students in IT Department
                        </p>
                    </div>
                </div>

                {leaderboard.length === 0 ? (
                    <EmptyState
                        title="No students on leaderboard"
                        description="Once student achievements are approved by faculty, activity points and rankings will populate here."
                    />
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '80px' }}>Rank</th>
                                    <th>Student Name</th>
                                    <th>Roll Number</th>
                                    <th>Academic Class</th>
                                    <th>Wins (10 pts)</th>
                                    <th>Participated (5 pts)</th>
                                    <th>Approved Entries</th>
                                    <th>Total Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map(student => {
                                    const isCurrentUser = user && user.id === student.id;
                                    return (
                                        <tr
                                            key={student.id}
                                            style={{
                                                background: isCurrentUser ? '#eff6ff' : undefined,
                                                fontWeight: isCurrentUser ? 600 : 400
                                            }}
                                        >
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : ''}
                                                    <span style={{
                                                        fontWeight: 800,
                                                        color: student.rank <= 3 ? '#b45309' : '#475569',
                                                        fontSize: '0.92rem'
                                                    }}>
                                                        #{student.rank}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div className="user-avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span style={{ color: 'var(--text-main)' }}>{student.name}</span>
                                                        {isCurrentUser && (
                                                            <span style={{
                                                                marginLeft: '0.4rem',
                                                                fontSize: '0.7rem',
                                                                background: '#2563eb',
                                                                color: 'white',
                                                                padding: '0.1rem 0.4rem',
                                                                borderRadius: '4px'
                                                            }}>
                                                                You
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontFamily: 'monospace', color: '#1e3a8a', fontWeight: 600 }}>
                                                    {student.roll_no || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                                                    {student.year || 'N/A'} &bull; Sec {student.section || 'A'}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 700, color: '#1d4ed8' }}>
                                                    {student.wins_count || 0}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 600, color: '#059669' }}>
                                                    {student.participated_count || 0}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ color: '#334155' }}>
                                                    {student.approved_count || 0}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{
                                                    fontSize: '1rem',
                                                    fontWeight: 800,
                                                    color: '#047857'
                                                }}>
                                                    {student.points || 0} pts
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
