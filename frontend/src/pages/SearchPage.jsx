import React, { useState } from 'react';
import { ApiService } from '../services/apiState';
import { Search, UserPlus, Smile, Meh, Frown, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SearchPage = () => {
    const { isTeacher } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    // Only teachers should really access this based on sidebar, but we'll render it anyway
    if (!isTeacher()) {
         return <div style={{ padding: '40px', textAlign: 'center' }}>Access Denied. Only Teachers can access search.</div>;
    }

    const performSearch = async (e) => {
        if (e) e.preventDefault();
        
        const trimmedQuery = query.trim().toLowerCase();
        
        if (!trimmedQuery) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setLoading(true);
        setHasSearched(true);

        try {
            const subjects = await ApiService.getSubjects();
            let studentResults = [];

            // Aggregate all reviews across all subjects that match the student name
            subjects.forEach(sub => {
                if (sub.reviews) {
                    sub.reviews.forEach(rev => {
                        const studentName = (rev.studentName || 'Anonymous').toLowerCase();
                        if (studentName.includes(trimmedQuery)) {
                            studentResults.push({
                                ...rev,
                                subjectName: sub.name,
                                subjectCode: sub.code
                            });
                        }
                    });
                }
            });

            setResults(studentResults);
        } catch (err) {
            console.error('Failed to perform search:', err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    };

    const renderFeedbackIcon = (rating) => {
        let color = 'hsla(var(--primary-h), var(--primary-s), var(--primary-l), 1)';
        let Icon = Smile;
        if (rating >= 4) { color = '#ef4444'; Icon = Frown; }
        else if (rating >= 3) { color = '#f59e0b'; Icon = Meh; }
        else { color = '#10b981'; Icon = Smile; }

        return (
            <div style={{ background: `${color}15`, color, width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                <Icon size={20} />
            </div>
        );
    };

    const getRatingColor = (rating) => {
        if (rating >= 4) return '#ef4444'; 
        if (rating >= 3) return '#f59e0b';
        return '#10b981';
    };

    const displayQuery = query.trim() ? query.trim().charAt(0).toUpperCase() + query.trim().slice(1) : '';

    return (
        <div className="card" style={{ marginTop: '40px', padding: '40px' }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>Search Student Profiles</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter student name (e.g. Alice, Bob)..."
                        style={{ 
                            width: '100%', 
                            padding: '12px 15px 12px 40px', 
                            borderRadius: '8px', 
                            border: '1px solid var(--border-color)', 
                            background: 'var(--bg-color)', 
                            color: 'var(--text-color)', 
                            fontFamily: 'Outfit, sans-serif', 
                            fontSize: '1rem',
                            boxSizing: 'border-box'
                        }}
                    />
                    <Search 
                        size={18} 
                        style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
                    />
                </div>
                <button 
                    onClick={performSearch} 
                    className="btn" 
                    style={{ padding: '12px 25px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    disabled={loading}
                >
                    <Search size={18} /> {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            <div id="search-results-container">
                {!hasSearched ? (
                    <p className="text-muted" style={{ textAlign: 'center', marginTop: '40px' }}>
                        <UserPlus style={{ width: '48px', height: '48px', opacity: 0.2, display: 'block', margin: '0 auto 15px auto' }} />
                        Search for a student to view their submitted feedback and performance records.
                    </p>
                ) : results.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '40px', padding: '30px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                        <Search style={{ width: '40px', height: '40px', color: 'var(--text-muted)', marginBottom: '15px', opacity: 0.5, margin: '0 auto' }} />
                        <h4 style={{ color: 'var(--text-color)', marginBottom: '5px' }}>No results found</h4>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>Could not find any student matching "{displayQuery}". Try searching for another name.</p>
                    </div>
                ) : (
                    <>
                        <h4 style={{ marginBottom: '20px', color: 'var(--text-color)', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
                            Found {results.length} record(s) for "{displayQuery}"
                        </h4>
                        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {results.map((res, idx) => {
                                const color = getRatingColor(res.rating);
                                return (
                                    <div key={idx} className="card" style={{ padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                            <div>
                                                <h5 style={{ color: 'var(--primary-color)', margin: '0 0 5px 0', fontSize: '1.1rem' }}>{res.subjectName}</h5>
                                                <span style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.05)', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>{res.subjectCode}</span>
                                            </div>
                                            {renderFeedbackIcon(res.rating)}
                                        </div>
                                        
                                        <div style={{ marginBottom: '15px' }}>
                                            <p style={{ fontStyle: 'italic', color: 'var(--text-color)', opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.4, margin: 0 }}>
                                                "{res.feedback || 'No comments provided'}"
                                            </p>
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', fontWeight: 600 }}>
                                            <span style={{ color, background: `${color}11`, padding: '4px 10px', borderRadius: '12px', border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Star size={14} /> Diff Rating: {res.rating}/5
                                            </span>
                                            <span className="badge badge-success" style={{ padding: '4px 10px', display: 'inline-flex', alignItems: 'center' }}>
                                                Score: {res.marks}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
