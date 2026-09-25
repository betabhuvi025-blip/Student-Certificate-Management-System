import React from 'react';

const StatusBadge = ({ status }) => {
    const s = (status || 'pending').toLowerCase();
    
    let label = 'Pending';
    let className = 'pending';

    if (s === 'approved') {
        label = 'Approved';
        className = 'approved';
    } else if (s === 'rejected') {
        label = 'Rejected';
        className = 'rejected';
    }

    return (
        <span className={`status-badge ${className}`}>
            <span className="status-dot"></span>
            {label}
        </span>
    );
};

export default StatusBadge;
