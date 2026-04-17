import React from 'react';
import { CloseIcon, DollarSignIcon, ShieldIcon } from './IconComponents';

interface SupportModalProps {
    onClose: () => void;
    stripeLink?: string;
}

const SupportModal: React.FC<SupportModalProps> = ({ onClose, stripeLink = "https://donate.stripe.com/placeholder" }) => {
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose} />
            
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#7D8FED]/10 rounded-xl flex items-center justify-center text-[#7D8FED]">
                            <DollarSignIcon className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight uppercase">Support Watch1Do1</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <p className="text-white font-bold text-lg leading-tight uppercase tracking-tight">
                            We’re building Watch1Do1 in public.
                        </p>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            If this analysis saved you time or helped you prepare a project, optional support helps us keep improving the AI and cover development costs during beta.
                        </p>
                        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 flex gap-4">
                            <ShieldIcon className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-wider">
                                This is not an investment, does not provide equity, and comes with no guaranteed features or timelines.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <a 
                            href={stripeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-5 bg-[#7D8FED] text-white rounded-full font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-[#7D8FED]/20"
                        >
                            Support with Stripe
                        </a>
                        <button 
                            onClick={onClose}
                            className="w-full py-4 text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-widest transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportModal;
