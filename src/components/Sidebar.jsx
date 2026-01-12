import { useState } from 'react';

export default function Sidebar({ activeTab, setActiveTab, onLogout, userRole }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- NAVIGATION ITEMS BASED ON ROLE ---
    let navItems = [];
    if (userRole === 'ro') {
        navItems = [{ id: 'dashboard', label: 'My Projects' }];
    } else if (userRole === 'scorer') {
        navItems = [{ id: 'queue', label: 'Scoring Queue' }];
    } else {
        // Default to Validator
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
        return 'Central Validator';
    };

    const getAccountLabel = () => {
        if (userRole === 'ro') return 'RO Account';
        if (userRole === 'scorer') return 'Scorer Account';
        return 'Validator Account';
    };

    const getOfficeLabel = () => {
        if (userRole === 'ro') return 'Regional Office';
        return 'Central Office'; // Both Validator and Scorer are Central
    };

    return (
        <>
            {/* Mobile Menu Button - WHITE with shadow */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 p-3 bg-white text-gray-700 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all border border-gray-200"
                aria-label="Toggle menu"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMobileMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {/* Backdrop with BLUR effect */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-gray-900/30 z-40 transition-all duration-300"
                    style={{
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)'
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static
                w-[260px] bg-white border-r border-gray-200 flex flex-col h-full
                z-40 transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Brand Area */}
                <div className="p-6 border-b border-gray-200">
                    <div className="w-10 h-10 bg-blue-700 rounded mb-3 flex items-center justify-center text-white font-bold shadow-sm">IT</div>
                    <h2 className="m-0 text-lg font-bold text-gray-900">INFRA TRACK</h2>
                    <span className="text-gray-500 text-xs mt-1 block font-medium">
                        {getRoleSubtitle()}
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 overflow-y-auto">
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