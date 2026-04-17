import React from 'react';
import { APP_LOGO_PATH, APP_NAME } from '../constants';

const Footer: React.FC<{ onNavigate: (v: any) => void }> = ({ onNavigate }) => {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 py-12 px-6">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-2">
                    <div className="flex items-center gap-4 mb-6">
                        <img src={APP_LOGO_PATH} alt="Logo" className="h-8 w-8" />
                        <span className="text-lg font-black text-white tracking-tighter">{APP_NAME}</span>
                    </div>
                    <p className="text-slate-500 text-sm max-w-sm">The decentralized hub for makers. Scan any project, find the logic, and build it yourself.</p>
                </div>
                <div>
                    <h4 className="text-white font-black text-[10px] uppercase tracking-widest mb-6">Platform</h4>
                    <ul className="space-y-4">
                        <li><button onClick={() => onNavigate('about')} className="text-slate-500 hover:text-[#7D8FED] text-xs transition-colors">About Us</button></li>
                        <li><button onClick={() => onNavigate('contact')} className="text-slate-500 hover:text-[#7D8FED] text-xs transition-colors">Contact</button></li>
                        <li><button onClick={() => onNavigate('support')} className="text-white font-black text-xs hover:text-[#7D8FED] transition-colors uppercase tracking-widest">Support the Project</button></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-black text-[10px] uppercase tracking-widest mb-6">Legal</h4>
                    <ul className="space-y-4">
                        <li><button onClick={() => onNavigate('terms')} className="text-slate-500 hover:text-[#7D8FED] text-xs transition-colors">Terms</button></li>
                        <li><button onClick={() => onNavigate('privacy')} className="text-slate-500 hover:text-[#7D8FED] text-xs transition-colors">Privacy</button></li>
                        <li><button onClick={() => onNavigate('disclosure')} className="text-slate-500 hover:text-[#7D8FED] text-xs transition-colors">Affiliate Disclosure</button></li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto mt-12 pt-8 border-t border-slate-800 flex justify-between items-center">
                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">© 2026 {APP_NAME} Studio</p>
            </div>
        </footer>
    );
};

export default Footer;
