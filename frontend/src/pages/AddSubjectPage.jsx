import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/apiState';
import { FolderPlus, List, Type, Hash, UploadCloud, CheckCheck, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AddSubjectPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [subjects, setSubjects] = useState([]);
    const [targetSubject, setTargetSubject] = useState('new');
    const [subjectName, setSubjectName] = useState('');
    const [subjectCode, setSubjectCode] = useState('');
    const [teacherName, setTeacherName] = useState(user?.displayName || '');
    const [materialTitle, setMaterialTitle] = useState('');
    const [materialUrl, setMaterialUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            const data = await ApiService.getSubjects();
            setSubjects(data);
        } catch (err) {
            console.error('Failed to load subjects:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const tName = teacherName || 'Unknown Teacher';

            if (targetSubject === 'new') {
                if (!subjectName || !subjectCode) {
                    alert('Please fill in subject details');
                    setLoading(false);
                    return;
                }

                await ApiService.addSubject(subjectCode, subjectName);
                if (materialTitle && materialUrl) {
                    await ApiService.addMaterial({ 
                        subject_code: subjectCode, 
                        title: materialTitle, 
                        uploaded_by: tName, 
                        fileUrl: materialUrl 
                    });
                }
                alert(`Subject "${subjectName}" created successfully!`);
            } else {
                if (materialTitle && materialUrl) {
                    await ApiService.addMaterial({ 
                        subject_code: targetSubject, 
                        title: materialTitle, 
                        uploaded_by: tName, 
                        fileUrl: materialUrl 
                    });
                    alert('Material uploaded successfully!');
                } else if (materialTitle || materialUrl) {
                    alert('Please enter both Title and URL to upload a material.');
                    setLoading(false);
                    return;
                } else {
                    alert('Nothing to update.');
                    setLoading(false);
                    return;
                }
            }

            navigate('/dashboard');
        } catch (err) {
            console.error('Upload failed:', err);
            alert('API Error. Ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (targetSubject === 'new') return;

        const subjectMatch = subjects.find(s => s.code === targetSubject);
        if (!subjectMatch) return;

        const confirmed = window.confirm(`Are you sure you want to permanently delete "${subjectMatch.name}" and all its materials and feedback? This action cannot be undone.`);
        if (!confirmed) return;

        setDeleteLoading(true);
        try {
            // NOTE: Add deleteSubject to API state if needed
            // await ApiService.deleteSubject(targetSubject);
            alert(`Subject "${subjectMatch.name}" completely deleted (stub).`);
            setTargetSubject('new');
            loadSubjects();
        } catch (err) {
            console.error('Failed to delete subject:', err);
            alert('An error occurred while deleting the subject.');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="card form-container" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'left' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <FolderPlus style={{ width: '40px', height: '40px', color: 'var(--primary-color)', marginBottom: '15px' }} />
                <h3>Subject & Material Update</h3>
                <p className="text-muted">Register new courses or upload supplementary materials.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="targetSubject" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <List size={16} /> Target Subject
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <select 
                            id="targetSubject" 
                            className="form-control" 
                            value={targetSubject}
                            onChange={(e) => setTargetSubject(e.target.value)}
                            required
                            style={{ background: 'var(--background-gradient)', flex: 1 }}
                        >
                            <option value="new">-- Register New Subject --</option>
                            {subjects.map(sub => (
                                <option key={sub.code} value={sub.code}>
                                    {sub.name} ({sub.code})
                                </option>
                            ))}
                        </select>
                        {targetSubject !== 'new' && (
                            <button 
                                type="button" 
                                onClick={handleDelete}
                                className="btn btn-danger"
                                disabled={deleteLoading}
                                style={{ background: 'var(--danger-color)', border: 'none' }}
                                title="Delete Subject"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ opacity: targetSubject === 'new' ? 1 : 0.5, pointerEvents: targetSubject === 'new' ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label htmlFor="subjectName" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Type size={16} /> Subject Name
                            </label>
                            <input 
                                type="text" 
                                id="subjectName" 
                                className="form-control"
                                placeholder="e.g. Machine Learning"
                                value={subjectName}
                                onChange={(e) => setSubjectName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="subjectCode" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Hash size={16} /> Subject Code
                            </label>
                            <input 
                                type="text" 
                                id="subjectCode" 
                                className="form-control" 
                                placeholder="e.g. AI402"
                                value={subjectCode}
                                onChange={(e) => setSubjectCode(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '30px', padding: '25px', background: 'rgba(79, 70, 229, 0.05)', borderRadius: 'var(--radius)', border: '1px dashed var(--primary-color)' }}>
                    <h4 style={{ marginBottom: '20px', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UploadCloud size={20} /> Material Upload
                    </h4>

                    <div className="form-group">
                        <label htmlFor="teacherName">Instructor Name</label>
                        <input 
                            type="text" 
                            id="teacherName" 
                            className="form-control" 
                            placeholder="e.g. Dr. Roberts"
                            value={teacherName}
                            onChange={(e) => setTeacherName(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="materialTitle">Document Title</label>
                        <input 
                            type="text" 
                            id="materialTitle" 
                            className="form-control"
                            placeholder="e.g. Chapter 1: Optimization PDF"
                            value={materialTitle}
                            onChange={(e) => setMaterialTitle(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="materialUrl">Material Link URL</label>
                        <input 
                            type="url" 
                            id="materialUrl" 
                            className="form-control"
                            placeholder="e.g. https://drive.google.com/file/d/..."
                            value={materialUrl}
                            onChange={(e) => setMaterialUrl(e.target.value)}
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="btn btn-block"
                    disabled={loading}
                    style={{ marginTop: '30px', padding: '15px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    <CheckCheck size={20} /> {loading ? 'Saving...' : 'Save Subject Data'}
                </button>
            </form>
        </div>
    );
};

export default AddSubjectPage;
