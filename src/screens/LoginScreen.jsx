import { useState } from 'react';

export default function LoginScreen({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Role-based authentication
        if (username === 'ro' && password === 'ro123') {
            onLogin('ro'); 
        } else if (username === 'validator' && password === 'admin123') {
            onLogin('validator'); 
        } else {
            setError('⚠️ Invalid ID or Password');
        }
    };

    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-gray-100 font-sans">
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 text-center">
                
                <div className="w-20 h-20 bg-blue-700 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl shadow-md">
                </div>

                <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
                    INFRA TRACK
                </h2>
                <p className="text-sm text-gray-500 mb-8">
                    Project Monitoring System
                </p>

                {error && (
                    <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-6 flex items-center justify-center gap-2 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 text-left">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Username ID
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., validator or ro"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition duration-200 bg-gray-50 text-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition duration-200 bg-gray-50 text-gray-900"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-700 hover:bg-blue-900 text-white font-bold py-3.5 rounded-lg shadow-md hover:shadow-lg transition duration-200 ease-in-out transform active:scale-95"
                    >
                        Sign In to Dashboard
                    </button>
                </form>

                <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 font-semibold mb-2">Demo Accounts:</p>
                    <p className="text-xs text-blue-600">RO: <code>ro</code> / <code>ro123</code></p>
                    <p className="text-xs text-blue-600">Validator: <code>validator</code> / <code>admin123</code></p>
                </div>

                <p className="mt-8 text-xs text-gray-400 leading-relaxed">
                    By logging in, you agree to the<br />
                    Government Data Privacy Act (RA 10173).
                </p>
            </div>
        </div>
    );
}
