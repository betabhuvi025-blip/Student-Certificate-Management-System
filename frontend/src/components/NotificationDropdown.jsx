import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Award, AlertCircle, Info } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
};

const NotificationDropdown = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (message) => {
        if (message.includes('APPROVED')) return <Award size={16} color="#059669" />;
        if (message.includes('REJECTED')) return <AlertCircle size={16} color="#e11d48" />;
        return <Info size={16} color="#2563eb" />;
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                className="btn btn-outline"
                style={{
                    position: 'relative',
                    padding: '0.5rem',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onClick={() => setIsOpen(!isOpen)}
                title="Notifications"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: 360,
                    background: '#ffffff',
                    borderRadius: '14px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    zIndex: 60,
                    overflow: 'hidden',
                    animation: 'scaleIn 0.15s ease'
                }}>
                    <div style={{
                        padding: '0.85rem 1rem',
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#f8fafc'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Notifications</span>
                            {unreadCount > 0 && (
                                <span style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    background: '#eff6ff',
                                    color: '#2563eb',
                                    padding: '0.1rem 0.45rem',
                                    borderRadius: '9999px'
                                }}>
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#2563eb',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => markAsRead(n.id)}
                                    style={{
                                        padding: '0.85rem 1rem',
                                        borderBottom: '1px solid #f8fafc',
                                        background: n.is_read ? '#ffffff' : '#f0f7ff',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s ease',
                                        display: 'flex',
                                        gap: '0.75rem',
                                        alignItems: 'flex-start'
                                    }}
                                >
                                    <div style={{ marginTop: '2px', flexShrink: 0 }}>
                                        {getIcon(n.message)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            fontSize: '0.83rem',
                                            color: n.is_read ? '#475569' : '#0f172a',
                                            fontWeight: n.is_read ? 400 : 500,
                                            lineHeight: 1.4,
                                            margin: 0
                                        }}>
                                            {n.message}
                                        </p>
                                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                                            {formatTimeAgo(n.created_at)}
                                        </span>
                                    </div>
                                    {!n.is_read && (
                                        <div style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: '#3b82f6',
                                            marginTop: '6px',
                                            flexShrink: 0
                                        }} />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
