import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <>
            <Navbar />
            <main className="container main-content">
                <Outlet />
            </main>
            <style>{`
        .main-content {
          padding-top: 2rem;
          padding-bottom: 2rem;
          min-height: calc(100vh - 64px); /* approx navbar height */
        }
      `}</style>
        </>
    );
};

export default Layout;
