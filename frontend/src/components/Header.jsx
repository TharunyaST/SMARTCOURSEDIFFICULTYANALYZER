import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/apiState';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Header = ({ title }) => {
    const { user, isTeacher } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);

    useEffect(() => {
        if (isTeacher()) {
            loadNotifications();
        }
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await ApiService.getNotifications();
            setNotifications(data);
        } catch (err) {
            console.error("Failed to load notifications", err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await ApiService.markNotificationRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error("Failed to mark read", err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await ApiService.deleteNotification(id);
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (err) {
            console.error("Failed to delete notification", err);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="top-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h2 style={{ margin: 0 }}>{title}</h2>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div className="user-info">
                    Logged in as: <span style={{ fontWeight: 600, marginLeft: '5px' }}>{user?.role}</span>
                </div>

                {isTeacher() && (
                    <div style={{ position: 'relative' }}>
                        <button className="notification-toggle-btn" onClick={() => setShowNotifs(!showNotifs)}>
                            <Bell size={22} className={unreadCount > 0 ? "bell-ringing" : ""} color={unreadCount > 0 ? "#f59e0b" : "currentColor"} />
                            {unreadCount > 0 && (
                                <span className="notification-badge-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        
                        {showNotifs && (
                            <div className="card" style={{ 
                                position: 'absolute', top: '55px', right: 0, 
                                width: '300px', maxHeight: '400px', overflowY: 'auto', 
                                zIndex: 1000, textAlign: 'left', padding: '15px' 
                            }}>
                                <h4 style={{ marginBottom: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                                    Notifications
                                </h4>
                                <div>
                                    {notifications.length === 0 ? (
                                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>No notifications.</p>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n.id} style={{ marginBottom: '10px', padding: '10px', borderRadius: '8px', background: n.is_read ? 'transparent' : 'rgba(var(--primary-h), 77%, 62%, 0.1)', border: '1px solid var(--glass-border)' }}>
                                                <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', lineHeight: '1.4' }}>{n.message}</p>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{new Date(n.created_at).toLocaleString()}</small>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        {!n.is_read && (
                                                            <button 
                                                                onClick={() => markAsRead(n.id)} 
                                                                title="Mark as Read" 
                                                                style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', cursor: 'pointer', color: '#10b981', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 600, transition: 'all 0.2s' }}
                                                                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                                                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                            >
                                                                <CheckCheck size={14} /> <span>✨ Seen</span>
                                                            </button>
                                                        )}
                                                        <button onClick={() => deleteNotification(n.id)} title="Delete Notification" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, display: 'flex' }}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <ThemeToggle />
            </div>
        </div>
    );
};

export default Header;
