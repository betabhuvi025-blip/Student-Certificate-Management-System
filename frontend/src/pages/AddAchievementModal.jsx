import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, PlusCircle } from 'lucide-react';
import api from '../api/client';

const CATEGORIES = ['Hackathon', 'Workshop', 'NPTEL Course', 'Paper Presentation', 'Symposium', 'Other'];
const EVENT_TYPES = ['Inter-College', 'Intra-College', 'National', 'International'];

const AddAchievementModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
    const isEdit = !!initialData;
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Hackathon');
    const [eventType, setEventType] = useState('National');
    const [status, setStatus] = useState('win');
    const [eventDate, setEventDate] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setCategory(initialData.category || 'Hackathon');
            setEventType(initialData.event_type || 'National');
            setStatus(initialData.status || 'win');
            setEventDate(initialData.event_date || '');
            setDescription(initialData.description || '');
            setFile(null);
            setFilePreview(initialData.certificate_url || null);
        } else {
            setTitle('');
            setCategory('Hackathon');
            setEventType('National');
            setStatus('win');
            setEventDate(new Date().toISOString().split('T')[0]);
            setDescription('');
            setFile(null);
            setFilePreview(null);
        }
        setErrors({});
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;

        // Validate size (5MB max)
        if (selected.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, file: 'File size exceeds 5MB limit. Please upload a smaller file.' }));
            return;
        }

        // Validate type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(selected.type)) {
            setErrors(prev => ({ ...prev, file: 'Only PDF, JPG, and PNG files are allowed.' }));
            return;
        }

        setErrors(prev => {
            const copy = { ...prev };
            delete copy.file;
            return copy;
        });

        setFile(selected);
        if (selected.type.startsWith('image/')) {
            setFilePreview(URL.createObjectURL(selected));
        } else {
            setFilePreview(null);
        }
    };

    const validate = () => {
        const errs = {};
        if (!title.trim()) errs.title = 'Achievement title is required';
        if (!eventDate) errs.eventDate = 'Event date is required';
        if (!isEdit && !file) errs.file = 'A certificate upload is required';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('category', category);
            formData.append('event_type', eventType);
            formData.append('status', status);
            formData.append('event_date', eventDate);
            formData.append('description', description.trim());
            if (file) {
                formData.append('certificate', file);
            }

            if (isEdit) {
                await api.put(`/achievements/${initialData.id}`, formData);
            } else {
                await api.post('/achievements', formData);
            }

            onSuccess();
            onClose();
        } catch (err) {
            setErrors(prev => ({ ...prev, general: err.message || 'Failed to save achievement.' }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '620px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: '8px',
                            background: '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <PlusCircle size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                                {isEdit ? 'Edit Achievement Record' : 'Add New Achievement Entry'}
                            </h3>
                            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                                Upload certificate and submit for faculty verification
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {errors.general && (
                            <div style={{
                                background: '#fff1f2',
                                color: '#e11d48',
                                border: '1px solid #fecdd3',
                                borderRadius: '8px',
                                padding: '0.75rem',
                                fontSize: '0.85rem',
                                marginBottom: '1.25rem'
                            }}>
                                {errors.general}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">
                                Achievement Title <span style={{ color: '#e11d48' }}>*</span>
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Smart India Hackathon 2026 - 1st Runner Up"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            {errors.title && <p className="form-error">{errors.title}</p>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Category</label>
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

                            <div className="form-group">
                                <label className="form-label">Event Level</label>
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
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Participation Type</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setStatus('win')}
                                        style={{
                                            flex: 1,
                                            padding: '0.65rem 0.5rem',
                                            borderRadius: '8px',
                                            border: status === 'win' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                                            background: status === 'win' ? '#eff6ff' : '#ffffff',
                                            color: status === 'win' ? '#1d4ed8' : '#64748b',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        🏆 Win (10 pts)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatus('participated')}
                                        style={{
                                            flex: 1,
                                            padding: '0.65rem 0.5rem',
                                            borderRadius: '8px',
                                            border: status === 'participated' ? '2px solid #059669' : '1px solid #cbd5e1',
                                            background: status === 'participated' ? '#ecfdf5' : '#ffffff',
                                            color: status === 'participated' ? '#047857' : '#64748b',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        🎖️ Participated (5 pts)
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Event Date <span style={{ color: '#e11d48' }}>*</span>
                                </label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                />
                                {errors.eventDate && <p className="form-error">{errors.eventDate}</p>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description / Summary of Contribution</label>
                            <textarea
                                className="form-textarea"
                                rows={3}
                                placeholder="Describe the project, competition problem statement, position secured, or skills demonstrated..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Certificate Upload Field */}
                        <div className="form-group">
                            <label className="form-label">
                                Certificate Upload (PDF, JPG, PNG &bull; Max 5MB) {!isEdit && <span style={{ color: '#e11d48' }}>*</span>}
                            </label>
                            
                            <div style={{
                                border: '2px dashed #cbd5e1',
                                borderRadius: '12px',
                                padding: '1.25rem',
                                textAlign: 'center',
                                background: '#f8fafc',
                                cursor: 'pointer',
                                transition: 'border-color 0.2s ease',
                                position: 'relative'
                            }}>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        opacity: 0,
                                        cursor: 'pointer',
                                        width: '100%',
                                        height: '100%'
                                    }}
                                />

                                {file ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                                        <FileText size={28} color="#2563eb" />
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
                                                {file.name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready to upload
                                            </div>
                                        </div>
                                    </div>
                                ) : filePreview ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                                        <CheckCircle size={24} color="#059669" />
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#059669' }}>
                                                Existing Certificate Attached
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                Click or drag here to replace certificate
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <Upload size={32} color="#94a3b8" style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
                                            Click to browse or drop certificate file here
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                            Supports official PDF e-certificates and high-res image scans
                                        </div>
                                    </div>
                                )}
                            </div>
                            {errors.file && <p className="form-error">{errors.file}</p>}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : isEdit ? 'Update Achievement' : 'Submit for Verification'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAchievementModal;
