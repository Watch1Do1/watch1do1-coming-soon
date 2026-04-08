import React, { useState, useEffect } from 'react';
import { Video, Product, ProjectInsights, User } from '../types';
import { ebayService, EbayItem } from '../services/ebayService';
import { generateDeepDiveProducts } from '../services/geminiService';
import { 
    SparkleIcon, 
    PlayIcon, 
    CheckCircleIcon, 
    ShieldIcon, 
    DollarSignIcon, 
    RefreshCwIcon, 
    ExternalLinkIcon,
    PlusIcon,
    ChevronDownIcon,
    LightBulbIcon,
    PrinterIcon,
    SearchIcon
} from './IconComponents';

interface VideoPlayerViewProps {
    video: Video;
    onBack: () => void;
    onAddToCart: (product: Product) => void;
    onTipClick: () => void;
    onShare: () => void;
    currentUser: User | null;
}

const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({ 
    video, onBack, onAddToCart, onTipClick, onShare, currentUser 
}) => {
    console.log("VideoPlayerView rendering with insights:", video.insights);
    const [activeTab, setActiveTab] = useState<'insights' | 'products' | 'safety'>('insights');
    const [isInsightsExpanded, setIsInsightsExpanded] = useState(true);
    const [ebayProducts, setEbayProducts] = useState<Product[]>([]);
    const [isSearchingEbay, setIsSearchingEbay] = useState(false);
    const [deepDiveProducts, setDeepDiveProducts] = useState<Product[]>([]);
    const [isDeepDiving, setIsDeepDiving] = useState(false);
    const [hasDeepDived, setHasDeepDived] = useState(false);

    const insights = video.insights;
    const products = video.products || [];

    useEffect(() => {
        const fetchEbayProducts = async () => {
            if (activeTab === 'products' && ebayProducts.length === 0 && insights) {
                setIsSearchingEbay(true);
                const searchTerms = [
                    ...(insights.toolsRequired || []).slice(0, 2),
                    ...(insights.materialsRequired || []).slice(0, 2)
                ];

                if (searchTerms.length > 0) {
                    const allEbayItems: Product[] = [];
                    for (const term of searchTerms) {
                        const items = await ebayService.searchItems(term);
                        const mapped = items.map(item => ({
                            id: item.itemId,
                            name: item.title,
                            brand: 'eBay Partner',
                            price: {
                                amount: parseFloat(item.price.value),
                                currency: item.price.currency
                            },
                            imageUrl: item.image?.imageUrl || "https://picsum.photos/seed/ebay/200/200",
                            purchaseUrl: item.itemWebUrl,
                            retailer: 'eBay',
                            sourceType: 'affiliate' as const
                        }));
                        allEbayItems.push(...mapped);
                    }
                    // Filter unique items by ID
                    const uniqueItems = Array.from(new Map(allEbayItems.map(item => [item.id, item])).values());
                    setEbayProducts(uniqueItems);
                }
                setIsSearchingEbay(false);
            }
        };

        fetchEbayProducts();
    }, [activeTab, insights, ebayProducts.length]);

    const displayProducts = [...products, ...ebayProducts, ...deepDiveProducts];

    const handleDeepDive = async () => {
        if (isDeepDiving || hasDeepDived) return;
        setIsDeepDiving(true);
        try {
            const results = await generateDeepDiveProducts(video.title, displayProducts, video.category);
            setDeepDiveProducts(results);
            setHasDeepDived(true);
        } catch (e) {
            console.error("Deep Dive Error:", e);
        } finally {
            setIsDeepDiving(false);
        }
    };

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = `${video.title} - Watch1Do1 Project Kit`;
        window.print();
        document.title = originalTitle;
    };

    return (
        <>
            {/* Print Only View */}
            <div className="hidden print:block print-container text-black bg-white min-h-screen">
                <div className="print-header flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter">Watch1Do1 Project Kit</h1>
                        <p className="text-sm font-bold text-slate-600 mt-2 uppercase tracking-widest">{video.title}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest">Project Lead: {video.creator}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest">Generated: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mt-8">
                    <div className="print-section">
                        <h2 className="text-xl font-black uppercase tracking-tighter border-b-2 border-black mb-4 pb-1">Project Insights</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Difficulty</p>
                                <p className="text-sm font-bold uppercase">{insights?.difficulty}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Time Estimate</p>
                                <p className="text-sm font-bold uppercase">{insights?.timeEstimate}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Cost Estimate</p>
                                <p className="text-sm font-bold uppercase">{insights?.costEstimate?.low}-{insights?.costEstimate?.high} {insights?.costEstimate?.currency}</p>
                            </div>
                        </div>
                    </div>

                    <div className="print-section">
                        <h2 className="text-xl font-black uppercase tracking-tighter border-b-2 border-black mb-4 pb-1">Safety Protocols</h2>
                        <div className="space-y-3">
                            {insights?.safetyProtocols?.map((p, i) => (
                                <div key={i} className="text-xs">
                                    <p className="font-black uppercase">{p.hazard}</p>
                                    <p className="text-slate-700">{p.prevention}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="print-section mt-8">
                    <h2 className="text-xl font-black uppercase tracking-tighter border-b-2 border-black mb-4 pb-1">Required Kit</h2>
                    <div className="print-grid">
                        {products.map((p, i) => (
                            <div key={i} className="print-card flex gap-4 items-center">
                                <div className="w-16 h-16 bg-slate-100 rounded border border-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{p.brand}</p>
                                    <p className="text-xs font-bold uppercase">{p.name}</p>
                                    <p className="text-[10px] font-bold text-slate-600">{p.price.amount} {p.price.currency}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-200 text-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                        Generated by Watch1Do1 AI Visual Logic Engine. Visit watch1do1.com for more project kits.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="min-h-screen bg-[#0f172a] text-white pb-20 no-print">
                {/* Top Navigation */}
                <div className="fixed top-20 left-0 right-0 h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 z-40 px-6 flex items-center justify-between">
                    <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <span className="text-xl">←</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to Hub</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-all group">
                            <PrinterIcon className="w-4 h-4 text-[#7D8FED]" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Print Kit</span>
                        </button>
                        <button onClick={onShare} className="p-2 text-slate-400 hover:text-white transition-colors">
                            <span className="text-[10px] font-black uppercase tracking-widest">Share Project</span>
                        </button>
                    </div>
                </div>

                <div className="pt-36 container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Video & Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Video Player Placeholder */}
                        <div className="relative aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl group">
                            {video.videoUrl ? (
                                <video 
                                    src={video.videoUrl} 
                                    controls 
                                    className="w-full h-full object-cover"
                                    poster={video.thumbnailUrl}
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <img src={video.thumbnailUrl} alt={video.title} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm" />
                                    <div className="relative z-10 flex flex-col items-center gap-6">
                                        <div className="w-20 h-20 bg-[#7D8FED] rounded-full flex items-center justify-center shadow-2xl shadow-[#7D8FED]/40 group-hover:scale-110 transition-transform">
                                            <PlayIcon className="w-8 h-8 text-white ml-1" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xl font-black tracking-tighter uppercase">AI Analysis Active</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Visual Logic Extraction in Progress</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Project Header */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-[#7D8FED]/10 text-[#7D8FED] text-[10px] font-black uppercase tracking-widest rounded-full border border-[#7D8FED]/20">
                                    {video.category}
                                </span>
                                {video.isAiGenerated && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/20">
                                        <SparkleIcon className="w-3 h-3" />
                                        AI Enhanced
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">{video.title}</h1>
                            <p className="text-slate-400 text-lg leading-relaxed">{video.description}</p>
                        </div>

                        {/* Creator Info */}
                        <div className="flex items-center justify-between p-6 bg-slate-900/50 rounded-3xl border border-slate-800">
                            <div className="flex items-center gap-4">
                                <img src={video.creatorAvatarUrl || "https://picsum.photos/seed/avatar/100/100"} alt={video.creator} className="w-12 h-12 rounded-2xl object-cover border border-slate-700" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Lead</p>
                                    <p className="text-lg font-black tracking-tight">{video.creator}</p>
                                </div>
                            </div>
                            <button 
                                onClick={onTipClick}
                                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                            >
                                <DollarSignIcon className="w-4 h-4" />
                                Support Creator
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Insights & Products */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        {insights && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 flex flex-col items-center text-center">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Difficulty</span>
                                    <span className={`text-sm font-black uppercase tracking-tighter ${
                                        insights.difficulty === 'Easy' ? 'text-emerald-500' :
                                        insights.difficulty === 'Medium' ? 'text-amber-500' :
                                        insights.difficulty === 'Hard' ? 'text-rose-500' : 'text-purple-500'
                                    }`}>
                                        {insights.difficulty}
                                    </span>
                                </div>
                                <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 flex flex-col items-center text-center">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Time Est.</span>
                                    <span className="text-sm font-black uppercase tracking-tighter text-white">
                                        {insights.timeEstimate}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Tabs for Mobile/Small Screens or Sidebar for Desktop */}
                        <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden flex flex-col h-full">
                            <div className="flex border-b border-slate-800 bg-slate-900/50">
                                <button 
                                    onClick={() => setActiveTab('insights')}
                                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'insights' ? 'text-[#7D8FED]' : 'text-slate-500'}`}
                                >
                                    Insights
                                    {activeTab === 'insights' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7D8FED]" />}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('products')}
                                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'products' ? 'text-[#7D8FED]' : 'text-slate-500'}`}
                                >
                                    Kit ({displayProducts.length})
                                    {activeTab === 'products' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7D8FED]" />}
                                </button>
                                <button 
                                    onClick={() => setActiveTab('safety')}
                                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'safety' ? 'text-[#7D8FED]' : 'text-slate-500'}`}
                                >
                                    Safety
                                    {activeTab === 'safety' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7D8FED]" />}
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                                {activeTab === 'insights' && insights && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Technical Prerequisites</h4>
                                            <ul className="space-y-3">
                                                {insights.technicalPrerequisites?.map((req, i) => (
                                                    <li key={i} className="flex gap-3 items-start">
                                                        <div className="w-5 h-5 bg-[#7D8FED]/10 rounded-lg flex items-center justify-center flex-shrink-0 text-[#7D8FED]">
                                                            <CheckCircleIcon className="w-3 h-3" />
                                                        </div>
                                                        <span className="text-xs text-slate-300 leading-relaxed">{req}</span>
                                                    </li>
                                                ))}
                                                {(!insights.technicalPrerequisites || insights.technicalPrerequisites.length === 0) && (
                                                    <li className="text-xs text-slate-500 italic">No specific prerequisites identified.</li>
                                                )}
                                            </ul>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tools Required</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {insights.toolsRequired?.map((t, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-slate-800 rounded-xl text-[10px] font-bold text-[#7D8FED] border border-slate-700">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Materials List</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {insights.materialsRequired?.map((m, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-slate-800 rounded-xl text-[10px] font-bold text-slate-300 border border-slate-700">
                                                        {m}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'products' && (
                                    <div className="space-y-4 animate-fade-in">
                                        {displayProducts.length > 0 ? displayProducts.map((product, i) => (
                                            <a 
                                                key={i} 
                                                href={product.purchaseUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="block group bg-slate-800/50 border border-slate-700/50 rounded-3xl p-4 hover:border-[#7D8FED]/30 transition-all hover:bg-slate-800"
                                            >
                                                <div className="flex gap-4">
                                                    <div className="w-16 h-16 bg-slate-900 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-700">
                                                        <img src={product.imageUrl || "https://picsum.photos/seed/product/200/200"} alt={product.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <div className="flex justify-between items-start">
                                                            <p className="text-[8px] font-black text-[#7D8FED] uppercase tracking-widest mb-1">{product.brand}</p>
                                                            <ExternalLinkIcon className="w-3 h-3 text-slate-600 group-hover:text-[#7D8FED] transition-colors" />
                                                        </div>
                                                        <h5 className="text-xs font-black text-white truncate mb-1">{product.name}</h5>
                                                        <p className="text-[10px] font-bold text-slate-500">{product.price.amount} {product.price.currency}</p>
                                                    </div>
                                                </div>
                                                <div className="w-full mt-4 py-2.5 bg-slate-900 group-hover:bg-[#7D8FED] text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-slate-700 group-hover:border-[#7D8FED]/30">
                                                    <ExternalLinkIcon className="w-3 h-3" />
                                                    View on {product.retailer || 'Partner Site'}
                                                </div>
                                            </a>
                                        )) : (
                                            <div className="text-center py-12">
                                                <RefreshCwIcon className="w-8 h-8 text-slate-700 mx-auto mb-4 animate-spin" />
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                                                    {isSearchingEbay ? 'Searching eBay...' : 'Scanning Inventories...'}
                                                </p>
                                            </div>
                                        )}
                                        {isSearchingEbay && displayProducts.length > 0 && (
                                            <div className="flex items-center justify-center gap-2 py-4">
                                                <RefreshCwIcon className="w-4 h-4 text-[#7D8FED] animate-spin" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Syncing more eBay results...</span>
                                            </div>
                                        )}

                                        {!isDeepDiving && !hasDeepDived && displayProducts.length > 0 && (
                                            <button 
                                                onClick={handleDeepDive}
                                                className="w-full mt-6 p-6 bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-[2rem] hover:border-[#7D8FED]/50 hover:bg-slate-800 transition-all group flex flex-col items-center gap-3"
                                            >
                                                <div className="w-12 h-12 bg-[#7D8FED]/10 rounded-full flex items-center justify-center text-[#7D8FED] group-hover:scale-110 transition-transform">
                                                    <SearchIcon className="w-6 h-6" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Missing something?</p>
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Perform a Deep Dive for advanced tools & materials</p>
                                                </div>
                                            </button>
                                        )}

                                        {isDeepDiving && (
                                            <div className="w-full mt-6 p-8 bg-slate-900/50 border-2 border-dashed border-[#7D8FED]/30 rounded-[2rem] flex flex-col items-center gap-4 animate-pulse">
                                                <RefreshCwIcon className="w-8 h-8 text-[#7D8FED] animate-spin" />
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#7D8FED]">Deep Diving...</p>
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Analyzing project for specialized professional gear</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'safety' && insights && (
                                    <div className="space-y-6 animate-fade-in">
                                        {insights.safetyProtocols?.map((protocol, i) => (
                                            <div key={i} className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 flex gap-4">
                                                <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center flex-shrink-0 text-rose-500">
                                                    <ShieldIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h5 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">{protocol.hazard}</h5>
                                                    <p className="text-xs text-slate-400 leading-relaxed font-medium">{protocol.prevention}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {(!insights.safetyProtocols || insights.safetyProtocols.length === 0) && (
                                            <div className="text-center py-8 text-slate-500 text-xs uppercase font-bold tracking-widest">No specific safety protocols identified.</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Cost Estimate Footer */}
                            {insights && (
                                <div className="mt-auto p-6 bg-slate-950/50 border-t border-slate-800">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <DollarSignIcon className="w-4 h-4 text-emerald-500" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estimated Project Cost</span>
                                        </div>
                                        <span className="text-lg font-black tracking-tighter text-white">
                                            {insights.costEstimate?.low ?? 0}-{insights.costEstimate?.high ?? 0} {insights.costEstimate?.currency ?? 'USD'}
                                        </span>
                                    </div>
                                    <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
                                        * Estimates based on current market data and AI visual analysis. Actual costs may vary by region.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
);
};

export default VideoPlayerView;
