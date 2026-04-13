import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
    // We can pass the title from the page component if needed, or use a default
    const pageTitle = children?.props?.title || 'Dashboard Overview';

    return (
        <div className="wrapper" style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content">
                <Header title={pageTitle} />
                <div className="dashboard-container">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
