import React from 'react';

const StatCard = ({ icon: Icon, label, value, subtext, color = 'blue' }) => {
    const colorStyles = {
        blue: { bg: '#eff6ff', text: '#2563eb' },
        emerald: { bg: '#ecfdf5', text: '#059669' },
        amber: { bg: '#fffbeb', text: '#d97706' },
        rose: { bg: '#fff1f2', text: '#e11d48' },
        purple: { bg: '#faf5ff', text: '#9333ea' }
    };

    const style = colorStyles[color] || colorStyles.blue;

    return (
        <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ backgroundColor: style.bg, color: style.text }}>
                {Icon && <Icon size={24} />}
            </div>
            <div>
                <div className="stat-value">{value !== undefined ? value : 0}</div>
                <div className="stat-label">{label}</div>
                {subtext && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{subtext}</div>}
            </div>
        </div>
    );
};

export default StatCard;
