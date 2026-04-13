import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    PlusCircle, 
    Star, 
    BookOpen, 
    Search, 
    ChartLine, 
    LogOut 
} from 'lucide-react';

const Sidebar = () => {
    const { isTeacher, isStudent, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="sidebar">
            <div className="sidebar-header">
                SCDA System
            </div>
            <ul className="sidebar-menu">
                <li>
                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                        <LayoutDashboard size={20} /> Dashboard
                    </NavLink>
                </li>
                
                {isTeacher() && (
                    <li>
                        <NavLink to="/add-subject" className={({ isActive }) => isActive ? 'active' : ''}>
                            <PlusCircle size={20} /> Add Subject
                        </NavLink>
                    </li>
                )}

                {isStudent() && (
                    <li>
                        <NavLink to="/rate-subject" className={({ isActive }) => isActive ? 'active' : ''}>
                            <Star size={20} /> Rate Subject
                        </NavLink>
                    </li>
                )}

                <li>
                    <NavLink to="/materials" className={({ isActive }) => isActive ? 'active' : ''}>
                        <BookOpen size={20} /> Lecture Materials
                    </NavLink>
                </li>

                {isTeacher() && (
                    <li>
                        <NavLink to="/search" className={({ isActive }) => isActive ? 'active' : ''}>
                            <Search size={20} /> Search
                        </NavLink>
                    </li>
                )}

                <li>
                    <NavLink to="/reports" className={({ isActive }) => isActive ? 'active' : ''}>
                        <ChartLine size={20} /> Reports & Analysis
                    </NavLink>
                </li>

                <li style={{ marginTop: 'auto' }}>
                    <a href="#" onClick={handleLogout}>
                        <LogOut size={20} /> Logout
                    </a>
                </li>
            </ul>
        </nav>
    );
};

export default Sidebar;
