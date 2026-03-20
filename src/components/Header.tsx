import React from 'react';
import { SparkleIcon, SearchIcon, CameraIcon } from './IconComponents';
import { APP_LOGO_PATH, APP_NAME } from '../constants';

interface HeaderProps {
    onUploadClick: () => void;
    onAnalyzeClick: () => void;
    onLoginClick: () => void;
    onSignupClick: () => void;
    onLogoutClick: () => void;
    onProfileClick: (tab?: string) => void;
    currentUser: any;
    onHomeClick: () => void;
    onCartClick: () => void;
    cartItemCount: number;
    onAdminClick: () => void;
    onDebugClick: () => void;
    onKeyClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    onUploadClick, onAnalyzeClick, onLoginClick, onSignupClick, onLogoutClick, 
    onProfileClick, currentUser, onHomeClick, onCartClick, cartItemCount, onAdminClick,
    onDebugClick
}) => {
    return (
        <header className="fixed top-0 left-0 right-0 h-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-[100] px-6 flex items-center justify-between">
            <div className="flex items-center gap-4 cursor-pointer" onClick={onHomeClick}>
                <img src={APP_LOGO_PATH} alt="Logo" className="h-10 w-auto" />
                <span className="text-xl font-black text-white tracking-tighter">{APP_NAME}</span>
            </div>
            
            <div className="flex items-center gap-6">
                <button onClick={onDebugClick} className="text-slate-500 hover:text-white transition-colors p-2" title="Debug Panel">
                    <SearchIcon className="w-4 h-4 opacity-50" />
                </button>
                
                <button onClick={onAnalyzeClick} className="hidden md:flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <CameraIcon className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">AI Vision</span>
                </button>
                
                <div className="flex items-center gap-4">
                    <button onClick={onSignupClick} className="bg-[#7D8FED] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#6b7ae6] transition-all shadow-lg shadow-[#7D8FED]/20">Join Waitlist</button>
                </div>
            </div>
        </header>
    );
};

export default Header;
