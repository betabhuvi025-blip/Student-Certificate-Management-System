import React, { useState, useEffect } from 'react';
import {
    CheckSquare,
    CheckCircle,
    XCircle,
    Search,
    Filter,
    FileText,
    Calendar,
    GraduationCap,
    Clock,
    User,
    Globe
} from 'lucide-react';
import api from '../api/client';
import CertificateModal from '../components/CertificateModal';
import ConfirmationModal from '../components/ConfirmationModal';
import EmptyState from '../components/EmptyState';

const ApprovalsList = ({ onRefreshCounts }) => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState('');
    const [section, setSection] = useState('');
    const [category, setCategory] = useState('');
    const [search, setSearch] = useState('');

    const [selectedCert, setSelectedCert] = useState(null);
    const [reviewModal, setReviewModal] = useState({
        isOpen: false,
        achievement: null,
        action: 'approve' // 'approve' or 'reject'
    });
    const [submittingReview, setSubmittingReview] = useState(false);

    const loadPending = async () => {
        try {
            setLoading(true);
            const params = {};
            if (year) params.year = year;
            if (section) params.section = section;
            if (category) params.category = category;
            if (search.trim()) params.search = search.trim();

            const res = await api.get('/approvals/pending', params);
            setPending(res.pending || []);
            if (onRefreshCounts) onRefreshCounts();
        } catch (err) {
            console.error('Failed to load pending approvals:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPending();
    }, [year, section, category]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        loadPending();
    };

    const handleConfirmReview = async (comment) => {
        if (!reviewModal.achievement) return;
        try {
            setSubmittingReview(true);
            await api.post(`/approvals/${reviewModal.achievement.id}/review`, {
                action: reviewModal.action,
                comment: comment || ''
            });

            setReviewModal({ isOpen: false, achievement: null, action: 'approve' });
            await loadPending();
        } catch (err) {
            alert(err.message || 'Failed to submit review.');
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <CheckSquare size={24} color="#2563eb" /> Verification & Approval Queue
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                        Review submitted certificates, verify event authenticity, and approve activity points.
                    </p>
                </div>

                <div style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    padding: '0.45rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                }}>
                    <Clock size={16} /> {pending.length} Submissions Awaiting Review
                </div>
            </div>

            {/* Filter Bar */}
            <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: '1 1 200px', position: 'relative' }}>
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

                    <div style={{ flex: '0 1 140px' }}>
                        <select
                            className="form-select"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                        >
                            <option value="">All Years</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                        </select>
                    </div>

                    <div style={{ flex: '0 1 120px' }}>
                        <select
                            className="form-select"
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                        >
                            <option value="">All Sec</option>
                            <option value="A">Section A</option>
                            <option value="B">Section B</option>
                            <option value="C">Section C</option>
                        </select>
                    </div>

                    <div style={{ flex: '0 1 160px' }}>
                        <select
                            className="form-select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            <option value="Hackathon">Hackathon</option>
                            <option value="Workshop">Workshop</option>
                            <option value="NPTEL Course">NPTEL Course</option>
                            <option value="Paper Presentation">Paper Presentation</option>
                            <option value="Symposium">Symposium</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-secondary btn-sm" style={{ height: '38px' }}>
                        Filter
                    </button>
                </form>
            </div>

            {/* Pending Approvals List */}
            {pending.length === 0 ? (
                <EmptyState
                    icon={CheckCircle}
                    title="Queue is all clear!"
                    description="There are currently no pending student achievements awaiting verification."
                />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {pending.map(item => (
                        <div key={item.id} className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                                {/* Student Academic Badge */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div className="user-avatar" style={{ width: 44, height: 44, fontSize: '1rem' }}>
                                        {item.student_name ? item.student_name.charAt(0).toUpperCase() : 'S'}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                                            {item.student_name}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600, color: '#1e3a8a' }}>{item.student_roll_no || 'Roll: N/A'}</span>
                                            &bull;
                                            <span>{item.student_year || 'Year N/A'} - Sec {item.student_section || 'N/A'}</span>
                                            &bull;
                                            <span>{item.student_department || 'IT'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        padding: '0.25rem 0.65rem',
                                        borderRadius: '9999px',
                                        background: item.status === 'win' ? '#eff6ff' : '#ecfdf5',
                                        color: item.status === 'win' ? '#1d4ed8' : '#047857'
                                    }}>
                                        {item.status === 'win' ? '🏆 Winner Claim (10 Pts)' : '🎖️ Participation Claim (5 Pts)'}
                                    </span>
                                </div>
                            </div>

                            {/* Achievement Details */}
                            <div style={{
                                background: '#f8fafc',
                                borderRadius: '10px',
                                padding: '1rem 1.25rem',
                                marginBottom: '1rem',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                    <span style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        padding: '0.15rem 0.5rem',
                                        borderRadius: '4px',
                                        background: '#2563eb',
                                        color: 'white',
                                        textTransform: 'uppercase'
                                    }}>
                                        {item.category}
                                    </span>
                                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                        {item.title}
                                    </h4>
                                </div>

                                {item.description && (
                                    <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0.5rem 0', lineHeight: 1.5 }}>
                                        {item.description}
                                    </p>
                                )}

                                <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: '#64748b', marginTop: '0.65rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Calendar size={14} /> Event Date: <strong style={{ color: '#334155' }}>{item.event_date}</strong>
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Globe size={14} /> Level: <strong style={{ color: '#334155' }}>{item.event_type}</strong>
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Clock size={14} /> Submitted: {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* Actions Toolbar */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setSelectedCert(item)}
                                >
                                    <FileText size={16} /> Inspect Certificate Document
                                </button>

                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => setReviewModal({
                                            isOpen: true,
                                            achievement: item,
                                            action: 'reject'
                                        })}
                                    >
                                        <XCircle size={16} /> Reject with Remarks
                                    </button>

                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => setReviewModal({
                                            isOpen: true,
                                            achievement: item,
                                            action: 'approve'
                                        })}
                                    >
                                        <CheckCircle size={16} /> Approve Achievement
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Certificate Preview Modal */}
            <CertificateModal
                isOpen={!!selectedCert}
                onClose={() => setSelectedCert(null)}
                achievement={selectedCert}
            />

            {/* Review Action Confirmation Modal */}
            <ConfirmationModal
                isOpen={reviewModal.isOpen}
                onClose={() => setReviewModal({ isOpen: false, achievement: null, action: 'approve' })}
                onConfirm={handleConfirmReview}
                title={reviewModal.action === 'approve' ? 'Approve Student Achievement' : 'Reject Achievement Entry'}
                message={
                    reviewModal.action === 'approve'
                        ? `Confirm approval of "${reviewModal.achievement?.title}" submitted by ${reviewModal.achievement?.student_name}? This will award ${reviewModal.achievement?.status === 'win' ? '10' : '5'} points towards their leaderboard ranking.`
                        : `Please specify why "${reviewModal.achievement?.title}" is being rejected so ${reviewModal.achievement?.student_name} can take corrective action (e.g. invalid date, blur certificate, ineligible category).`
                }
                type={reviewModal.action === 'approve' ? 'success' : 'danger'}
                confirmText={reviewModal.action === 'approve' ? 'Approve & Credit Points' : 'Reject Submission'}
                requireComment={reviewModal.action === 'reject'}
                commentPlaceholder={reviewModal.action === 'approve' ? 'Optional congratulations remarks...' : 'Reason for rejection (required)...'}
                loading={submittingReview}
            />
        </div>
    );
};

export default ApprovalsList;
