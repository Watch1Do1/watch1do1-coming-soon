import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon, SparkleIcon, CheckCircleIcon, ShieldIcon, SearchIcon, XCircleIcon, PlusIcon, CameraIcon, ScanFrameIcon, YouTubeIcon, PhotoIcon, LinkIcon, PlayIcon, LightBulbIcon, ChevronDownIcon, RefreshCwIcon } from './IconComponents';
import { emailService } from '../services/emailService';
import { UploadType, ProjectCategory, User } from '../types';

const ModalWrapper: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[200] flex items-center justify-center p-6 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 md:p-12 max-w-2xl w-full relative my-auto">
            <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
                <CloseIcon className="w-6 h-6" />
            </button>
            {children}
        </div>
    </div>
);

export const AuthModal: React.FC<{ onClose: () => void; onSubmit: (email: string) => void }> = ({ onClose, onSubmit }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setSubmitted(true);
            onSubmit(email);
        }
    };

    if (submitted) {
        return (
            <ModalWrapper onClose={onClose}>
                <div className="text-center">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                        <CheckCircleIcon className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">You're on the list!</h2>
                    <p className="text-slate-400 mb-8 text-sm leading-relaxed">We'll notify you as soon as the full Watch1Do1 platform is ready for makers. Stay tuned for the future of DIY.</p>
                    <button onClick={onClose} className="w-full py-4 bg-slate-800 text-white rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-slate-700 transition-all">Back to Hub</button>
                </div>
            </ModalWrapper>
        );
    }

    return (
        <ModalWrapper onClose={onClose}>
            <div className="text-center">
                <div className="w-16 h-16 bg-[#7D8FED]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#7D8FED]/30">
                    <SparkleIcon className="w-8 h-8 text-[#7D8FED]" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Join the Waitlist</h2>
                <p className="text-slate-400 mb-8 text-sm leading-relaxed">Watch1Do1 is currently in private testing. Sign up with your email to get early access and updates on our launch.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="email" 
                        required 
                        placeholder="Enter your email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full py-4 px-6 bg-slate-800 border border-slate-700 rounded-full text-white focus:border-[#7D8FED] outline-none transition-all placeholder:text-slate-400"
                    />
                    <button type="submit" className="w-full py-4 bg-[#7D8FED] text-white rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-[#6b7ae6] transition-all shadow-xl shadow-[#7D8FED]/20">Notify Me</button>
                </form>
            </div>
        </ModalWrapper>
    );
};

export const AboutUs: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div className="container mx-auto px-4 py-20 animate-fade-in max-w-4xl">
      <button onClick={onBack} className="mb-12 text-[#7D8FED] font-black uppercase text-xs tracking-widest">← Back</button>
      
      <div className="space-y-12">
        <header className="text-center space-y-4">
          <SparkleIcon className="w-16 h-16 text-[#7D8FED] mx-auto mb-6" />
          <h1 className="text-6xl font-black text-white tracking-tighter">The Watch1Do1 Mission</h1>
          <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
            We are building the ultimate visual logic engine for the maker economy. Whether you're watching, creating, or providing the tools, we've got you covered.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-800 p-8 rounded-[2rem] border border-slate-700">
            <SearchIcon className="w-10 h-10 text-[#7D8FED] mb-6" />
            <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tighter">For DOers</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Watch projects and get instant, AI-extracted kit lists. We handle the technical research so you can focus on the craft, not the checkout.</p>
          </div>
          <div className="bg-slate-800 p-8 rounded-[2rem] border border-slate-700">
            <SparkleIcon className="w-10 h-10 text-emerald-500 mb-6" />
            <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tighter">For Creators</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Share your build videos and help others grow. Earn direct tips from your community and monetize your knowledge through automated affiliate kitting.</p>
          </div>
          <div className="bg-slate-800 p-8 rounded-[2rem] border border-slate-700">
            <ShieldIcon className="w-10 h-10 text-amber-500 mb-6" />
            <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tighter">For Partners</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Integrate your products into our AI-powered searches. Connect with makers at the exact moment they need your specific tools or materials.</p>
          </div>
        </div>

        <section className="bg-[#7D8FED]/5 border border-[#7D8FED]/20 p-12 rounded-[3rem] text-center">
            <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter">The Future of DIY</h2>
            <p className="text-slate-400 leading-relaxed max-w-xl mx-auto">
                Watch1Do1 is evolving into a high-performance AI assistant for carpenters, engineers, artists, and DIY enthusiasts. Join our waitlist to be among the first to experience the future of making.
            </p>
        </section>
      </div>
    </div>
);

