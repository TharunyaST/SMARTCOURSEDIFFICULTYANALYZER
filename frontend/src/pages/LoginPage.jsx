import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/apiState';
import { 
    Brain, 
    ChartLine, 
    Shield, 
    Bell, 
    Mail, 
    Lock, 
    ArrowRight, 
    User,
    GraduationCap,
    Presentation,
    ArrowLeft
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const LoginPage = () => {
    const [isSignIn, setIsSignIn] = useState(true);
    const [role, setRole] = useState('Student');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignIn) {
                const data = await ApiService.login(formData.email, formData.password);
                if (data.success) {
                    login(data.user);
                    navigate('/dashboard');
                } else {
                    setError(data.message || 'Login failed');
                }
            } else {
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    setLoading(false);
                    return;
                }
                const data = await ApiService.register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: role
                });
                if (data.success) {
                    login(data.user);
                    navigate('/dashboard');
                } else {
                    setError(data.message || 'Registration failed');
                }
            }
        } catch (err) {
            setError('Connection error. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-body">
            <div className="theme-switch-wrapper">
                <ThemeToggle />
            </div>
            <div className="login-split">
                {/* Left: Branding Panel */}
                <div className="login-brand-panel">
                    <div className="brand-content">
                        <div className="brand-logo">
                            <Brain size={32} />
                        </div>
                        <h1 className="brand-title">SCDA</h1>
                        <p className="brand-tagline">Smart Course Difficulty Analyzer</p>
                        
                        <div className="brand-features">
                            <BrandFeature icon={<ChartLine />} title="Real-time Analytics" desc="Track difficulty trends instantly" />
                            <BrandFeature icon={<Shield />} title="Secure Portal" desc="Role-based access for safety" />
                            <BrandFeature icon={<Bell />} title="Live Notifications" desc="Stay updated on new feedback" />
                        </div>
                    </div>
                    {/* Decorative shapes */}
                    <div className="brand-shape shape-1"></div>
                    <div className="brand-shape shape-2"></div>
                    <div className="brand-shape shape-3"></div>
                </div>

                {/* Right: Form Panel */}
                <div className="login-form-panel">
                    <div className="login-form-inner">
                        {/* Auth Tab Switcher */}
                        <div className="auth-tabs">
                            <button 
                                className={`auth-tab ${isSignIn ? 'active' : ''}`} 
                                onClick={() => setIsSignIn(true)}
                            >
                                <span>Sign In</span>
                            </button>
                            <button 
                                className={`auth-tab ${!isSignIn ? 'active' : ''}`} 
                                onClick={() => setIsSignIn(false)}
                            >
                                <span>Sign Up</span>
                            </button>
                            <div 
                                className="auth-tab-indicator" 
                                style={{ transform: isSignIn ? 'translateX(0)' : 'translateX(calc(100% + 4px))' }}
                            ></div>
                        </div>

                        <div className="login-header">
                            <h2>{isSignIn ? 'Welcome back' : 'Create Account'}</h2>
                            <p>{isSignIn ? 'Sign in to continue to your dashboard' : 'Join SCDA and start analyzing courses'}</p>
                        </div>

                        {error && (
                            <div className="alert-item unread" style={{ marginBottom: '20px', padding: '10px', borderRadius: '10px', color: 'var(--danger-color)', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}

                        <div className="role-selector">
                            <button 
                                className={`role-chip ${role === 'Student' ? 'active' : ''}`} 
                                onClick={() => setRole('Student')}
                            >
                                <GraduationCap size={18} />
                                <span>Student</span>
                            </button>
                            <button 
                                className={`role-chip ${role === 'Teacher' ? 'active' : ''}`} 
                                onClick={() => setRole('Teacher')}
                            >
                                <Presentation size={18} />
                                <span>Teacher</span>
                            </button>
                        </div>

                        <form className="login-form" onSubmit={handleAuth}>
                            {!isSignIn && (
                                <div className="input-group">
                                    <div className="input-icon"><User size={18} /></div>
                                    <input 
                                        type="text" 
                                        id="name" 
                                        placeholder="Full Name" 
                                        value={formData.name}
                                        onChange={handleChange}
                                        required 
                                    />
                                </div>
                            )}
                            <div className="input-group">
                                <div className="input-icon"><Mail size={18} /></div>
                                <input 
                                    type="email" 
                                    id="email" 
                                    placeholder="name@gmail.com" 
                                    value={formData.email}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                            <div className="input-group">
                                <div className="input-icon"><Lock size={18} /></div>
                                <input 
                                    type="password" 
                                    id="password" 
                                    placeholder="Password" 
                                    value={formData.password}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                            {!isSignIn && (
                                <div className="input-group">
                                    <div className="input-icon"><Shield size={18} /></div>
                                    <input 
                                        type="password" 
                                        id="confirmPassword" 
                                        placeholder="Confirm Password" 
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required 
                                    />
                                </div>
                            )}

                            <button type="submit" className="btn btn-block" disabled={loading} style={{ 
                                background: 'linear-gradient(135deg, var(--primary-color), #7c3aed)',
                                height: '50px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                border: 'none',
                                color: 'white',
                                fontWeight: 700,
                                borderRadius: '13px',
                                cursor: 'pointer'
                            }}>
                                <span>{loading ? 'Processing...' : (isSignIn ? 'Sign In' : 'Create Account')}</span>
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </form>

                        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
                            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                                <ArrowLeft size={16} />
                                <span>Back to Home</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BrandFeature = ({ icon, title, desc }) => (
    <div className="brand-feature" style={{ opacity: 1 }}>
        <div className="bf-icon">{icon}</div>
        <div className="bf-text">
            <strong>{title}</strong>
            <span>{desc}</span>
        </div>
    </div>
);

export default LoginPage;
