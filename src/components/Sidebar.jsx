import { useState } from 'react';

export default function Sidebar({ activeTab, setActiveTab, onLogout, userRole }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- NAVIGATION ITEMS BASED ON ROLE ---\r
    let navItems = [];
    if (userRole === 'ro') {
        navItems = [{ id: 'dashboard', label: 'My Projects' }];
    } else if (userRole === 'scorer') {
        navItems = [{ id: 'queue', label: 'Scoring Queue' }];
    } else if (userRole === 'bafe') {
        // --- NEW: Step 3 Validator ---
        navItems = [{ id: 'queue', label: 'Step 3 Queue' }];
    } else {
        // Default to Step 1 Validator
        navItems = [{ id: 'queue', label: 'Validation Queue' }];
    }

    const handleNavClick = (id) => {
        setActiveTab(id);
        setIsMobileMenuOpen(false);
    };

    // --- DISPLAY HELPERS ---
    const getRoleSubtitle = () => {
        if (userRole === 'ro') return 'Regional Office';
        if (userRole === 'scorer') return 'Programming Scorer';
        if (userRole === 'bafe') return 'Engineering & Cost'; // Step 3
        return 'Central Validator';
    };

    const getAccountLabel = () => {
        if (userRole === 'ro') return 'RO Account';
        if (userRole === 'scorer') return 'Scorer Account';
        if (userRole === 'bafe') return 'BAFE Central'; // Step 3
        return 'Validator Account';
    };

    const getOfficeLabel = () => {
        if (userRole === 'ro') return 'Regional Office';
        if (userRole === 'bafe') return 'BAFE Validation Unit';
        return 'Central Office';
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20">
                <div className="font-bold text-blue-800 text-lg">FMR Portal</div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Sidebar Container */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-10 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-gray-200 mt-16 md:mt-0 bg-blue-800 text-white">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-800 font-bold mr-3">
                        IT
                    </div>
                    <div>
                        <div className="font-bold leading-none">FMR Portal</div>
                        <div className="text-xs opacity-75 mt-1">{getRoleSubtitle()}</div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`
                                px-6 py-3 cursor-pointer text-sm font-medium transition-colors border-l-4
                                ${activeTab === item.id
                                    ? 'bg-blue-50 text-blue-700 border-blue-700'
                                    : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900'}
                            `}
                        >
                            {item.label}
                        </div>
                    ))}
                </nav>

                {/* User Footer */}
                <div className="p-6 border-t border-gray-200">
                    <div className="text-sm font-bold text-gray-900">
                        {getAccountLabel()}
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                        {getOfficeLabel()}
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full py-2 rounded bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}