import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'info', // 'success', 'danger', 'info'
    confirmText = 'Confirm',
    requireComment = false,
    commentPlaceholder = 'Add your remarks...',
    loading = false
}) => {
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (requireComment && !comment.trim()) {
            setError('Please provide remarks/reason.');
            return;
        }
        setError('');
        onConfirm(comment);
    };

    const typeIcons = {
        success: <CheckCircle size={24} color="#059669" />,
        danger: <AlertTriangle size={24} color="#e11d48" />,
        info: <HelpCircle size={24} color="#2563eb" />
    };

    const confirmBtnClass = type === 'danger' ? 'btn-danger' : type === 'success' ? 'btn-success' : 'btn-primary';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {typeIcons[type]}
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body">
                    <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                        {message}
                    </p>

                    {(requireComment || commentPlaceholder) && (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>
                                Remarks / Feedback {requireComment && <span style={{ color: '#e11d48' }}>*</span>}
                            </label>
                            <textarea
                                className="form-textarea"
                                rows={3}
                                value={comment}
                                onChange={(e) => {
                                    setComment(e.target.value);
                                    if (error) setError('');
                                }}
                                placeholder={commentPlaceholder}
                            />
                            {error && <p className="form-error">{error}</p>}
                        </div>
                    )}
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
                        type="button"
                        className={`btn ${confirmBtnClass} btn-sm`}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
