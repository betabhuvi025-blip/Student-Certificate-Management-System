import React from 'react';
import { X, Download, ExternalLink, Award } from 'lucide-react';

const CertificateModal = ({ isOpen, onClose, achievement }) => {
    if (!isOpen || !achievement) return null;

    const certUrl = achievement.certificate_url || '';
    const isPdf = certUrl.toLowerCase().endsWith('.pdf');

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: '850px' }} onClick={e => e.stopPropagation()}>
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
                            <Award size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Certificate Verification</h3>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                                {achievement.title} &bull; {achievement.category}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '1rem',
                        minHeight: '380px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}>
                        {isPdf ? (
                            <div style={{ width: '100%', height: '500px' }}>
                                <iframe
                                    src={certUrl}
                                    title="Certificate PDF"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 'none', borderRadius: '8px' }}
                                />
                            </div>
                        ) : (
                            <img
                                src={certUrl}
                                alt="Certificate"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '520px',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    objectFit: 'contain'
                                }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364748b">Certificate preview unavailable</text></svg>';
                                }}
                            />
                        )}
                    </div>

                    <div style={{
                        marginTop: '1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'var(--bg-card-subtle)',
                        padding: '0.85rem 1.25rem',
                        borderRadius: '10px',
                        fontSize: '0.85rem'
                    }}>
                        <div style={{ textAlign: 'left' }}>
                            <span style={{ fontWeight: 600, color: 'var(--slate-600)' }}>Student: </span>
                            <span style={{ color: 'var(--text-main)' }}>{achievement.student_name || 'N/A'}</span>
                            {achievement.student_roll_no && (
                                <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({achievement.student_roll_no})</span>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <a
                                href={certUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-secondary btn-sm"
                            >
                                <ExternalLink size={14} /> Open in New Tab
                            </a>
                            <a
                                href={certUrl}
                                download
                                className="btn btn-primary btn-sm"
                            >
                                <Download size={14} /> Download
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateModal;
