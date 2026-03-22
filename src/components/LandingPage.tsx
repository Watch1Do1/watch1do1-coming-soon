import React, { useState, useRef } from 'react';
import { SparkleIcon, CameraIcon, ShieldIcon, SearchIcon, CheckCircleIcon, BarChartIcon, DollarSignIcon, QrCodeIcon, CloseIcon, PlayIcon, ScanFrameIcon } from './IconComponents';
import { dbService } from '../services/dbService';
import { APP_LOGO_PATH } from '../constants';

interface LandingPageProps {
    onAnalyzeClick: () => void;
    onNavigate: (view: any) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAnalyzeClick, onNavigate }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [activeDetail, setActiveDetail] = useState<'doers' | 'creators' | 'partners' | null>(null);
    const detailRef = useRef<HTMLDivElement>(null);

    const handleWaitlistSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setStatus('loading');
        try {
            const result = await dbService.addToWaitlist(email);
            if (result.success) {
                setStatus('success');
                setEmail('');
            } else {
                setStatus('error');
            }
        } catch (e) {
            setStatus('error');
        }
    };

    const handleBoxClick = (type: 'doers' | 'creators' | 'partners') => {
        setActiveDetail(type);
        setTimeout(() => {
            detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    return (
        <div className="min-h-[90vh] flex flex-col items-center justify-center px-4 py-20 animate-fade-in relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#7D8FED]/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-5xl w-full text-center relative z-10">
                <div className="mb-12 flex justify-center animate-scale-in">
                    <img src={APP_LOGO_PATH} alt="Watch1Do1 Logo" className="h-48 md:h-64 w-auto object-contain drop-shadow-2xl" />
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#7D8FED]/10 border border-[#7D8FED]/20 rounded-full mb-8 animate-bounce-subtle">
                    <SparkleIcon className="w-4 h-4 text-[#7D8FED]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#7D8FED]">Coming Soon to the Maker Community</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                    THE VISUAL LOGIC <br />
                    <span className="text-[#7D8FED]">FOR MAKERS.</span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
                    Watch1Do1 uses AI to instantly extract tool lists, material kits, and safety protocols from any project video. Stop searching, start building.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-20">
                    <button 
                        onClick={onAnalyzeClick}
                        className="group relative px-10 py-5 bg-white text-slate-950 rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-2xl shadow-white/10"
                    >
                        <div className="flex items-center gap-3">
                            <CameraIcon className="w-5 h-5" />
                            Try AI Vision Beta
                        </div>
                    </button>

                    <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                        <div className="relative w-full">
                            <input 
                                type="email" 
                                required
                                placeholder="Enter your email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full py-5 px-8 bg-slate-800/50 border border-slate-700 rounded-full text-white outline-none focus:border-[#7D8FED] transition-all placeholder:text-slate-500"
                            />
                            {status === 'success' && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 flex items-center gap-2">
                                    <CheckCircleIcon className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                        <button 
                            type="submit" 
                            disabled={status === 'loading' || status === 'success'}
                            className="w-full sm:w-auto px-8 py-5 bg-[#7D8FED] text-white rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-[#6b7ae6] transition-all disabled:opacity-50 whitespace-nowrap"
                        >
                            {status === 'loading' ? 'Joining...' : status === 'success' ? 'Joined!' : 'Join Waitlist'}
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-20">
                    <button 
                        onClick={() => handleBoxClick('doers')}
                        className={`bg-slate-900/50 border p-8 rounded-[2.5rem] transition-all group text-left ${activeDetail === 'doers' ? 'border-[#7D8FED] bg-[#7D8FED]/5' : 'border-slate-800 hover:border-[#7D8FED]/30'}`}
                    >
                        <div className="w-12 h-12 bg-[#7D8FED]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <SearchIcon className="w-6 h-6 text-[#7D8FED]" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tighter">For DOers</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">Watch projects, get instant kit lists, and follow safety-checked steps. We handle the research so you can focus on the build.</p>
                    </button>
                    <button 
                        onClick={() => handleBoxClick('creators')}
                        className={`bg-slate-900/50 border p-8 rounded-[2.5rem] transition-all group text-left ${activeDetail === 'creators' ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 hover:border-emerald-500/30'}`}
                    >
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <SparkleIcon className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tighter">For Creators</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">Post your build videos and help others learn. Earn direct tips from grateful makers and monetize your expertise through automated kitting.</p>
                    </button>
                    <button 
                        onClick={() => handleBoxClick('partners')}
                        className={`bg-slate-900/50 border p-8 rounded-[2.5rem] transition-all group text-left ${activeDetail === 'partners' ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800 hover:border-amber-500/30'}`}
                    >
                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <ShieldIcon className="w-6 h-6 text-amber-500" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tighter">For Partners</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">Integrate your products directly into our AI-powered searches. Reach makers at the exact moment they need your tools or materials.</p>
                    </button>
                </div>

                {/* Detail Sections */}
                <div ref={detailRef} className="transition-all duration-500">
                    {activeDetail === 'doers' && (
                        <div className="bg-slate-900/40 border border-[#7D8FED]/20 rounded-[3rem] p-8 md:p-12 text-left relative overflow-hidden animate-slide-up">
                            <button onClick={() => setActiveDetail(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                            <div className="flex flex-col md:flex-row gap-12 items-center">
                                <div className="flex-1">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#7D8FED]/10 border border-[#7D8FED]/20 rounded-full mb-6">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-[#7D8FED]">Maker Experience</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6 leading-tight">
                                        BUILD FASTER WITH <br /><span className="text-[#7D8FED]">AI VISION.</span>
                                    </h2>
                                    <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-xl">
                                        Our AI Vision engine scans any project video to extract the "Logic" behind the build. No more pausing and squinting at screen captures.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                        <div className="flex items-start gap-3">
                                            <ScanFrameIcon className="w-5 h-5 text-[#7D8FED] mt-1" />
                                            <div>
                                                <h4 className="text-white font-bold text-sm">Instant Extraction</h4>
                                                <p className="text-slate-500 text-xs">Get full tool lists and material kits in seconds.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <ShieldIcon className="w-5 h-5 text-[#7D8FED] mt-1" />
                                            <div>
                                                <h4 className="text-white font-bold text-sm">Safety Protocols</h4>
                                                <p className="text-slate-500 text-xs">Automated safety checks for your specific project.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={onAnalyzeClick}
                                        className="px-8 py-4 bg-white text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-white/10"
                                    >
                                        Try AI Vision Beta
                                    </button>
                                </div>
                                <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 p-8 flex items-center justify-center">
                                    <div className="text-center">
                                        <PlayIcon className="w-16 h-16 text-[#7D8FED] mx-auto mb-4 opacity-50" />
                                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">AI Scanning in Progress...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeDetail === 'creators' && (
                        <div className="bg-slate-900/40 border border-emerald-500/20 rounded-[3rem] p-8 md:p-12 text-left relative overflow-hidden animate-slide-up">
                            <button onClick={() => setActiveDetail(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                            <div className="flex flex-col md:flex-row gap-12 items-center">
                                <div className="flex-1">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Creator Economy</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6 leading-tight">
                                        MONETIZE YOUR <br /><span className="text-emerald-500">EXPERTISE.</span>
                                    </h2>
                                    <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-xl">
                                        Turn your build videos into a revenue stream. We provide the tools for direct community support and automated kitting.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                        <div className="flex items-start gap-3">
                                            <QrCodeIcon className="w-5 h-5 text-emerald-500 mt-1" />
                                            <div>
                                                <h4 className="text-white font-bold text-sm">Direct Tipping</h4>
                                                <p className="text-slate-500 text-xs">Upload your QR code for instant Venmo/PayPal tips.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <DollarSignIcon className="w-5 h-5 text-emerald-500 mt-1" />
                                            <div>
                                                <h4 className="text-white font-bold text-sm">Revenue Sharing</h4>
                                                <p className="text-slate-500 text-xs">Share in affiliate commissions from partner sales.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => onNavigate('contact')}
                                        className="px-8 py-4 bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all"
                                    >
                                        Join Creator Waitlist
                                    </button>
                                </div>
                                <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center">
                                    <QrCodeIcon className="w-32 h-32 text-emerald-500/20 mb-4" />
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Scan to Tip Creator</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeDetail === 'partners' && (
                        <div className="bg-slate-900/40 border border-amber-500/20 rounded-[3rem] p-8 md:p-12 text-left relative overflow-hidden animate-slide-up">
                            <button onClick={() => setActiveDetail(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                            <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
                                <div className="flex-1">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">Partner Ecosystem</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6 leading-tight">
                                        IN-HOUSE <span className="text-amber-500">COMMERCE</span> <br /> ENGINE.
                                    </h2>
                                    <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-xl">
                                        Keep customers in-house with native checkout. Our AI Vision engine learns your catalog to recommend products at the perfect moment of discovery.
                                    </p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                        <div className="flex items-start gap-3">
                                            <BarChartIcon className="w-5 h-5 text-amber-500 mt-1" />
                                            <div>
                                                <h4 className="text-white font-bold text-sm">Performance Console</h4>
                                                <p className="text-slate-500 text-xs">Track SKU performance across the entire system.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <ScanFrameIcon className="w-5 h-5 text-amber-500 mt-1" />
                                            <div>
                                                <h4 className="text-white font-bold text-sm">AI Catalog Sync</h4>
                                                <p className="text-slate-500 text-xs">Your products automatically tagged in any video.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button 
                                            onClick={() => onNavigate('contact')}
                                            className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-amber-500/20"
                                        >
                                            Partner Inquiry
                                        </button>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Multi-Brand Checkout Enabled</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex-1 w-full max-w-md">
                                    <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-2xl transform hover:-translate-y-2 transition-transform duration-500">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="h-2 w-24 bg-slate-800 rounded-full"></div>
                                            <div className="h-6 w-6 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="h-20 bg-slate-900/50 rounded-xl border border-slate-800/50 p-4">
                                                <div className="flex justify-between items-end h-full">
                                                    {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                                        <div key={i} className="w-3 bg-amber-500/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="h-16 bg-slate-900/50 rounded-xl border border-slate-800/50 p-3">
                                                    <div className="h-2 w-12 bg-slate-800 rounded-full mb-2"></div>
                                                    <div className="h-4 w-16 bg-amber-500/20 rounded-md"></div>
                                                </div>
                                                <div className="h-16 bg-slate-900/50 rounded-xl border border-slate-800/50 p-3">
                                                    <div className="h-2 w-12 bg-slate-800 rounded-full mb-2"></div>
                                                    <div className="h-4 w-16 bg-amber-500/20 rounded-md"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
