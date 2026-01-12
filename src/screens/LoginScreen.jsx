import { useState } from 'react';

export default function LoginScreen({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // --- UPDATED ROLES ---
        if (username === 'ro' && password === 'ro123') {
            onLogin('ro');
        }
        else if (username === 'validator' && password === 'admin123') {
            onLogin('validator'); // Step 1 Validator
        }
        else if (username === 'scorer' && password === 'score123') {
            onLogin('scorer'); // Step 2 Scorer (THE NEW USER)
        }
        else {
            setError('⚠️ Invalid ID or Password');
        }
    };

    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-gray-100 font-sans">
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 text-center">

                <div className="w-20 h-20 bg-blue-700 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl shadow-md font-bold">
                    IT
                </div>

                <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
                    INFRA TRACK
                </h2>
                <p className="text-sm text-gray-500 mb-8">
                    Project Monitoring & Evaluation System
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 flex items-center justify-center gap-2">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-left">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Username</label>
                        <input
                            type="text"
                            placeholder="Enter ID"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-700 transition bg-gray-50 text-gray-900"
                        />
                    </div>

                    <div className="text-left">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Password</label>
                        <input
                            type="password"
                            placeholder="•••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-700 transition bg-gray-50 text-gray-900"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-700 hover:bg-blue-900 text-white font-bold py-3.5 rounded-lg shadow-md hover:shadow-lg transition transform active:scale-95"
                    >
                        Sign In to Dashboard
                    </button>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-left space-y-2">
                    <p className="text-xs text-blue-800 font-bold border-b border-blue-200 pb-1 mb-2">Available Accounts:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                        <span>Proponent (Step 1)</span>
                        <code className="bg-white px-1 rounded border">ro / ro123</code>

                        <span>Validator (Step 1 Check)</span>
                        <code className="bg-white px-1 rounded border">validator / admin123</code>

                        <span>Scorer (Step 2 Eval)</span>
                        <code className="bg-white px-1 rounded border">scorer / score123</code>
                    </div>
                </div>
            </div>
        </div>
    );
}