import React from 'react';
import { FolderOpen } from 'lucide-react';

const EmptyState = ({
    icon: Icon = FolderOpen,
    title = 'No records found',
    description = 'There are no items to display right now.',
    actionLabel,
    onAction
}) => {
    return (
        <div className="empty-state">
            <div className="empty-icon">
                <Icon size={32} />
            </div>
            <h3 className="empty-title">{title}</h3>
            <p className="empty-desc">{description}</p>
            {actionLabel && onAction && (
                <button className="btn btn-primary btn-sm" onClick={onAction}>
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
