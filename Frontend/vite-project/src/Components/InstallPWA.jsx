import React, { useState, useEffect } from 'react';

const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstall, setShowInstall] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            setShowInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowInstall(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        // We've used the prompt, and can't use it again
        setDeferredPrompt(null);
        setShowInstall(false);
    };

    if (!showInstall) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-sm animate-fade-in-up">
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-4 rounded-[24px] shadow-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 p-0.5 shadow-lg flex-shrink-0">
                        <div className="w-full h-full rounded-[14px] overflow-hidden bg-white flex items-center justify-center p-1">
                            <img src="/pwa-icon.png" alt="App Icon" className="w-full h-full object-contain" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-800">Install CropPlan</h3>
                        <p className="text-xs text-gray-500">Add to home screen for quick access</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={handleInstallClick}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-green-500/20 active:scale-95 transition-transform"
                    >
                        Install
                    </button>
                    <button 
                        onClick={() => setShowInstall(false)}
                        className="text-[10px] text-gray-400 font-medium hover:text-gray-600 underline text-center"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPWA;
