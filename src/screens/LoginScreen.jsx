// src/screens/LoginScreen.jsx
import { useState } from 'react';

export default function LoginScreen({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSigningIn(true);

        // Pass email/password to App.jsx to handle Firebase Logic
        try {
            await onLogin(email, password);
        } catch (err) {
            setError('⚠️ Login Failed: ' + err.message);
            setIsSigningIn(false);
        }
    };

    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-gray-100 font-sans">
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 text-center">

                <div className="w-20 h-20 bg-blue-700 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl shadow-md font-bold">
                    IT
                </div>

                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">FMR Dashboard</h2>
                <p className="text-gray-500 mb-8">Sign in with your centralized account</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 break-words">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-700 transition bg-gray-50 text-gray-900"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-700 transition bg-gray-50 text-gray-900"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSigningIn}
                        className="w-full bg-blue-700 hover:bg-blue-900 text-white font-bold py-3.5 rounded-lg shadow-md hover:shadow-lg transition transform active:scale-95 disabled:opacity-50"
                    >
                        {isSigningIn ? 'Authenticating...' : 'Sign In to Dashboard'}
                    </button>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-left space-y-2">
                    <p className="text-xs text-blue-800 font-bold border-b border-blue-200 pb-1 mb-2">Instructions:</p>
                    <p className="text-xs text-blue-700">
                        Please use the account provided by the administrator.
                        Your access level is determined by your registered email.
                    </p>
                </div>
            </div>
        </div>
    );
}