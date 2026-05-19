import React, { useState, useRef } from 'react';
import { SparkleIcon, CameraIcon, ShieldIcon, SearchIcon, CheckCircleIcon, BarChartIcon, DollarSignIcon, QrCodeIcon, CloseIcon, PlayIcon, ScanFrameIcon } from './IconComponents';
import { dbService } from '../services/dbService';
import { APP_LOGO_PATH } from '../constants';

interface LandingPageProps {
    onAnalyzeClick: () => void;
    onSampleClick: () => void;
    onNavigate: (view: any) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAnalyzeClick, onSampleClick, onNavigate }) => {
    const [email, setEmail] = useState('');
    const [creatorEmail, setCreatorEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [creatorStatus, setCreatorStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [activeDetail, setActiveDetail] = useState<'doers' | 'creators' | 'partners' | null>(null);
    const detailRef = useRef<HTMLDivElement>(null);

    const handleWaitlistSubmit = async (e: React.FormEvent, type: string = 'maker') => {
        e.preventDefault();
        const isCreatorType = type === 'creator' || type === 'creator_network';
        const emailToUse = isCreatorType ? creatorEmail : email;
        if (!emailToUse) return;
        
        if (isCreatorType) setCreatorStatus('loading');
        else setStatus('loading');

        try {
            const result = type === 'creator_network' 
                ? await dbService.addToCreatorWaitlist(emailToUse)
                : await dbService.addToWaitlist(emailToUse, type);

            if (result.success) {
                if (isCreatorType) {
                    setCreatorStatus('success');
                    setCreatorEmail('');
                } else {
                    setStatus('success');
                    setEmail('');
                }
            } else {
                if (isCreatorType) setCreatorStatus('error');
                else setStatus('error');
            }
        } catch (e) {
            if (isCreatorType) setCreatorStatus('error');
            else setStatus('error');
        }
    };

    const handleBoxClick = (type: 'doers' | 'creators' | 'partners') => {
        setActiveDetail(type);
        setTimeout(() => {
            detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    return (
        <main className="min-h-[90vh] flex flex-col items-center justify-center px-4 py-20 animate-fade-in relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#7D8FED]/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-5xl w-full text-center relative z-10">
                <header className="mb-12 flex justify-center animate-scale-in">
                    <img src={APP_LOGO_PATH} alt="Watch1Do1 Logo" className="h-48 md:h-64 w-auto object-contain drop-shadow-2xl" />
                </header>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#7D8FED]/10 border border-[#7D8FED]/20 rounded-full mb-8 animate-bounce-subtle">
                    <SparkleIcon className="w-4 h-4 text-[#7D8FED]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#7D8FED]">Early Access Beta Live</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                    KNOW WHAT IT <br />
                    <span className="text-[#7D8FED]">REALLY TAKES.</span>
                </h1>

                <section aria-label="Introduction">
                    <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-3xl mx-auto mb-6 leading-relaxed">
                        Watch1Do1 turns tutorials, videos, and images into clear, build‑ready plans — with real materials, real costs, and real-world availability.
                    </p>

                    <p className="text-sm md:text-base text-[#7D8FED] font-bold max-w-2xl mx-auto mb-12 uppercase tracking-wider">
                        Know what it really takes — before you start.
                    </p>
                </section>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
                    <button 
                        onClick={onAnalyzeClick}
                        className="group relative px-10 py-5 bg-white text-slate-950 rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-2xl shadow-white/10"
                    >
                        <div className="flex items-center gap-3">
                            <CameraIcon className="w-5 h-5" />
                            Try the Vision Scanner
                        </div>
                    </button>

                    <div className="relative group">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-max opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#7D8FED] bg-[#7D8FED]/10 px-2 py-1 rounded border border-[#7D8FED]/20">See what it really takes</span>
                        </div>
                        <button 
                            onClick={onSampleClick}
                            className="group relative px-10 py-5 bg-slate-900 text-white border border-slate-800 rounded-full font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <PlayIcon className="w-5 h-5 text-[#7D8FED]" />
                                See Sample Result
                            </div>
                        </button>
                    </div>

                    <form onSubmit={(e) => handleWaitlistSubmit(e)} className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
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
                            {status === 'loading' ? 'Joining...' : status === 'success' ? 'Joined!' : 'Stay in the loop'}
                        </button>
                    </form>
                </div>

                {/* Live Activity Ticker */}
                <div className="mb-20 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Activity</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
                        {[
                            { user: "Maker_42", action: "extracted tool list", time: "2m ago" },
                            { user: "CraftyJane", action: "generated material kit", time: "5m ago" },
                            { user: "WoodWorkPro", action: "scanned safety protocol", time: "12m ago" }
                        ].map((item, i) => (
                            <div key={i} className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-full flex items-center gap-3 text-[10px]">
                                <span className="text-white font-bold">{item.user}</span>
                                <span className="text-slate-500 uppercase tracking-tighter">{item.action}</span>
                                <span className="text-[#7D8FED] font-black">{item.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* How it Works Section */}
                <section className="mb-32 text-center" id="how-it-works">
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-16">How Watch1Do1 Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <article className="space-y-4">
                            <div className="w-12 h-12 bg-[#7D8FED]/10 rounded-full flex items-center justify-center mx-auto text-[#7D8FED] font-black" aria-hidden="true">1</div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Start with what you already have</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Paste a video link, upload a photo, or share a tutorial.</p>
                        </article>
                        <article className="space-y-4">
                            <div className="w-12 h-12 bg-[#7D8FED]/10 rounded-full flex items-center justify-center mx-auto text-[#7D8FED] font-black" aria-hidden="true">2</div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">See the real requirements</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">We identify the specific tools, materials, estimated cost, and safety considerations — not just generic suggestions.</p>
                        </article>
                        <article className="space-y-4">
                            <div className="w-12 h-12 bg-[#7D8FED]/10 rounded-full flex items-center justify-center mx-auto text-[#7D8FED] font-black" aria-hidden="true">3</div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Build with confidence</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Know what’s required before you buy anything, and source parts from real marketplaces when you’re ready.</p>
                        </article>
                    </div>
                </section>

                {/* Emotional Hook Section */}
                <div className="mb-32 bg-slate-900/50 border border-slate-800 rounded-[3rem] p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#7D8FED]/50 to-transparent"></div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-8">If You’ve Ever Started a Project That…</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
                        {[
                            "…looked simple, until halfway through",
                            "…cost more than expected",
                            "…required one missing tool",
                            "…stalled because you weren’t quite sure"
                        ].map((text, i) => (
                            <div key={i} className="flex items-center gap-3 text-left bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                <span className="text-slate-300 text-sm font-medium">{text}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xl font-black text-[#7D8FED] uppercase tracking-tighter">Watch1Do1 exists to eliminate those moments.</p>
                </div>

                {/* Grounded in the Real World Section */}
                <section className="mb-32 flex flex-col md:flex-row items-center gap-12 text-left">
                    <div className="flex-1">
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-6">Grounded in the Real World</h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            We don’t guess what’s needed — we verify what’s available. Watch1Do1 connects projects to real‑world marketplaces, so parts aren’t just theoretical — they’re findable.
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true"></div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Inventory Sync</span>
                            </div>
                            <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#7D8FED]" aria-hidden="true"></div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Marketplace Verified</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full bg-slate-950 rounded-[2.5rem] border border-slate-800 p-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#7D8FED]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="space-y-4 relative z-10">
                            <div className="h-4 w-1/3 bg-slate-800 rounded-full"></div>
                            <div className="h-24 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Marketplace Infrastructure</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-12 bg-slate-900 rounded-xl border border-slate-800"></div>
                                <div className="h-12 bg-slate-900 rounded-xl border border-slate-800"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonial Section */}
                <div className="mb-32 text-center italic">
                    <p className="text-2xl text-slate-300 font-medium max-w-2xl mx-auto mb-4">
                        “I would have started this project completely differently if I’d known this upfront.”
                    </p>
                    <p className="text-[#7D8FED] font-black uppercase tracking-widest text-sm">— Early tester</p>
                </div>

                {/* Early Access Section */}
                <section className="mb-32 text-center" id="early-access">
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-6">The Project Studio Is Coming</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12">
                        The Vision Scanner is your first look. The full Watch1Do1 Project Studio adds curated build kits, cost and safety insights, completion tracking, and builder feedback.
                    </p>
                    
                    <form onSubmit={(e) => handleWaitlistSubmit(e)} className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md mx-auto">
                        <div className="relative w-full">
                            <input 
                                type="email" 
                                required
                                placeholder="Enter your email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full py-5 px-8 bg-slate-800/50 border border-slate-700 rounded-full text-white outline-none focus:border-[#7D8FED] transition-all placeholder:text-slate-500"
                                aria-label="Email address for early access"
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
                            {status === 'loading' ? 'Requesting...' : status === 'success' ? 'Requested!' : 'Request Early Access'}
                        </button>
                    </form>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-20" aria-label="User Roles">
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
                        <p className="text-slate-400 text-sm leading-relaxed">Connect your products to real projects at the moment builders are planning—not after they’ve made up their minds.</p>
                    </button>
                </section>

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
                                        BUILD FASTER WITH <br /><span className="text-[#7D8FED]">VISION LOGIC.</span>
                                    </h2>
                                    <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-xl">
                                        Our Vision engine scans any project video to extract the "Logic" behind the build. No more pausing and squinting at screen captures.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                        <div className="flex items-start gap-3">
                                            <ScanFrameIcon className="w-5 h-5 text-[#7D8FED] mt-1" />
                                            <div>
                                                <h4 className="text-white font-bold text-sm">Instant Ready-Plans</h4>
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
                                        Try the Vision Scanner
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
                                    <div className="flex flex-col gap-4 max-w-md">
                                        <form onSubmit={(e) => handleWaitlistSubmit(e, 'creator_network')} className="flex flex-col sm:flex-row gap-3">
                                            <input 
                                                type="email" 
                                                required
                                                placeholder="Creator Email" 
                                                value={creatorEmail}
                                                onChange={(e) => setCreatorEmail(e.target.value)}
                                                className="flex-1 py-4 px-6 bg-slate-800/50 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 transition-all placeholder:text-slate-500 text-sm"
                                            />
                                            <button 
                                                type="submit"
                                                disabled={creatorStatus === 'loading' || creatorStatus === 'success'}
                                                className="px-8 py-4 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                                            >
                                                {creatorStatus === 'loading' ? 'Joining...' : creatorStatus === 'success' ? 'Joined!' : 'Join Network'}
                                            </button>
                                        </form>
                                    </div>
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
                                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6 leading-tight uppercase">
                                        EXECUTION INTELLIGENCE FOR <br /><span className="text-amber-500">REAL‑WORLD BUILDS.</span>
                                    </h2>
                                    <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-xl">
                                        Watch1Do1 connects your products to real projects at the moment builders are planning—not after they’ve made up their minds.
                                    </p>
                                    <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-xl">
                                        Our platform transforms instructional content into execution‑ready Planning Kits, showing exactly how and when your products are used in real builds. We surface demand before the final decision, so customers arrive informed, prepared, and confident.
                                    </p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                                        <div className="space-y-2">
                                            <h4 className="text-white font-black text-xs uppercase tracking-tight">Project‑Embedded Discovery</h4>
                                            <p className="text-slate-500 text-[10px] leading-relaxed">Your products appear directly inside build workflows—where intent is highest and decisions are made.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-white font-black text-xs uppercase tracking-tight">Planning‑Stage Signals</h4>
                                            <p className="text-slate-500 text-[10px] leading-relaxed">See how builders move from viewing a project to preparing a complete kit, including which items are essential, optional, or substituted.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-white font-black text-xs uppercase tracking-tight">Availability Awareness</h4>
                                            <p className="text-slate-500 text-[10px] leading-relaxed">We analyze live market data to ensure recommended products are practical, obtainable, and correctly positioned.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-white font-black text-xs uppercase tracking-tight">Execution Friction Insights</h4>
                                            <p className="text-slate-500 text-[10px] leading-relaxed">Understand where purchase fragmentation causes drop‑off—and where unified execution could unlock higher conversion.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-2xl">
                                            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">Partner Demand Console</h4>
                                            <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1 h-1 rounded-full bg-amber-500"></div>
                                                    Project Usage Tracking
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1 h-1 rounded-full bg-amber-500"></div>
                                                    Kit Inclusion Data
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1 h-1 rounded-full bg-amber-500"></div>
                                                    Product Pairings
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1 h-1 rounded-full bg-amber-500"></div>
                                                    Market Behavior
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-slate-400 text-xs font-medium">
                                                Interested in publishing authoritative build kits or understanding how your products are used in real projects?
                                            </p>
                                            <button 
                                                onClick={() => onNavigate('contact')}
                                                className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-amber-500/20"
                                            >
                                                Apply to Partner Ecosystem
                                            </button>
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

                <footer className="mt-20 pt-12 border-t border-slate-800 text-center">
                    <p className="text-slate-500 text-sm font-medium italic mb-8">
                        Most problems don’t happen during the build. <br />
                        They happen before you ever start.
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
                        © {new Date().getFullYear()} Watch1Do1. All rights reserved.
                    </p>
                </footer>
            </div>
        </main>
    );
};

export default LandingPage;
