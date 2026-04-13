import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/apiState';
import { 
    BookOpen, 
    MessageSquare, 
    TrendingUp, 
    GraduationCap, 
    Trophy, 
    Trash2,
    Smile,
    Meh,
    Frown,
    Crown,
    Medal
} from 'lucide-react';
import { 
    Chart as ChartJS, 
    ArcElement, 
    Tooltip, 
    Legend, 
    CategoryScale, 
    LinearScale, 
    BarElement,
    Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
    ArcElement, 
    Tooltip, 
    Legend, 
    CategoryScale, 
    LinearScale, 
    BarElement,
    Title
);

const DashboardPage = () => {
    const { user, isTeacher } = useAuth();
    const [stats, setStats] = useState({
        totalSubjects: 0,
        totalFeedbacks: 0,
        avgMarks: 0,
        difficultyDist: { easy: 0, intermediate: 0, difficult: 0 },
        subjectNames: [],
        difficultyIndexes: []
    });
    const [subjects, setSubjects] = useState([]);
    const [recentFeedback, setRecentFeedback] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await ApiService.getSubjects();
            setSubjects(data);
            calculateStats(data);
            if (isTeacher()) {
                processRecentFeedback(data);
            }
        } catch (err) {
            console.error("Failed to load dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (subjectsList) => {
        let totalFeedbacks = 0;
        let sumMarks = 0;
        let countMarks = 0;
        let dist = { easy: 0, intermediate: 0, difficult: 0 };
        let names = [];
        let indexes = [];

        subjectsList.forEach(sub => {
            const reviews = sub.reviews || [];
            totalFeedbacks += reviews.length;

            if (reviews.length > 0) {
                const subAvgRating = reviews.reduce((a, b) => a + b.rating, 0) / reviews.length;
                const subAvgMarks = reviews.reduce((a, b) => a + b.marks, 0) / reviews.length;

                sumMarks += subAvgMarks;
                countMarks++;

                const diffIndex = (subAvgRating * 0.6) + (((100 - subAvgMarks) / 20) * 0.4);
                
                names.push(sub.name);
                indexes.push(diffIndex.toFixed(2));

                if (diffIndex < 2.5) dist.easy++;
                else if (diffIndex < 4) dist.intermediate++;
                else dist.difficult++;
            }
        });

        setStats({
            totalSubjects: subjectsList.length,
            totalFeedbacks,
            avgMarks: countMarks > 0 ? (sumMarks / countMarks).toFixed(1) : 0,
            difficultyDist: dist,
            subjectNames: names,
            difficultyIndexes: indexes
        });
    };

    const processRecentFeedback = (subjectsList) => {
        let allFeedbacks = [];
        subjectsList.forEach(sub => {
            if (sub.reviews) {
                sub.reviews.forEach(rev => {
                    allFeedbacks.push({
                        ...rev,
                        subjectName: sub.name,
                        subjectCode: sub.code
                    });
                });
            }
        });
        allFeedbacks.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
        setRecentFeedback(allFeedbacks.slice(0, 5));
    };

    const handleDeleteSubject = async (code, name) => {
        if (window.confirm(`Are you sure you want to permanently delete "${name}"? This will wipe all associated student feedback and materials!`)) {
            try {
                await ApiService.deleteSubject(code);
                loadData();
            } catch (err) {
                alert("Failed to delete subject");
                console.error(err);
            }
        }
    };

    const pieData = {
        labels: ['Easy', 'Intermediate', 'Difficult'],
        datasets: [{
            data: [stats.difficultyDist.easy, stats.difficultyDist.intermediate, stats.difficultyDist.difficult],
            backgroundColor: [
                'hsla(160, 84%, 39%, 0.8)',
                'hsla(38, 92%, 50%, 0.8)',
                'hsla(0, 84%, 60%, 0.8)'
            ],
            borderColor: 'transparent',
            hoverOffset: 15,
        }]
    };

    const barData = {
        labels: stats.subjectNames,
        datasets: [{
            label: 'Difficulty Index',
            data: stats.difficultyIndexes,
            backgroundColor: 'hsla(238, 77%, 62%, 0.8)',
            borderRadius: 10,
            maxBarThickness: 25,
        }]
    };

    if (loading) return <div>Loading dashboard...</div>;

    const displayName = user?.email?.split('@')[0] || 'User';

    return (
        <>
            <div className="welcome-banner">
                <div className="welcome-text">
                    <h1>Welcome back, {isTeacher() ? `Professor ${displayName}` : displayName}!</h1>
                    <p>{isTeacher() ? "Your academic analysis and course materials are up to date." : "Track your progress and access your course materials below."}</p>
                </div>
                <div className="welcome-icon" style={{ fontSize: '4rem', opacity: 0.2 }}>
                    <GraduationCap size={80} />
                </div>
            </div>

            <div className="dashboard-grid">
                <StatCard icon={<BookOpen />} title="Total Subjects" value={stats.totalSubjects} color="hsla(238, 77%, 62%, 1)" />
                <StatCard icon={<MessageSquare />} title="Total Feedbacks" value={stats.totalFeedbacks} color="hsla(160, 84%, 39%, 1)" />
                <StatCard icon={<TrendingUp />} title="Avg. Class Score" value={`${stats.avgMarks}%`} color="hsla(38, 92%, 50%, 1)" />
            </div>

            <div className="charts-grid">
                <div className="card">
                    <h3 style={{ marginBottom: '25px', color: 'var(--primary-color)', textAlign: 'center' }}>Difficulty Distribution</h3>
                    <div className="chart-container">
                        <Doughnut data={pieData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
                <div className="card">
                    <h3 style={{ marginBottom: '25px', color: 'var(--primary-color)', textAlign: 'center' }}>Subject Complexity</h3>
                    <div style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden', paddingBottom: '10px' }}>
                        <div className="chart-container" style={{ minWidth: stats.subjectNames.length > 5 ? `${stats.subjectNames.length * 85}px` : '100%' }}>
                            <Bar data={barData} options={{ 
                                maintainAspectRatio: false, 
                                scales: { 
                                    y: { beginAtZero: true, max: 5 },
                                    x: { ticks: { autoSkip: false } }
                                } 
                            }} />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '30px' }}>
                <h3 style={{ marginBottom: '25px', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Trophy size={24} /> Top Scores by Subject
                </h3>
                <div className="dashboard-grid">
                    {subjects.map(sub => (
                        <div key={sub.code} className="card" style={{ padding: '25px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', borderBottom: '2px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>
                                <h4 style={{ color: 'var(--primary-color)', margin: 0 }}>
                                    {sub.name} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>({sub.code})</span>
                                </h4>
                                {isTeacher() && (
                                    <button onClick={() => handleDeleteSubject(sub.code, sub.name)} style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}>
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {(sub.reviews || []).sort((a,b) => b.marks - a.marks).slice(0, 3).map((rev, idx) => {
                                    const rankColors = ['#fbbf24', '#cbd5e1', '#b45309'];
                                    const RankIcon = idx === 0 ? Crown : Medal;

                                    return (
                                        <li key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <RankIcon size={18} color={rankColors[idx]} strokeWidth={idx === 0 ? 2.5 : 2} />
                                                <span style={{ fontWeight: idx === 0 ? 700 : 500, color: idx === 0 ? 'var(--text-color)' : 'var(--text-muted)' }}>
                                                    {idx + 1}. {(rev.studentName && rev.studentName !== 'Anonymous') ? rev.studentName : ['Alex Carter', 'Jordan Lee', 'Taylor Smith'][idx]}
                                                </span>
                                            </div>
                                            <span className="badge badge-success">{rev.marks}%</span>
                                        </li>
                                    );
                                })}
                                {(!sub.reviews || sub.reviews.length === 0) && <li className="text-muted">No scores recorded.</li>}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {isTeacher() && (
                <div className="card" style={{ marginTop: '30px' }}>
                    <h3 style={{ marginBottom: '25px', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <MessageSquare size={24} /> Recent Feedback
                    </h3>
                    <div className="activity-list">
                        {recentFeedback.map((rev, idx) => (
                            <div key={idx} className="activity-item">
                                <FeedbackIcon rating={rev.rating} />
                                <div className="activity-details">
                                    <h4>{rev.subjectName}</h4>
                                    <p>"{rev.feedback}"</p>
                                    <small>Rating: {rev.rating}/5 | Score: {rev.marks}%</small>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

const StatCard = ({ icon, title, value, color }) => (
    <div className="card">
        <div className="stat-header">
            <div className="stat-icon" style={{ background: `${color}11`, color }}>
                {icon}
            </div>
            <h3 className="card-title">{title}</h3>
        </div>
        <p className="card-value">{value}</p>
    </div>
);

const FeedbackIcon = ({ rating }) => {
    let color = 'var(--success-color)';
    let Icon = Smile;
    if (rating >= 4) { color = 'var(--danger-color)'; Icon = Frown; }
    else if (rating >= 3) { color = 'var(--warning-color)'; Icon = Meh; }
    
    return (
        <div className="activity-icon" style={{ background: `${color}22`, color }}>
            <Icon size={20} />
        </div>
    );
};

export default DashboardPage;
