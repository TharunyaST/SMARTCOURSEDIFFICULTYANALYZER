import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, ArrowRight, ChartBar, PlayCircle, Users, Zap, FileText } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const LandingPage = () => {
    useEffect(() => {
        // Simple scroll effect for nav
        const handleScroll = () => {
            const nav = document.getElementById('landing-nav');
            if (window.scrollY > 50) {
                nav?.classList.add('scrolled');
            } else {
                nav?.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="landing-body">
            <nav className="landing-nav" id="landing-nav">
                <div className="nav-inner">
                    <Link to="/" className="nav-logo">
                        <span className="logo-icon"><Brain size={20} /></span>
                        <span className="logo-text">SCDA</span>
                    </Link>
                    <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <ThemeToggle />
                        <Link to="/login" className="nav-login-btn">
                            <span>Sign In</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </nav>

            <section className="hero-section">
                <div className="hero-center">
                    <div className="hero-badge">
                        <ChartBar size={14} />
                        <span>Academic Intelligence Platform</span>
                    </div>
                    <h1 className="hero-title">
                        <span className="hero-line">Decode Course</span>
                        <span className="hero-line hero-gradient">Difficulty.</span>
                        <span className="hero-line">Empower Learning.</span>
                    </h1>
                    <p className="hero-description">
                        Real-time analytics. Student feedback. Teacher insights.<br />
                        One platform that transforms how academic difficulty is understood and managed.
                    </p>
                    <div className="hero-cta-group">
                        <Link to="/login" className="cta-primary">
                            <span>Get Started Free</span>
                            <div className="cta-arrow"><ArrowRight size={14} /></div>
                        </Link>
                        <a href="#features" className="cta-secondary">
                            <PlayCircle size={22} />
                            <span>See How It Works</span>
                        </a>
                    </div>
                </div>
            </section>

            <section className="features-section" id="features">
                <div className="section-header">
                    <span className="section-tag">Features</span>
                    <h2 className="section-title">Everything you need to<br /><span className="text-gradient">understand course complexity</span></h2>
                </div>
                <div className="features-grid">
                    <FeatureCard 
                        icon={<ChartBar />} 
                        title="Smart Analytics" 
                        desc="Interactive dashboards with real-time difficulty trends, score distributions, and comparative analysis." 
                    />
                    <FeatureCard 
                        icon={<Users />} 
                        title="Dual Portals" 
                        desc="Tailored experiences for students and teachers. Rate subjects, upload materials, and manage courses." 
                    />
                    <FeatureCard 
                        icon={<Zap />} 
                        title="Instant Feedback" 
                        desc="Submit anonymous ratings and reviews. Teachers get notified in real-time to act on concerns." 
                    />
                    <FeatureCard 
                        icon={<FileText />} 
                        title="Material Hub" 
                        desc="Upload, share, and rate study materials. Students can access resources and teachers track engagement." 
                    />
                </div>
            </section>

            <section className="cta-section">
                <div className="cta-inner">
                    <h2>Ready to transform your academic experience?</h2>
                    <p>Join the platform that bridges the gap between student understanding and course design.</p>
                    <Link to="/login" className="cta-primary cta-white">
                        <span>Start Analyzing</span>
                        <div className="cta-arrow"><ArrowRight size={14} /></div>
                    </Link>
                </div>
            </section>

            <footer className="landing-footer">
                <div className="footer-inner">
                    <div className="footer-brand">
                        <span className="logo-icon"><Brain size={18} /></span>
                        <span>SCDA System</span>
                    </div>
                    <p className="footer-copy">© 2026 Smart Course Difficulty Analyzer. Built for better learning.</p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="feature-card-new visible">
        <div className="feature-glow"></div>
        <div className="feature-icon-wrap">
            {icon}
        </div>
        <h3>{title}</h3>
        <p>{desc}</p>
        <div className="feature-link">
            <span>Explore</span>
            <ArrowRight size={14} />
        </div>
    </div>
);

export default LandingPage;
