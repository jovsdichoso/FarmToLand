import { useState, useEffect } from 'react';

export default function LoadingScreen({ onLoadingComplete }) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Start exit animation after 2 seconds
        const exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, 2000);

        // Call completion callback after exit animation finishes
        const completeTimer = setTimeout(() => {
            if (onLoadingComplete) {
                onLoadingComplete();
            }
        }, 2800); // 2000ms + 800ms animation

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(completeTimer);
        };
    }, [onLoadingComplete]);

    return (
        <div 
            className={`fixed inset-0 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 flex items-center justify-center z-50 transition-all duration-[800ms] ease-in-out ${
                isExiting ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
            }`}
        >
            <div className={`text-center transition-all duration-[900ms] ease-out ${
                isExiting ? 'scale-75 opacity-0 -translate-y-8' : 'scale-100 opacity-100 translate-y-0'
            }`}>
                {/* Animated Logo/Icon */}
                <div className="mb-8">
                    <div className="w-24 h-24 mx-auto relative">
                        {/* Spinning outer ring - slower and smoother */}
                        <div className="absolute inset-0 border-4 border-blue-300 border-t-white rounded-full animate-spin-slow"></div>
                        
                        {/* Inner static circle with subtle pulse */}
                        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center shadow-lg animate-pulse-subtle">
                            <svg className="w-10 h-10 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Animated dots - smoother bounce */}
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce-smooth" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce-smooth" style={{ animationDelay: '200ms' }}></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce-smooth" style={{ animationDelay: '400ms' }}></div>
                </div>
            </div>
        </div>
    );
}