export const PrivacyPolicy: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-fade-in">
        <button onClick={onBack} className="text-[#7D8FED] text-[10px] font-black uppercase tracking-widest mb-8 hover:underline">← Back to Hub</button>
        <h1 className="text-5xl font-black text-white mb-12 tracking-tighter uppercase">Privacy Policy</h1>
        <div className="space-y-8 text-slate-400 leading-relaxed">
            <section>
                <h2 className="text-white font-bold text-xl mb-4">1. Information We Collect</h2>
                <p>We collect information you provide directly to us, such as when you sign up for our waitlist or contact us for support. This may include your email address and any other information you choose to provide.</p>
            </section>
            <section>
                <h2 className="text-white font-bold text-xl mb-4">2. Cookies and Tracking</h2>
                <p>We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
                <p className="mt-2">We specifically track interactions with project "Kits" and product links to improve our AI analysis and partner recommendations. This data helps us understand which tools and materials are most relevant to our community.</p>
            </section>
            <section>
                <h2 className="text-white font-bold text-xl mb-4">3. How We Use Your Information</h2>
                <p>We use the information we collect to provide, maintain, and improve our services, and to communicate with you about updates and early access opportunities.</p>
            </section>
            <section>
                <h2 className="text-white font-bold text-xl mb-4">4. Data Security</h2>
                <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
            </section>
        </div>
    </div>
);

export const TermsOfService: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-fade-in">
        <button onClick={onBack} className="text-[#7D8FED] text-[10px] font-black uppercase tracking-widest mb-8 hover:underline">← Back to Hub</button>
        <h1 className="text-5xl font-black text-white mb-12 tracking-tighter uppercase">Terms of Service</h1>
        <div className="space-y-8 text-slate-400 leading-relaxed">
            <p>By using Watch1Do1, you agree to these terms. Please read them carefully.</p>
            <section>
                <h2 className="text-white font-bold text-xl mb-4">1. Use of the Service</h2>
                <p>You may use our service only as permitted by law. We may suspend or stop providing our services to you if you do not comply with our terms or policies.</p>
            </section>
            <section>
                <h2 className="text-white font-bold text-xl mb-4">2. Affiliate and Partner Links</h2>
                <p>Our service contains links to third-party websites. If you click on a partner link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.</p>
                <p className="mt-2">We may receive a commission for purchases made through these links, which helps support the platform and our creators.</p>
            </section>
            <section>
                <h2 className="text-white font-bold text-xl mb-4">3. Content</h2>
                <p>Our services allow you to upload, submit, store, send or receive content. You retain ownership of any intellectual property rights that you hold in that content.</p>
            </section>
        </div>
    </div>
);

