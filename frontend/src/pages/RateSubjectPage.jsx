import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/apiState';
import { MessageSquare, Book, Activity, FileSpreadsheet, Edit3, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RateSubjectPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [subjects, setSubjects] = useState([]);
    const [targetSubject, setTargetSubject] = useState('');
    const [rating, setRating] = useState(3);
    const [marks, setMarks] = useState('');
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [availableSubjectsCount, setAvailableSubjectsCount] = useState(-1);

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            const data = await ApiService.getSubjects();
            const studentName = (user?.displayName || user?.email || 'User').toLowerCase();

            let available = 0;
            const processedSubjects = data.map(sub => {
                const hasRated = sub.reviews && sub.reviews.some(rev =>
                    rev.studentName && rev.studentName.toLowerCase() === studentName
                );
                if (!hasRated) {
                    available++;
                }
                return { ...sub, hasRated };
            });
            
            setSubjects(processedSubjects);
            setAvailableSubjectsCount(available);
            
            const firstAvailable = processedSubjects.find(s => !s.hasRated);
            if (firstAvailable) {
                setTargetSubject(firstAvailable.code);
            }
        } catch (err) {
            console.error('Failed to load subjects:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!targetSubject) {
            alert('Please select a subject to rate.');
            setLoading(false);
            return;
        }

        try {
            const result = await ApiService.submitFeedback({ 
                subject_code: targetSubject, 
                rating, 
                marks: parseInt(marks), 
                feedback, 
                studentName: user?.displayName || user?.email?.split('@')[0] || 'User' 
            });
            
            if (result.success || result.message) {
                alert('Feedback submitted successfully!');
                navigate('/dashboard');
            } else {
                alert('Submission failed: ' + (result.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Submission failed:', err);
            // Handling the case where backend response string might not have `success`
            if (err.response && err.response.status === 200) {
                 alert('Feedback submitted successfully!');
                 navigate('/dashboard');
            } else {
                 alert('API error. Ensure backend is running.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getDisplayName = () => {
        return user?.displayName || 'Student';
    };

    return (
        <div className="card form-container" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'left' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <MessageSquare style={{ width: '40px', height: '40px', color: 'var(--accent-color)', marginBottom: '15px' }} />
                <h3>Share Your Experience</h3>
                <p className="text-muted">Your feedback helps us optimize course difficulty and materials.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="targetSubject" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Book size={16} /> Select Subject
                    </label>
                    <select 
                        id="targetSubject" 
                        className="form-control" 
                        value={targetSubject}
                        onChange={(e) => setTargetSubject(e.target.value)}
                        required
                        style={{ background: 'var(--background-gradient)' }}
                        disabled={availableSubjectsCount === 0}
                    >
                        {availableSubjectsCount === 0 ? (
                            <option value="">You have rated all available subjects</option>
                        ) : (
                            <option value="" disabled>Choose a subject...</option>
                        )}
                        {subjects.map(sub => (
                            <option key={sub.code} value={sub.code} disabled={sub.hasRated}>
                                {sub.name} ({sub.code}) {sub.hasRated ? '- Already Rated' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={16} /> Difficulty Rating
                    </label>
                    <div className="rating-btn-group" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        {[
                            { val: 1, label: 'Very Easy' },
                            { val: 2, label: 'Easy' },
                            { val: 3, label: 'Moderate' },
                            { val: 4, label: 'Hard' },
                            { val: 5, label: 'Very Hard' }
                        ].map(item => (
                            <button 
                                key={item.val}
                                type="button" 
                                className={`rating-btn ${rating === item.val ? 'active' : ''}`}
                                onClick={() => setRating(item.val)}
                                style={{
                                    flex: 1,
                                    padding: '15px',
                                    border: `1px solid ${rating === item.val ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                    background: rating === item.val ? 'rgba(79, 70, 229, 0.1)' : 'var(--card-bg)',
                                    color: rating === item.val ? 'var(--primary-color)' : 'inherit',
                                    borderRadius: 'var(--radius)',
                                    cursor: 'pointer',
                                    transition: 'background 0.3s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontWeight: 600
                                }}
                            >
                                <span>{item.val}</span>
                                <small style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>{item.label}</small>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="marks" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileSpreadsheet size={16} /> Estimated Performance (0-100%)
                    </label>
                    <input 
                        type="number" 
                        id="marks" 
                        className="form-control" 
                        min="0" 
                        max="100" 
                        placeholder="e.g. 85"
                        value={marks}
                        onChange={(e) => setMarks(e.target.value)}
                        required 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="feedback" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Edit3 size={16} /> Additional Comments
                    </label>
                    <textarea 
                        id="feedback" 
                        className="form-control"
                        placeholder="What parts did you find most challenging?"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        style={{ minHeight: '100px', resize: 'vertical' }}
                    />
                </div>

                <button 
                    type="submit" 
                    className="btn btn-block"
                    disabled={availableSubjectsCount === 0 || loading}
                    style={{ 
                        marginTop: '30px', 
                        padding: '15px', 
                        fontSize: '1.1rem', 
                        background: 'var(--accent-color)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px',
                        opacity: (availableSubjectsCount === 0 || loading) ? 0.5 : 1,
                        cursor: (availableSubjectsCount === 0 || loading) ? 'not-allowed' : 'pointer'
                    }}
                >
                    <Send size={20} /> {loading ? 'Submitting...' : 'Submit Analysis'}
                </button>
            </form>
        </div>
    );
};

export default RateSubjectPage;
