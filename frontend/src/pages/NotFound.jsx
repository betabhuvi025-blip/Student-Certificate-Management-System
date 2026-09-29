import React from 'react';
import { AlertCircle, Home } from 'lucide-react';

const NotFound = ({ onGoHome }) => {
    return (
        <div style={{
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <div style={{ maxWidth: '450px' }}>
                <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: '#fff1f2',
                    color: '#e11d48',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem auto'
                }}>
                    <AlertCircle size={36} />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
                    404
                </h1>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-600)', margin: '0 0 0.75rem 0' }}>
                    Page Not Found
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    The page or resource you requested could not be located on the Certificate Tracker academic portal.
                </p>
                <button
                    className="btn btn-primary"
                    onClick={onGoHome}
                >
                    <Home size={18} /> Return to Dashboard
                </button>
            </div>
        </div>
    );
};

export default NotFound;
