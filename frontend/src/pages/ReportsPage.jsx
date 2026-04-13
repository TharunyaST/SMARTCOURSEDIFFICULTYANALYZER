import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/apiState';
import { 
    FileOutput, 
    Book, 
    Users, 
    Star, 
    Thermometer,
    Info,
    CheckCircle2
} from 'lucide-react';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    LineElement,
    PointElement,
    Tooltip, 
    Legend,
    Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, 
    LinearScale, 
    BarElement, 
    LineElement,
    PointElement,
    Tooltip, 
    Legend,
    Filler
);

const ReportsPage = () => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [reportData, setReportData] = useState({
        subjectNames: [],
        topScores: [],
        myScores: [],
        avgMarks: [],
        tableRows: []
    });
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await ApiService.getSubjects();
            setSubjects(data);
            processData(data);
        } catch (err) {
            console.error("Failed to load report data", err);
        } finally {
            setLoading(false);
        }
    };

    const processData = (subjectsList) => {
        const names = [];
        const top = [];
        const mine = [];
        const avgs = [];
        const rows = [];

        const currentUserName = user?.name || user?.email?.split('@')[0] || '';
        const lowerName = currentUserName.toLowerCase();

        subjectsList.forEach(sub => {
            const reviews = sub.reviews || [];
            let avgRating = 0;
            let avgMarks = 0;

            if (reviews.length > 0) {
                avgRating = reviews.reduce((a, b) => a + b.rating, 0) / reviews.length;
                avgMarks = reviews.reduce((a, b) => a + b.marks, 0) / reviews.length;
            }

            const diffIndex = (avgRating * 0.6) + (((100 - avgMarks) / 20) * 0.4);
            const topScore = reviews.length > 0 ? Math.max(...reviews.map(r => r.marks || 0)) : 0;
            
            // Heuristic for finding "my" review - usually by name or email
            const myReview = reviews.find(r => (r.studentName || '').toLowerCase() === lowerName);
            const myScore = myReview ? (myReview.marks || 0) : 0;

            names.push(sub.name);
            top.push(topScore);
            mine.push(myScore);
            avgs.push(avgMarks.toFixed(1));

            let status = { label: 'Optimal', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
            if (diffIndex >= 2.5 && diffIndex < 4) {
                status = { label: 'Balanced', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
            } else if (diffIndex >= 4) {
                status = { label: 'High Stress', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
            }

            rows.push({
                code: sub.code,
                name: sub.name,
                students: reviews.length,
                rating: avgRating.toFixed(1),
                difficulty: diffIndex.toFixed(1),
                status
            });
        });

        setReportData({
            subjectNames: names,
            topScores: top,
            myScores: mine,
            avgMarks: avgs,
            tableRows: rows
        });
    };

    const handleExport = () => {
        setExporting(true);
        setTimeout(() => {
            alert('Report generation complete! Your academic analysis PDF is ready for download (this is a prototype demonstration).');
            setExporting(false);
        }, 1500);
    };

    const barData = {
        labels: reportData.subjectNames,
        datasets: [
            {
                label: 'Top Score (%)',
                data: reportData.topScores,
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderRadius: 8,
                maxBarThickness: 25,
            },
            {
                label: 'My Score (%)',
                data: reportData.myScores,
                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                borderRadius: 8,
                maxBarThickness: 25,
            }
        ]
    };

    const lineData = {
        labels: reportData.subjectNames,
        datasets: [{
            label: 'Avg Performance (%)',
            data: reportData.avgMarks,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#10b981',
            pointRadius: 6,
        }]
    };

    if (loading) return <div>Loading reports...</div>;

    return (
        <>
            <div className="card" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '5px solid var(--primary-color)' }}>
                <div style={{ fontSize: '2rem', color: 'var(--primary-color)' }}><Info size={40} /></div>
                <div>
                    <h4 style={{ marginBottom: '5px' }}>Analysis Overview</h4>
                    <p className="text-muted" style={{ margin: 0, fontSize: 0.9 }}>
                        Consolidated feedback reports for active courses based on student ratings and performance data.
                    </p>
                </div>
                <button 
                    className="btn" 
                    onClick={handleExport}
                    disabled={exporting}
                    style={{ marginLeft: 'auto', background: 'var(--secondary-color)', display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                    <FileOutput size={18} /> {exporting ? 'Generating...' : 'Export Report'}
                </button>
            </div>

            <div className="table-container" style={{ padding: 0, overflow: 'hidden' }}>
                <table>
                    <thead style={{ background: 'rgba(79, 70, 229, 0.05)' }}>
                        <tr>
                            <th style={{ padding: '20px' }}><Book size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Subject Info</th>
                            <th style={{ padding: '20px' }}><Users size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Sample Size</th>
                            <th style={{ padding: '20px' }}><Star size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Avg. Difficulty</th>
                            <th style={{ padding: '20px' }}><Thermometer size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.tableRows.map((row, idx) => (
                            <tr key={idx}>
                                <td style={{ padding: '20px' }}>
                                    <div style={{ fontWeight: 700 }}>{row.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.code}</div>
                                </td>
                                <td style={{ padding: '20px', fontWeight: 500 }}>{row.students} Students</td>
                                <td style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', aligniteMs: 'center', gap: '10px' }}>
                                        <span style={{ fontWeight: 600 }}>{row.rating}</span>
                                        <div style={{ flex: 1, height: '6px', background: '#eee', borderRadius: '10px', minWidth: '60px' }}>
                                            <div style={{ width: `${(parseFloat(row.rating) / 5) * 100}%`, height: '100%', background: 'var(--primary-color)', borderRadius: '10px' }}></div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '20px' }}>
                                    <span style={{ 
                                        padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                                        background: row.status.bg, color: row.status.color, border: `1px solid ${row.status.color}33`
                                    }}>
                                        {row.status.label} ({row.difficulty})
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card" style={{ marginTop: '40px', padding: '40px' }}>
                <h3 style={{ marginBottom: '30px', textAlign: 'center', color: 'var(--primary-color)' }}>Score Analytics: Top vs My Performance</h3>
                <div style={{ height: '350px' }}>
                    <Bar 
                        data={barData} 
                        options={{ 
                            responsive: true, 
                            maintainAspectRatio: false,
                            scales: { y: { beginAtZero: true, max: 100 } }
                        }} 
                    />
                </div>
            </div>

            <div className="card" style={{ marginTop: '40px', padding: '40px' }}>
                <h3 style={{ marginBottom: '30px', textAlign: 'center', color: 'var(--primary-color)' }}>Average Subject Performance</h3>
                <div style={{ height: '350px' }}>
                    <Line 
                        data={lineData} 
                        options={{ 
                            responsive: true, 
                            maintainAspectRatio: false,
                            scales: { y: { beginAtZero: true, max: 100 } },
                            plugins: { legend: { display: false } }
                        }} 
                    />
                </div>
            </div>
        </>
    );
};

export default ReportsPage;
