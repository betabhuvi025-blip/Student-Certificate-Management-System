import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher = ({ compact = false }) => {
    const { theme, setTheme, themes, currentTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="theme-switcher-container" ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                type="button"
                className="theme-switcher-btn"
                onClick={() => setIsOpen(!isOpen)}
                title={`Active Theme: ${currentTheme.name}. Click to change.`}
                aria-label="Change Theme"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: compact ? '0.4rem' : '0.55rem',
                    padding: compact ? '0.4rem 0.65rem' : '0.45rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-xs)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    backdropFilter: 'blur(8px)'
                }}
            >
                <div
                    style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: currentTheme.previewGradient,
                        boxShadow: `0 0 8px ${currentTheme.accentColor}88`,
                        border: '1.5px solid rgba(255,255,255,0.6)',
                        flexShrink: 0
                    }}
                />
                {!compact && (
                    <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {currentTheme.name}
                    </span>
                )}
                <Palette size={15} style={{ opacity: 0.75, flexShrink: 0 }} />
            </button>

            {isOpen && (
                <div
                    className="theme-dropdown-menu"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        width: 290,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        boxShadow: 'var(--shadow-xl), 0 0 25px rgba(0,0,0,0.25)',
                        padding: '0.75rem',
                        zIndex: 999,
                        backdropFilter: 'blur(20px)',
                        animation: 'scaleIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                >
                    <div
                        style={{
                            padding: '0.35rem 0.5rem 0.65rem 0.5rem',
                            borderBottom: '1px solid var(--border-subtle, var(--border-color))',
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <Sparkles size={14} style={{ color: currentTheme.accentColor }} />
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                                Interface Theme
                            </span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            {themes.length} styles
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {themes.map((t) => {
                            const isSelected = t.id === theme;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => {
                                        setTheme(t.id);
                                        setIsOpen(false);
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.6rem 0.75rem',
                                        borderRadius: '10px',
                                        background: isSelected ? 'var(--slate-100)' : 'transparent',
                                        border: isSelected ? `1px solid ${t.accentColor}55` : '1px solid transparent',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.15s ease',
                                        color: 'var(--text-main)',
                                        width: '100%'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.background = 'var(--slate-50)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.background = 'transparent';
                                        }
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: '8px',
                                            background: t.previewGradient,
                                            flexShrink: 0,
                                            boxShadow: `0 2px 8px ${t.accentColor}44`,
                                            border: '1.5px solid rgba(255,255,255,0.4)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <span style={{ fontSize: '0.86rem', fontWeight: isSelected ? 700 : 600 }}>
                                                {t.name}
                                            </span>
                                            {t.badge && (
                                                <span
                                                    style={{
                                                        fontSize: '0.62rem',
                                                        fontWeight: 700,
                                                        padding: '0.1rem 0.35rem',
                                                        borderRadius: '4px',
                                                        background: `${t.accentColor}22`,
                                                        color: t.accentColor,
                                                        border: `1px solid ${t.accentColor}44`,
                                                        textTransform: 'uppercase'
                                                    }}
                                                >
                                                    {t.badge}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.2 }}>
                                            {t.subtitle}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div
                                            style={{
                                                width: 20,
                                                height: 20,
                                                borderRadius: '50%',
                                                background: t.accentColor,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#ffffff',
                                                flexShrink: 0
                                            }}
                                        >
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeSwitcher;
