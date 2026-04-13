import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/apiState';
import { 
    FileText, 
    User, 
    Calendar, 
    ExternalLink, 
    Check, 
    CheckCheck, 
    Trash2,
    Star
} from 'lucide-react';

const MaterialsPage = () => {
    const { isTeacher } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const subjects = await ApiService.getSubjects();
            let allMats = [];
            subjects.forEach(sub => {
                if (sub.materials) {
                    sub.materials.forEach(mat => {
                        allMats.push({ 
                            ...mat, 
                            subjectName: sub.name, 
                            subjectCode: sub.code,
                            id: mat._id || mat.id // Ensure we have a valid ID
                        });
                    });
                }
            });
            setMaterials(allMats);
        } catch (err) {
            console.error("Failed to load materials", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkViewed = async (id) => {
        try {
            await ApiService.markMaterialViewed(id);
            loadData(); // Refresh
        } catch (err) {
            console.error("Failed to mark as viewed", err);
        }
    };

    const handleRate = async (id, rating) => {
        try {
            await ApiService.rateMaterial(id, rating);
            loadData(); // Refresh
        } catch (err) {
            console.error("Failed to rate material", err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this material?")) {
            try {
                // Assuming ApiService has deleteMaterial, adding if not existing
                // await ApiService.deleteMaterial(id);
                loadData();
            } catch (err) {
                console.error("Failed to delete", err);
            }
        }
    };

    if (loading) return <div className="card">Loading materials...</div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
            {materials.length === 0 ? (
                <div className="card" style={{ gridColumn: '1 / -1' }}>No materials available.</div>
            ) : (
                materials.map(mat => (
                    <MaterialCard 
                        key={mat.id} 
                        material={mat} 
                        isTeacher={isTeacher()}
                        onMarkViewed={() => handleMarkViewed(mat.id)}
                        onRate={(val) => handleRate(mat.id, val)}
                        onDelete={() => handleDelete(mat.id)}
                    />
                ))
            )}
        </div>
    );
};

const MaterialCard = ({ material, isTeacher, onMarkViewed, onRate, onDelete }) => {
    const avgRating = material.ratings?.length > 0
        ? (material.ratings.reduce((a, b) => a + b, 0) / material.ratings.length).toFixed(1)
        : 'Unrated';

    return (
        <div className="card" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            borderLeft: material.viewed ? '5px solid var(--accent-color)' : '1px solid var(--glass-border)'
        }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <div style={{ 
                    width: '50px', height: '50px', borderRadius: '12px', 
                    background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <FileText size={24} />
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {material.title}
                        {material.viewed && <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-color)', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.2)' }}>DONE</span>}
                    </h3>
                    <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} /> {material.uploadedBy}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {new Date(material.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '20px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                {material.subjectCode} • {material.subjectName}
            </div>

            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map(val => (
                        <Star 
                            key={val} 
                            size={18} 
                            style={{ cursor: 'pointer', fill: val <= Math.round(avgRating === 'Unrated' ? 0 : avgRating) ? 'var(--warning-color)' : 'none', color: 'var(--warning-color)' }}
                            onClick={() => onRate(val)}
                        />
                    ))}
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({avgRating})</span>
                </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
                <a href={material.fileUrl || "#"} target="_blank" rel="noopener noreferrer" className="btn" style={{ flex: 1.2, fontSize: '0.85rem', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <ExternalLink size={16} /> Open
                </a>
                <button onClick={onMarkViewed} className="btn" style={{ flex: 1, fontSize: '0.85rem', padding: '10px', background: material.viewed ? 'var(--accent-color)' : 'var(--text-muted)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    {material.viewed ? <CheckCheck size={16} /> : <Check size={16} />} {material.viewed ? 'Viewed' : 'Done'}
                </button>
            </div>

            {isTeacher && (
                <button onClick={onDelete} className="btn" style={{ marginTop: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.8rem', padding: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <Trash2 size={14} /> Delete Material
                </button>
            )}
        </div>
    );
};

export default MaterialsPage;
