import React, { useState, useEffect } from 'react';
import {
    FileSpreadsheet,
    Printer,
    Download,
    Search,
    Filter,
    Calendar,
    FileText,
    CheckCircle,
    Building,
    Award
} from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

const CATEGORIES = ['All Categories', 'Hackathon', 'Workshop', 'NPTEL Course', 'Paper Presentation', 'Symposium', 'Other'];
const EVENT_TYPES = ['All Levels', 'Inter-College', 'Intra-College', 'National', 'International'];

const ReportsExport = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    // Filters
    const [year, setYear] = useState('');
    const [section, setSection] = useState('');
    const [category, setCategory] = useState('All Categories');
    const [eventType, setEventType] = useState('All Levels');
    const [status, setStatus] = useState('');
    const [approvalStatus, setApprovalStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [search, setSearch] = useState('');

    const loadRecords = async () => {
        try {
            setLoading(true);
            const params = {};
            if (year) params.year = year;
            if (section) params.section = section;
            if (category !== 'All Categories') params.category = category;
            if (eventType !== 'All Levels') params.event_type = eventType;
            if (status) params.status = status;
            if (approvalStatus) params.approval_status = approvalStatus;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (search.trim()) params.search = search.trim();

            const res = await api.get('/achievements', params);
            setAchievements(res.achievements || []);
        } catch (err) {
            console.error('Failed to load export records:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecords();
    }, [year, section, category, eventType, status, approvalStatus]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        loadRecords();
    };

    const handleExportCSV = async () => {
        try {
            setExporting(true);
            const params = {};
            if (year) params.year = year;
            if (section) params.section = section;
            if (category !== 'All Categories') params.category = category;
            if (eventType !== 'All Levels') params.event_type = eventType;
            if (status) params.status = status;
            if (approvalStatus) params.approval_status = approvalStatus;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (search.trim()) params.search = search.trim();

            await api.download('/export/csv', params, `student_achievements_report_${Date.now()}.csv`);
        } catch (err) {
            alert('Export failed: ' + (err.message || 'Error generating CSV'));
        } finally {
            setExporting(false);
        }
    };

    const handlePrintPDF = () => {
        window.print();
    };

    return (
        <div>
            {/* Header */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <FileSpreadsheet size={24} color="var(--emerald-500)" /> Reports &amp; Accreditation Export
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Filter student event submissions and export official records for NAAC, NBA, and departmental reviews.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={handlePrintPDF}
                    >
                        <Printer size={16} /> Print / Save as PDF
                    </button>
                    <button
                        className="btn btn-success btn-sm"
                        onClick={handleExportCSV}
                        disabled={exporting}
                    >
                        <Download size={16} /> {exporting ? 'Generating...' : 'Export to CSV'}
                    </button>
                </div>
            </div>

            {/* Print Header (Visible ONLY on PDF / Print) */}
            <div className="print-only" style={{ display: 'none', marginBottom: '1.5rem', borderBottom: '2px solid #0f172a', paddingBottom: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#1e3a8a' }}>
                        COLLEGE OF ENGINEERING &amp; TECHNOLOGY
                    </h1>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.2rem 0', color: '#334155' }}>
                        DEPARTMENT OF INFORMATION TECHNOLOGY
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                        Student Co-curricular Activity &amp; Achievement Record Report
                    </p>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                        Report Generated on {new Date().toLocaleDateString()} &bull; Total Filtered Records: {achievements.length}
                    </div>
                </div>
            </div>

            {/* Filter Controls (Hidden on Print) */}
            <div className="card no-print" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                <form onSubmit={handleSearchSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '0.85rem' }}>
                        <div>
                            <label className="form-label" style={{ fontSize: '0.78rem' }}>Search Keywords</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Student, roll, title..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="form-label" style={{ fontSize: '0.78rem' }}>Academic Year</label>
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

                        <div>
                            <label className="form-label" style={{ fontSize: '0.78rem' }}>Section</label>
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

                        <div>
                            <label className="form-label" style={{ fontSize: '0.78rem' }}>Category</label>
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

                        <div>
                            <label className="form-label" style={{ fontSize: '0.78rem' }}>Event Level</label>
                            <select
                                className="form-select"
                                value={eventType}
                                onChange={(e) => setEventType(e.target.value)}
                            >
                                {EVENT_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="form-label" style={{ fontSize: '0.78rem' }}>Approval Status</label>
                            <select
                                className="form-select"
                                value={approvalStatus}
                                onChange={(e) => setApprovalStatus(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2563eb' }}>
                            {achievements.length} Records Matching Filters
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => {
                                    setYear('');
                                    setSection('');
                                    setCategory('All Categories');
                                    setEventType('All Levels');
                                    setStatus('');
                                    setApprovalStatus('');
                                    setStartDate('');
                                    setEndDate('');
                                    setSearch('');
                                }}
                            >
                                Reset Filters
                            </button>
                            <button type="submit" className="btn btn-primary btn-sm">
                                Apply Filter
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Matched Records Table */}
            <div className="card">
                {achievements.length === 0 ? (
                    <EmptyState
                        title="No records matching filter parameters"
                        description="Try loosening your search criteria or resetting filters to see more results."
                    />
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student &amp; Roll No</th>
                                    <th>Year &amp; Sec</th>
                                    <th>Achievement Title</th>
                                    <th>Category</th>
                                    <th>Event Level</th>
                                    <th>Result</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Reviewed By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {achievements.map((ach, idx) => (
                                    <tr key={ach.id}>
                                        <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{idx + 1}</td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{ach.student_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ach.student_roll_no || 'N/A'}</div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--slate-600)' }}>
                                                {ach.student_year || 'N/A'} ({ach.student_section || 'A'})
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--text-main)', maxWidth: '220px' }}>
                                                {ach.title}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '0.82rem', color: '#334155' }}>
                                                {ach.category}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                                {ach.event_type}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                color: ach.status === 'win' ? '#1d4ed8' : '#059669',
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
                                        <td>
                                            <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                                                {ach.reviewer_name || 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Print Signature Footer (Print only) */}
            <div className="print-only" style={{ display: 'none', marginTop: '3.5rem', display: 'flex', justifyContent: 'space-between', padding: '0 2rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 180, borderBottom: '1.5px solid #0f172a', marginBottom: '0.5rem' }}></div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Faculty Advisor</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Dept. of Information Technology</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 180, borderBottom: '1.5px solid #0f172a', marginBottom: '0.5rem' }}></div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Head of Department</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Dept. of Information Technology</div>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    .top-navbar, .sidebar { display: none !important; }
                    .page-wrapper { padding: 0 !important; }
                    .card { box-shadow: none !important; border: none !important; }
                }
            `}</style>
        </div>
    );
};

export default ReportsExport;
