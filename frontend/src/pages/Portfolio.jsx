import React, { useState, useEffect } from 'react';
import {
    Award,
    Plus,
    Search,
    Filter,
    FileText,
    Edit2,
    Trash2,
    Calendar,
    Tag,
    Globe,
    CheckCircle,
    Clock,
    AlertCircle
} from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import CertificateModal from '../components/CertificateModal';
import ConfirmationModal from '../components/ConfirmationModal';
import EmptyState from '../components/EmptyState';

const CATEGORIES = ['All Categories', 'Hackathon', 'Workshop', 'NPTEL Course', 'Paper Presentation', 'Symposium', 'Other'];
const APPROVAL_STATUSES = ['All Statuses', 'approved', 'pending', 'rejected'];

const Portfolio = ({ onOpenAddModal, onEditAchievement }) => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All Categories');
    const [status, setStatus] = useState('All Statuses');

    const [selectedCert, setSelectedCert] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const loadAchievements = async () => {
        try {
            setLoading(true);
            const params = {};
            if (category !== 'All Categories') params.category = category;
            if (status !== 'All Statuses') params.approval_status = status;
            if (search.trim()) params.search = search.trim();

            const res = await api.get('/achievements', params);
            setAchievements(res.achievements || []);
        } catch (err) {
            console.error('Failed to load portfolio:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAchievements();
    }, [category, status]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        loadAchievements();
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            await api.delete(`/achievements/${deleteTarget.id}`);
            setDeleteTarget(null);
            loadAchievements();
        } catch (err) {
            alert(err.message || 'Failed to delete achievement.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        My Achievement Portfolio
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Manage your co-curricular records, verified certificates, and track approval feedback.
                    </p>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={onOpenAddModal}
                >
                    <Plus size={18} /> Add Achievement
                </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: '1 1 240px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                        <input
                            type="text"
                            className="form-input"
                            style={{ paddingLeft: '2.4rem' }}
                            placeholder="Search by title, keywords..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div style={{ flex: '0 1 180px' }}>
                        <select
                            className="form-select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {CATEGORIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ flex: '0 1 160px' }}>
                        <select
                            className="form-select"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            {APPROVAL_STATUSES.map(s => (
                                <option key={s} value={s}>
                                    {s === 'All Statuses' ? 'All Statuses' : s.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="btn btn-secondary btn-sm" style={{ height: '38px' }}>
                        Filter
                    </button>
                </form>
            </div>

            {/* Achievements Cards Grid */}
            {achievements.length === 0 ? (
                <EmptyState
                    title="No achievements match your criteria"
                    description="Try adjusting your filter or search query, or add a new achievement entry."
                    actionLabel="Add Achievement Entry"
                    onAction={onOpenAddModal}
                />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
                    {achievements.map(ach => (
                        <div key={ach.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                    <span style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '9999px',
                                        background: '#eff6ff',
                                        color: '#1d4ed8',
                                        textTransform: 'uppercase'
                                    }}>
                                        {ach.category}
                                    </span>
                                    <StatusBadge status={ach.approval_status} />
                                </div>

                                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: 1.35 }}>
                                    {ach.title}
                                </h3>

                                {ach.description && (
                                    <p style={{
                                        fontSize: '0.84rem',
                                        color: 'var(--text-muted)',
                                        marginBottom: '1rem',
                                        lineHeight: 1.5,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {ach.description}
                                    </p>
                                )}

                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '0.75rem',
                                    fontSize: '0.78rem',
                                    color: '#64748b',
                                    marginBottom: '1rem',
                                    paddingTop: '0.75rem',
                                    borderTop: '1px solid #f1f5f9'
                                }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Calendar size={14} /> {ach.event_date}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Globe size={14} /> {ach.event_type}
                                    </span>
                                    <span style={{
                                        fontWeight: 700,
                                        color: ach.status === 'win' ? '#1d4ed8' : '#059669'
                                    }}>
                                        {ach.status === 'win' ? '🏆 Winner (10 pts)' : '🎖️ Participant (5 pts)'}
                                    </span>
                                </div>

                                {ach.review_comment && (
                                    <div style={{
                                        background: ach.approval_status === 'approved' ? '#f0fdf4' : '#fff1f2',
                                        border: `1px solid ${ach.approval_status === 'approved' ? '#bbf7d0' : '#fecdd3'}`,
                                        borderRadius: '8px',
                                        padding: '0.65rem 0.85rem',
                                        fontSize: '0.78rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <strong style={{ color: ach.approval_status === 'approved' ? '#15803d' : '#e11d48' }}>
                                            {ach.approval_status === 'approved' ? 'Faculty Remarks: ' : 'Rejection Reason: '}
                                        </strong>
                                        <span style={{ color: '#334155' }}>{ach.review_comment}</span>
                                    </div>
                                )}
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingTop: '0.75rem',
                                borderTop: '1px solid #f1f5f9'
                            }}>
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setSelectedCert(ach)}
                                >
                                    <FileText size={14} /> Certificate
                                </button>

                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => onEditAchievement(ach)}
                                        title="Edit Entry"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        style={{ color: '#e11d48' }}
                                        onClick={() => setDeleteTarget(ach)}
                                        title="Delete Entry"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Certificate Modal */}
            <CertificateModal
                isOpen={!!selectedCert}
                onClose={() => setSelectedCert(null)}
                achievement={selectedCert}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete Achievement Record"
                message={`Are you sure you want to delete "${deleteTarget?.title}"? This will permanently remove the record and certificate file.`}
                type="danger"
                confirmText="Yes, Delete Record"
                loading={deleting}
            />
        </div>
    );
};

export default Portfolio;