export const ContactUs: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        const success = await emailService.sendContactEmail(formData.name, formData.email, `[${formData.subject}] ${formData.message}`);
        if (success) {
            setStatus('success');
            setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
        } else {
            setStatus('error');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-20 animate-fade-in">
            <button onClick={onBack} className="text-[#7D8FED] text-[10px] font-black uppercase tracking-widest mb-8 hover:underline">← Back to Hub</button>
            <div className="flex flex-col md:flex-row gap-12">
                <div className="flex-1">
                    <h1 className="text-5xl font-black text-white mb-6 tracking-tighter uppercase leading-none">Get in <br /><span className="text-[#7D8FED]">Touch.</span></h1>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Have questions about the platform, technical integration, or interested in becoming a verified partner? Our team is ready to help you scale your maker ecosystem.
                    </p>
                    
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                <ShieldIcon className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm">Partner Relations</h4>
                                <p className="text-slate-500 text-xs">partners@watch1do1.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                            <div className="w-10 h-10 bg-[#7D8FED]/10 rounded-xl flex items-center justify-center border border-[#7D8FED]/20">
                                <SparkleIcon className="w-5 h-5 text-[#7D8FED]" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm">Creator Support</h4>
                                <p className="text-slate-500 text-xs">creators@watch1do1.com</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-[1.5]">
                    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 md:p-10 shadow-2xl">
                        {status === 'success' ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                                    <CheckCircleIcon className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Transmission Received</h2>
                                <p className="text-slate-400 mb-8 text-sm">We've received your inquiry and will route it to the appropriate department shortly.</p>
                                <button onClick={() => setStatus('idle')} className="w-full py-4 bg-slate-800 text-white rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-slate-700 transition-all">Send Another</button>
                            </div>
                        ) : (
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            placeholder="Your Name" 
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full py-4 px-6 bg-slate-800 border border-slate-700 rounded-full text-white outline-none focus:border-[#7D8FED] placeholder:text-slate-600 text-sm" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Email</label>
                                        <input 
                                            type="email" 
                                            required
                                            placeholder="email@example.com" 
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full py-4 px-6 bg-slate-800 border border-slate-700 rounded-full text-white outline-none focus:border-[#7D8FED] placeholder:text-slate-600 text-sm" 
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Subject</label>
                                    <select 
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full py-4 px-6 bg-slate-800 border border-slate-700 rounded-full text-white outline-none focus:border-[#7D8FED] text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="General Inquiry">General Inquiry</option>
                                        <option value="Partner/Merchant Inquiry">Partner/Merchant Inquiry</option>
                                        <option value="Creator Verification">Creator Verification</option>
                                        <option value="Technical Support">Technical Support</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Message</label>
                                    <textarea 
                                        required
                                        placeholder="How can we help you?" 
                                        rows={4} 
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full py-5 px-6 bg-slate-800 border border-slate-700 rounded-[2rem] text-white outline-none focus:border-[#7D8FED] resize-none placeholder:text-slate-600 text-sm"
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={status === 'sending'}
                                    className="w-full py-5 bg-[#7D8FED] text-white rounded-full font-black uppercase text-xs tracking-widest hover:bg-[#6b7ae6] transition-all disabled:opacity-50 shadow-xl shadow-[#7D8FED]/20 mt-4"
                                >
                                    {status === 'sending' ? 'Transmitting...' : 'Send Inquiry'}
                                </button>
                                {status === 'error' && <p className="text-rose-500 text-center text-[10px] font-black uppercase tracking-widest mt-4">Transmission Failed. Please retry.</p>}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Stub: React.FC<{ name: string; onClose: () => void }> = ({ name, onClose }) => (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 max-w-md w-full text-center">
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">{name}</h2>
            <p className="text-slate-400 mb-8 text-sm">This module is being calibrated. Check back soon.</p>
            <button onClick={onClose} className="w-full py-4 bg-slate-800 text-white rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-slate-700 transition-all">Close</button>
        </div>
    </div>
);

export const UploadModal = (props: any) => <Stub name="Upload Studio" onClose={props.onClose} />;
export const DirectTipModal = (props: any) => <Stub name="Maker Tip" onClose={props.onClose} />;
export const ProfilePage = (props: any) => <div className="p-12 text-center text-white">Profile Page <button onClick={props.onBack} className="block mx-auto mt-4 underline">Back</button></div>;
export const ManageSubscriptionModal = (props: any) => <Stub name="Subscriptions" onClose={props.onClose} />;
export const ShoppingCartPanel = (props: any) => props.isOpen ? <Stub name="Shopping Cart" onClose={props.onClose} /> : null;
export const NoResultsAnalysis = (props: any) => <div className="p-12 text-center text-slate-500">No results found for "{props.searchQuery}". <button onClick={props.onAnalyzeURL} className="text-[#7D8FED] underline">Try AI Scan?</button></div>;
export const AdminDashboard = (props: any) => <div className="p-12 text-center text-white">Admin Dashboard <button onClick={props.onBack} className="block mx-auto mt-4 underline">Back</button></div>;
export const DebugTrackingPanel = (props: any) => {
    if (!props.isOpen) return null;

    const handleClearData = () => {
        if (window.confirm("Are you sure you want to clear all local data? This will reset your videos, waitlist, and user profile on this browser.")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-500/30">
                    <RefreshCwIcon className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Debug Panel</h2>
                <p className="text-slate-400 mb-8 text-sm">Use this panel to manage your local development environment.</p>
                
                <div className="space-y-4">
                    <button 
                        onClick={handleClearData}
                        className="w-full py-4 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-rose-500/20 transition-all"
                    >
                        Clear Local Data (Reset DB)
                    </button>
                    <button onClick={props.onClose} className="w-full py-4 bg-slate-800 text-white rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-slate-700 transition-all">Close</button>
                </div>
            </div>
        </div>
    );
};
export const CheckoutExperience = (props: any) => <Stub name="Checkout" onClose={props.onClose} />;
export const AffiliateCheckoutModal = (props: any) => <Stub name="Partner Sync" onClose={props.onClose} />;
export const EmailKitModal = (props: any) => <Stub name="Email Kit" onClose={props.onClose} />;
export const ShareModal = (props: any) => <Stub name="Share Build" onClose={props.onClose} />;
export const AffiliateDisclosure = (props: any) => <div className="p-12 text-center text-white">Affiliate Disclosure <button onClick={props.onBack} className="block mx-auto mt-4 underline">Back</button></div>;
