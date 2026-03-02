import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen w-full bg-white dark:bg-[#020617] transition-colors duration-300">
            <Sidebar />
            <main className="flex-1 min-w-0 overflow-auto">
                <div className="p-4 pt-16 lg:pt-4 sm:p-6 lg:p-8 xl:p-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
