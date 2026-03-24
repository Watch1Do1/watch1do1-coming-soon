/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import VideoCard from './components/VideoCard';
import AnalyzeModal from './components/AnalyzeModal';
import VideoPlayerView from './components/VideoPlayerView';
import LandingPage from './components/LandingPage';
import { 
    UploadModal, 
    DirectTipModal, 
    AuthModal, 
    ProfilePage, 
    ManageSubscriptionModal, 
    ShoppingCartPanel, 
    NoResultsAnalysis, 
    AdminDashboard, 
    DebugTrackingPanel, 
    CheckoutExperience, 
    AffiliateCheckoutModal, 
    EmailKitModal, 
    ShareModal, 
    ContactUs, 
    AboutUs, 
    TermsOfService, 
    PrivacyPolicy, 
    AffiliateDisclosure 
} from './components/Stubs';
import { 
    generateProductsFromText, 
    generateProductsFromImages, 
    generateComplementaryProducts, 
    generateProductsFromUrl,
    generateV3ProjectInsights
} from './services/geminiService';
import { dbService } from './services/dbService';
import { stripeService } from './services/stripeService';
import { emailService } from './services/emailService';
import { bigCommerceService } from './services/bigCommerceService';
import { Video, UploadType, User, Product, CartItem, ProjectCategory, MakerRank, VideoStatus } from './types';
import { SparkleIcon, SearchIcon, CategoryIcon, ChevronDownIcon, CameraIcon, CloseIcon } from './components/IconComponents';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const LOADING_MESSAGES = [
    "Scanning transcript for mentioned tools...",
    "Spotting materials in the frames...",
    "Searching merchant inventory...",
    "Performing V3 Cost Estimation...",
    "Running Halsted Safety Sweep...",
    "Building your custom project studio..."
];

const CATEGORIES: ProjectCategory[] = [
  'Home Improvement', 'DIY Crafts', 'Cooking & Kitchen', 'Gardening', 
  'Tech & Gadgets', 'Fitness & Sports', 'Automotive', 'Fashion & Beauty', 
  'Kids & Toys', 'Survival & Outdoors', 'Music', 'Pets & Animal Care', 
  'Art & Photography', 'Hobbies', 'Other'
];

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => { resolve((reader.result as string).split(',')[1]); };
      reader.onerror = (error) => reject(error);
    });
};

const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.onloadeddata = () => { video.currentTime = 1; };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) { ctx.drawImage(video, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL('image/jpeg')); }
        else { resolve(`https://picsum.photos/seed/${encodeURIComponent(file.name)}/600/400`); }
        URL.revokeObjectURL(video.src);
      };
      video.onerror = () => { resolve(`https://picsum.photos/seed/${encodeURIComponent(file.name)}/600/400`); URL.revokeObjectURL(video.src); };
    });
};

import { APP_LOGO_PATH, APP_NAME } from './constants';

const SAMPLE_VIDEO: Video = {
    id: 1,
    title: "Modern Floating Shelf Build",
    creator: "Master Maker",
    creatorId: "sample@watch1do1.com",
    status: 'published',
    category: 'Home Improvement',
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://picsum.photos/seed/shelf/800/450",
    products: [
        { id: 'p1', name: "DeWalt Cordless Drill", price: { amount: 129.99, currency: 'USD' }, imageUrl: "https://picsum.photos/seed/drill/200/200", purchaseUrl: "#", retailer: "Home Depot", sourceType: 'affiliate' },
        { id: 'p2', name: "Oak Wood Plank", price: { amount: 24.50, currency: 'USD' }, imageUrl: "https://picsum.photos/seed/wood/200/200", purchaseUrl: "#", retailer: "Lowe's", sourceType: 'affiliate' }
    ],
    complementaryProducts: [],
    insights: {
        difficulty: 'Medium',
        timeEstimate: "2-3 Hours",
        costEstimate: { low: 50, high: 150, currency: 'USD' },
        safetyRating: 4.5,
        safetyProtocols: [
            { hazard: "Dust", prevention: "Wear a mask", requiredGear: ["N95 Mask"] },
            { hazard: "Sharp Edges", prevention: "Use gloves", requiredGear: ["Safety Gloves"] }
        ],
        toolsRequired: ["Drill", "Saw", "Level"],
        materialsRequired: ["Oak Wood", "Wall Anchors", "Stain"]
    },
    activeBuilders: 12,
    rating: 4.8,
    ratingCount: 156
};

const App: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isAnalyzeModalOpen, setAnalyzeModalOpen] = useState(false);
  const [analyzeModalInitialTab, setAnalyzeModalInitialTab] = useState<UploadType>(UploadType.YOUTUBE);
  const [isTipModalOpen, setTipModalOpen] = useState(false);
  const [isManageSubscriptionModalOpen, setManageSubscriptionModalOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState<{video: Video, isCreator: boolean} | null>(null);
  const [isDebugPanelOpen, setDebugPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isInitialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'All'>('All');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [view, setView] = useState<'home' | 'videoPlayer' | 'profile' | 'admin' | 'about' | 'terms' | 'privacy' | 'disclosure' | 'contact'>('home');
  const [profileInitialTab, setProfileInitialTab] = useState<any>('overview');
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [shoppingCart, setShoppingCart] = useState<CartItem[]>([]);
  const [isCartPanelOpen, setCartPanelOpen] = useState(false);
  const [xpNotification, setXpNotification] = useState<{ amount: number; label: string } | null>(null);
  const [sdkCheckoutId, setSdkCheckoutId] = useState<string | null>(null);
  const [affiliateSyncUrl, setAffiliateSyncUrl] = useState<string | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState<{ type: UploadType, val: File[] | string, cat: ProjectCategory } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const loadingIntervalRef = useRef<number | null>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
            setIsCategoryMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigateHome = () => {
    setView('home');
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedVideo(null);
    setProfileInitialTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    handleNavigateHome();
  };

  const hasInteraction = useMemo(() => {
    return searchQuery.trim().length > 0 || selectedCategory !== 'All';
  }, [searchQuery, selectedCategory]);

  const filteredVideos = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return videos.filter(v => {
        const matchesStatus = v.status === 'published';
        const matchesQuery = !query || 
            v.title.toLowerCase().includes(query) || 
            v.creator.toLowerCase().includes(query) || 
            v.category.toLowerCase().includes(query);
        const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory;
        
        // Only show internal videos in the main feed unless searching
        const isInternal = v.sourceType !== 'external';
        const shouldShow = isInternal || (query.length > 0);
        
        return matchesStatus && matchesQuery && matchesCategory && shouldShow;
    });
  }, [videos, searchQuery, selectedCategory]);

  const trackEvent = (eventName: string, properties: Record<string, any> = {}) => { 
    if (eventName === 'product_link_click' || eventName === 'ebay_link_click') {
        dbService.logEvent('product_click', { 
            retailer: properties.retailer || (eventName === 'ebay_link_click' ? 'eBay' : 'Other'),
            ts: new Date().toISOString()
        });
    } else if (eventName.includes('checkout')) {
        dbService.logEvent('checkout_start', { ts: new Date().toISOString() });
    } else {
        dbService.logEvent(eventName, properties);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Log page view
  useEffect(() => {
    dbService.logEvent('page_view', { 
        path: window.location.pathname,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
    });
  }, []);

  const startRotatingLoadingMessages = (initialMsg: string) => {
    setLoadingMessage(initialMsg);
    let index = 0;
    loadingIntervalRef.current = window.setInterval(() => { setLoadingMessage(LOADING_MESSAGES[index % LOADING_MESSAGES.length]); index++; }, 3000);
  };
  const stopRotatingLoadingMessages = () => { if (loadingIntervalRef.current) { clearInterval(loadingIntervalRef.current); loadingIntervalRef.current = null; } };

  const addXP = async (amount: number, label: string = "Maker Reward") => {
      if (!currentUser) return;
      const newXP = currentUser.makerXP + amount;
      
      let newRank: MakerRank = currentUser.makerRank;
      if (newXP >= 5000) newRank = 'Grand Architect';
      else if (newXP >= 3000) newRank = 'Master Maker';
      else if (newXP >= 1500) newRank = 'Senior Builder';
      else if (newXP >= 500) newRank = 'Studio Lead';

      const updatedUser: User = { ...currentUser, makerXP: newXP, makerRank: newRank };
      setCurrentUser(updatedUser); await dbService.upsertUser(updatedUser); 
      if (currentUser.gamificationEnabled) {
          setXpNotification({ amount, label }); 
          setTimeout(() => setXpNotification(null), 4000);
      }
  };

  useEffect(() => {
    const initData = async () => {
        const cloudVideos = await dbService.getAllVideos();
        setVideos(cloudVideos); 
        setInitialLoading(false);
    };
    initData();
  }, []);

  const handleVideoSelect = async (video: Video) => {
      const creator = await dbService.getUser(video.creatorId);
      const videoWithTip = { ...video, creatorTipQrUrl: creator?.tipQrUrl, creatorVenmoHandle: creator?.venmoHandle };
      setSelectedVideo(videoWithTip); setView('videoPlayer');
      await dbService.incrementVideoStat(video.id, 'views');
      trackEvent('video_view', { videoId: video.id });
  };

  const handleSampleClick = () => {
      const sample = videos.find(v => v.id === 1) || SAMPLE_VIDEO;
      setSelectedVideo(sample);
      setView('videoPlayer');
      trackEvent('sample_view', { videoId: sample.id });
  };

  const handleAnalysisLogic = async (type: UploadType, val: File[] | string, cat: ProjectCategory, userOverride?: User | null) => {
    console.log("handleAnalysisLogic triggered:", { type, cat, hasUserOverride: !!userOverride, hasCurrentUser: !!currentUser });
    
    // Only return early if loading AND this isn't an internal retry (userOverride)
    if (isLoading && !userOverride) {
        console.log("Analysis already in progress, skipping.");
        return;
    }
    
    const effectiveUser = userOverride !== undefined ? userOverride : currentUser;
    
    // Guest mode enabled: Proceed even if no user is found to reduce friction
    console.log("Starting analysis process...");
    setPendingAnalysis(null); 
    setIsLoading(true); 
    setAnalyzeModalOpen(false); // Close modal immediately to show main app loading state
    startRotatingLoadingMessages("Vision Intel Active...");
    try { 
        // 1. Check for existing video by URL if applicable
        if (type === UploadType.YOUTUBE || type === UploadType.URL) {
            const urlStr = val as string;
            let normalizedUrl = urlStr;
            try {
                const urlObj = new URL(urlStr);
                if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
                    const v = urlObj.searchParams.get('v');
                    if (v) {
                        normalizedUrl = `https://www.youtube.com/watch?v=${v}`;
                    } else if (urlObj.hostname.includes('youtu.be')) {
                        const id = urlObj.pathname.slice(1);
                        normalizedUrl = `https://www.youtube.com/watch?v=${id}`;
                    }
                } else {
                    normalizedUrl = urlObj.origin + urlObj.pathname;
                }
            } catch (e) {
                normalizedUrl = urlStr.split('?')[0];
            }
            
            const existing = videos.find(v => v.videoUrl && (v.videoUrl === normalizedUrl || v.videoUrl.includes(normalizedUrl)));
            
            if (existing) {
                setSelectedVideo(existing);
                setView('videoPlayer');
                setIsLoading(false);
                stopRotatingLoadingMessages();
                return;
            }
        }

        let p: Product[] = []; 
        console.log("Analyzing with type:", type, "and value:", val);
        
        if(type === UploadType.YOUTUBE || type === UploadType.URL) {
            p = await generateProductsFromUrl(val as string, cat); 
        } else { 
            // Ensure val is an array for IMAGE/CAMERA/FILE
            const fileList = Array.isArray(val) ? val : (val ? [val] : []);
            console.log("Processing file list:", fileList);
            
            if (fileList.length === 0) {
                console.warn("No files provided for analysis.");
                showToast("No images provided for analysis.", "error");
                setIsLoading(false);
                stopRotatingLoadingMessages();
                return;
            }

            const b64 = await Promise.all((fileList as any[]).map(f => {
                if (!(f instanceof File) && !(f instanceof Blob)) {
                    console.error("Item in file list is not a File/Blob:", f);
                    throw new Error("INVALID_FILE_TYPE");
                }
                return blobToBase64(f);
            })); 
            
            const firstFile = fileList[0] as any;
            p = await generateProductsFromImages(b64, firstFile.type || 'image/jpeg', cat); 
        } 
        console.log("AI Response for products:", p);
        if (p.length === 0) {
            console.warn("No products identified by AI.");
            showToast("AI could not identify specific products. Try a different video or image.", "error");
            setIsLoading(false);
            stopRotatingLoadingMessages();
            return;
        }

        setLoadingMessage("Calculating Project Insights...");
        console.log("Generating insights for products:", p);
        const insights = await generateV3ProjectInsights("AI Scan Result", p, cat); 
        console.log("AI Insights generated:", insights);
        const newVideo: Video = { 
            id: Date.now(), 
            creator: effectiveUser?.displayName || "Guest Maker", 
            creatorId: effectiveUser?.email || "guest@watch1do1.com", 
            status: 'published', 
            sourceType: 'external',
            category: cat, 
            title: type === UploadType.YOUTUBE ? "AI Media Analysis" : "AI Vision Build", 
            videoUrl: type === UploadType.YOUTUBE || type === UploadType.URL ? val as string : '', 
            thumbnailUrl: p[0]?.imageUrl || 'https://picsum.photos/seed/ai/600/400', 
            products: p, 
            complementaryProducts: [], 
            insights, 
            activeBuilders: 0, 
            rating: 0, 
            ratingCount: 0 
        };

        // Cache the result in the database
        await dbService.insertVideo(newVideo);
        setVideos(prev => [newVideo, ...prev]);

        // Track in user profile
        if (effectiveUser) {
            const updatedUser = { ...effectiveUser, scannedVideoIds: [...(effectiveUser.scannedVideoIds || []), newVideo.id] };
            setCurrentUser(updatedUser);
            await dbService.upsertUser(updatedUser);
        }

        setSelectedVideo(newVideo); 
        setView('videoPlayer'); 
        addXP(50, "Vision Usage");
        trackEvent('ai_vision_success', { type, category: cat, isGuest: !effectiveUser });
    } catch (e: any) { 
        console.error("Analysis failed:", e);
        const msg = e?.message?.includes("AI_TIMEOUT") ? "Analysis timed out. Please try again." : "Analysis failed. Please check your input and try again.";
        showToast(msg, "error");
        trackEvent('ai_vision_error', { type, error: String(e), isGuest: !effectiveUser });
    } finally { 
        setIsLoading(false); 
        stopRotatingLoadingMessages(); 
    }
  };

  const handleCreatorUpload = async (file: File, title: string, category: ProjectCategory, suggestedCategory?: string, description?: string, manualProducts: Product[] = []) => {
    if (!currentUser) return;
    setIsLoading(true); startRotatingLoadingMessages('Initializing Build Hub...');
    try {
        const thumbnailUrl = await generateVideoThumbnail(file);
        const aiProducts = await generateProductsFromText(title, category);
        const products = [...manualProducts, ...aiProducts];
        const insights = await generateV3ProjectInsights(title, products, category);
        const complementaryProducts = await generateComplementaryProducts(title, products, category);
        const newVideo: Video = {
            id: Date.now(), creator: currentUser.displayName, creatorId: currentUser.email.toLowerCase(),
            status: 'curating', category, suggestedCategory, title, videoUrl: URL.createObjectURL(file), thumbnailUrl,
            products, complementaryProducts, insights, activeBuilders: 1, rating: 0, ratingCount: 0,
            stats: { views: 0, clicks: 0, sales: 0, tips: 0, addToKitCount: 0 }
        };
        setVideos(prev => [newVideo, ...prev]); 
        await dbService.insertVideo(newVideo);
        setIsLoading(false); setUploadModalOpen(false); setSelectedVideo(newVideo); setView('videoPlayer');
    } catch (error: any) { alert("Logic extraction failed."); } finally { setIsLoading(false); stopRotatingLoadingMessages(); }
  };

  const handleAuthSubmit = async (email: string) => {
    setIsLoading(true); 
    try {
        await dbService.addToWaitlist(email);
        
        // Check if user exists, otherwise create a basic profile for the demo
        let user = await dbService.getUser(email);
        if (!user) {
            user = {
                email,
                displayName: email.split('@')[0],
                avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
                subscriptionStatus: 'Standard',
                bio: 'New Maker',
                favoritedVideoIds: [],
                scannedVideoIds: [],
                purchaseHistory: [],
                completedProjects: [],
                isAdmin: false,
                isVerifiedPartner: false,
                makerXP: 0,
                makerRank: 'Studio Lead',
                pendingBalance: 0,
                totalTipsReported: 0,
                isOver18: true,
                stripeConnected: false,
                gamificationEnabled: true
            };
            await dbService.upsertUser(user);
        }
        
        setCurrentUser(user);
        setAuthModalMode(null);
        setAnalyzeModalOpen(false); // Ensure analyze modal is closed
        
        // If there was a pending analysis, trigger it now with the new user
        if (pendingAnalysis) {
            console.log("Triggering pending analysis after auth:", pendingAnalysis);
            // Await the analysis so the loading state from handleAnalysisLogic isn't immediately overwritten
            await handleAnalysisLogic(pendingAnalysis.type, pendingAnalysis.val, pendingAnalysis.cat, user);
        } else {
            console.log("No pending analysis found after auth.");
        }
        
        setIsLoading(false);
    } catch (e) {
        console.error("Auth error:", e);
        setIsLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    setShoppingCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    trackEvent('add_to_cart', { productName: String(product.id) });
  };

  const handleRateVideo = async (videoId: number, rating: number) => {
    if (!currentUser) return;
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, rating: ((v.rating || 0) * (v.ratingCount || 0) + rating) / ((v.ratingCount || 0) + 1), ratingCount: (v.ratingCount || 0) + 1 } : v));
    if (selectedVideo?.id === videoId) {
        setSelectedVideo(prev => prev ? { ...prev, rating: ((prev.rating || 0) * (prev.ratingCount || 0) + rating) / ((prev.ratingCount || 0) + 1), ratingCount: (prev.ratingCount || 0) + 1 } : null);
    }
    addXP(25, "Feedback Signal");
    await dbService.incrementVideoStat(videoId, 'ratingCount');
  };

  const handleCheckout = async (cart: CartItem[]) => {
    const directItems = cart.filter(i => i.sourceType === 'direct');
    const affiliateItems = cart.filter(i => i.sourceType !== 'direct');
    
    if (directItems.length > 0) {
        setIsLoading(true); startRotatingLoadingMessages("Initializing Native SDK Protocol...");
        try {
            const { cartId } = await bigCommerceService.createCart(directItems);
            setSdkCheckoutId(cartId);
        } catch (e) { alert("Native Handshake Failed."); } finally { setIsLoading(false); stopRotatingLoadingMessages(); }
    } else if (affiliateItems.length > 0) {
        setIsLoading(true); startRotatingLoadingMessages("Syncing Partner Payload...");
        setTimeout(() => {
            const campId = selectedVideo?.epnCampId || '5339014523';
            const firstItemName = affiliateItems[0].name;
            const handoffUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(firstItemName)}&mkrid=711-53200-19255-0&siteid=0&campid=${campId}&toolid=10001&customid=w1d1_hub_sync`;
            
            setAffiliateSyncUrl(handoffUrl);
            setIsLoading(false);
            stopRotatingLoadingMessages();
            trackEvent('affiliate_handoff_initialized', { itemCount: affiliateItems.length });
        }, 1200);
    }
  };

  const handleSubscriptionProcess = async (tier: string) => {
      if (!currentUser) return;
      setIsLoading(true);
      startRotatingLoadingMessages("Opening Stripe Billing Gateway...");
      try {
          const { url } = await stripeService.createSubscriptionSession(currentUser.email, "Premium", tier);
          if (url) window.location.href = url;
      } catch (e) { alert("Billing gateway unreachable."); } finally { setIsLoading(false); stopRotatingLoadingMessages(); }
  };

  const handleTriggerShare = (video: Video, isCreator: boolean) => {
      setShareData({ video, isCreator });
      setShareModalOpen(true);
  };

  const renderContent = () => {
    if (view === 'about') return <AboutUs onBack={handleNavigateHome} />;
    if (view === 'terms') return <TermsOfService onBack={handleNavigateHome} />;
    if (view === 'privacy') return <PrivacyPolicy onBack={handleNavigateHome} />;
    if (view === 'disclosure') return <AffiliateDisclosure onBack={handleNavigateHome} />;
    if (view === 'contact') return <ContactUs onBack={handleNavigateHome} />;
    if (view === 'admin' && currentUser) return <AdminDashboard videos={videos} currentUser={currentUser} onApprove={(id, prod, comp, epn, ins, title) => { 
        dbService.updateVideoStatus(id, 'published', prod, comp, ins, title); 
        setVideos(prev => prev.map(v => Number(v.id) === Number(id) ? ({ ...v, status: 'published' as VideoStatus, products: prod, complementaryProducts: comp, epnCampId: epn, insights: ins || v.insights, title: title || v.title }) : v)); 
    }} onReject={(id) => { 
        dbService.updateVideoStatus(id, 'rejected'); 
        setVideos(prev => prev.map(v => Number(v.id) === Number(id) ? ({ ...v, status: 'rejected' as VideoStatus }) : v)); 
    }} onDelete={(id) => { 
        setVideos(prev => prev.filter(v => Number(v.id) !== Number(id))); 
    }} onBack={handleNavigateHome} onUploadClick={() => setUploadModalOpen(true)} />;
    if (view === 'videoPlayer' && selectedVideo) return (
        <VideoPlayerView 
            video={selectedVideo} 
            onBack={handleNavigateHome} 
            onTipClick={() => setTipModalOpen(true)} 
            onAddToCart={handleAddToCart} 
            onShare={() => handleTriggerShare(selectedVideo, selectedVideo.creatorId === currentUser?.email)} 
            currentUser={currentUser} 
        />
    );
    if (view === 'profile' && currentUser) return <ProfilePage user={currentUser} userVideos={videos.filter(v => v.creatorId.toLowerCase() === currentUser.email.toLowerCase())} scannedVideos={videos.filter(v => currentUser.scannedVideoIds?.includes(v.id))} allVideos={videos} onAvatarChange={(file: File) => { const newAvatar = URL.createObjectURL(file); setCurrentUser({...currentUser, avatarUrl: newAvatar}); }} onVideoClick={handleVideoSelect} onProfileUpdate={async (info: any) => { const updated = {...currentUser, ...info}; setCurrentUser(updated); await dbService.upsertUser(updated); }} onManageSubscription={() => setManageSubscriptionModalOpen(true)} onBack={handleNavigateHome} onShare={handleTriggerShare} defaultTab={profileInitialTab} />;
    if (isInitialLoading) return <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400"><img src={APP_LOGO_PATH} alt="Logo" className="w-12 h-12 object-contain mb-4 animate-pulse" referrerPolicy="no-referrer" /><p className="font-black uppercase text-[10px] tracking-widest">Entering Maker Studio...</p></div>;

    if (view === 'home' && !hasInteraction) {
        return <LandingPage onAnalyzeClick={() => setAnalyzeModalOpen(true)} onSampleClick={handleSampleClick} onNavigate={setView} />;
    }

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in min-h-[80vh]">
            <div className={`flex flex-col items-center justify-center transition-all duration-700 ${hasInteraction ? 'pt-8 mb-16' : 'h-[70vh]'}`}>
                <div className="w-full max-w-4xl text-center">
                    <div className="flex flex-col justify-center items-center gap-6 mb-12 transform animate-scale-in">
                        <div className="h-48 w-auto relative flex items-center justify-center transition-transform hover:scale-110 cursor-default">
                           <img src={APP_LOGO_PATH} alt="L" className="h-full w-auto object-contain relative z-10" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                           <div className="logo-fallback hidden absolute inset-0 flex items-center justify-center"><img src={APP_LOGO_PATH} alt="Logo" className="h-28 w-28 object-contain opacity-20" referrerPolicy="no-referrer" /></div>
                        </div>
                        <h1 className="text-6xl font-black text-white tracking-tighter">{APP_NAME}</h1>
                    </div>
                    
                    <form onSubmit={(e) => e.preventDefault()} className="relative group max-w-2xl mx-auto mb-6">
                        <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="What do you want to do today?" className="w-full py-6 pl-6 pr-16 sm:pl-10 sm:pr-24 text-sm sm:text-xl bg-slate-800 border-2 border-slate-700 rounded-[3.5rem] focus:ring-[15px] focus:ring-[#7D8FED]/5 focus:border-[#7D8FED] outline-none shadow-2xl transition-all placeholder:text-slate-400" />
                        <button type="submit" className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 p-3 sm:p-4 bg-[#7D8FED] rounded-full hover:bg-[#6b7ae6] shadow-xl"><SearchIcon className="h-5 w-5 sm:h-7 sm:w-7 text-white"/></button>
                    </form>

                    <div className="relative max-w-sm mx-auto" ref={categoryDropdownRef}>
                        <button 
                            onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                            className="w-full flex items-center justify-between px-8 py-4 bg-slate-800/40 border border-slate-700 rounded-full hover:bg-slate-800 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <CategoryIcon category={selectedCategory === 'All' ? 'Other' : selectedCategory} className="w-5 h-5 text-[#7D8FED]" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">
                                    {selectedCategory === 'All' ? 'Select Project Hub' : `${selectedCategory} Hub`}
                                </span>
                            </div>
                            <ChevronDownIcon className={`w-4 h-4 text-slate-500 transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isCategoryMenuOpen && (
                            <div className="absolute top-full mt-4 w-full bg-slate-800 border border-slate-700 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-[90] overflow-hidden animate-scale-in origin-top">
                                <div className="p-4 grid grid-cols-1 gap-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                    <button 
                                        onClick={() => { setSelectedCategory('All'); setIsCategoryMenuOpen(false); }}
                                        className={`w-full text-left px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === 'All' ? 'bg-[#7D8FED] text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                                    >
                                        All Project Hubs
                                    </button>
                                    {CATEGORIES.map(cat => (
                                        <button 
                                            key={cat}
                                            onClick={() => { setSelectedCategory(cat); setIsCategoryMenuOpen(false); }}
                                            className={`w-full text-left px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${selectedCategory === cat ? 'bg-[#7D8FED] text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                                        >
                                            <CategoryIcon category={cat} className="w-4 h-4 opacity-70" />
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {hasInteraction && (
                <div className="animate-fade-in pb-20">
                    <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-800">
                        <h2 className="text-4xl font-black text-white tracking-tighter">
                            {selectedCategory === 'All' ? (searchQuery ? `Results for "${searchQuery}"` : 'Global Hubs') : `${selectedCategory} Hub`}
                        </h2>
                        <div className="flex items-center gap-3">
                            <button onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} className="text-[9px] font-black uppercase text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-1 bg-rose-500/5 px-3 py-1.5 rounded-full border border-rose-500/20">
                                <CloseIcon className="w-3 h-3" /> Reset Filter
                            </button>
                        </div>
                    </div>
                    
                    {filteredVideos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                            {filteredVideos.map(v => <VideoCard key={v.id} video={v} onSelect={handleVideoSelect} currentUser={currentUser} />)}
                        </div>
                    ) : (
                        <NoResultsAnalysis 
                            searchQuery={searchQuery || selectedCategory} 
                            onAnalyzeURL={() => setAnalyzeModalOpen(true)} 
                            onAnalyzeImage={() => setAnalyzeModalOpen(true)} 
                            onDirectAnalyze={(url: string) => handleAnalysisLogic(UploadType.YOUTUBE, url, selectedCategory === 'All' ? 'Other' : selectedCategory)}
                            isLoading={isLoading}
                        />
                    )}
                </div>
            )}
        </div>
    );
  };

  return (
    <div className={`flex flex-col min-h-screen bg-[#0f172a] ${isCartPanelOpen || isDebugPanelOpen ? 'overflow-hidden' : ''}`}>
        <div className="no-print">
            <Header 
                onSignupClick={() => setAuthModalMode('signup')} 
                onLoginClick={() => setAuthModalMode('login')}
                onLogoutClick={handleLogout}
                onHomeClick={handleNavigateHome} 
                onCartClick={() => setCartPanelOpen(true)} 
                cartItemCount={shoppingCart.length} 
                onAnalyzeClick={() => setAnalyzeModalOpen(true)}
                onUploadClick={() => setUploadModalOpen(true)}
                onProfileClick={(tab) => { setView('profile'); if(tab) setProfileInitialTab(tab); }}
                currentUser={currentUser}
                onAdminClick={() => setView('admin')}
                onDebugClick={() => setDebugPanelOpen(true)}
                onKeyClick={() => {}}
            />
        </div>
        <main className="flex-grow pt-20">{renderContent()}</main>
        <div className="no-print">
            <Footer onNavigate={(v) => { setView(v); window.scrollTo(0, 0); }} />
        </div>

        {/* Mobile Floating Action Buttons */}
        <div className="sm:hidden fixed bottom-24 right-6 z-[150] flex flex-col gap-4 no-print">
            <button 
                onClick={() => setAnalyzeModalOpen(true)}
                title="AI Vision"
                className="w-14 h-14 bg-slate-800 border border-[#7D8FED]/30 text-[#7D8FED] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            >
                <CameraIcon className="w-6 h-6" />
            </button>
            <button 
                onClick={() => setAuthModalMode('signup')}
                title="Join Waitlist"
                className="w-16 h-16 bg-[#7D8FED] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all animate-pulse-subtle"
            >
                <SparkleIcon className="w-8 h-8" />
            </button>
        </div>

        {isUploadModalOpen && <UploadModal currentUser={currentUser} onClose={() => setUploadModalOpen(false)} onUpload={handleCreatorUpload} isLoading={isLoading} loadingMessage={loadingMessage} />}
        {isAnalyzeModalOpen && (
            <AnalyzeModal 
                currentUser={currentUser} 
                onClose={() => { setAnalyzeModalOpen(false); setPendingAnalysis(null); }} 
                onAnalyze={handleAnalysisLogic} 
                onAuthPrompt={(mode: any) => setAuthModalMode(mode)} 
                isLoading={isLoading} 
                loadingMessage={loadingMessage} 
                initialTab={analyzeModalInitialTab} 
                initialUrl={pendingAnalysis?.type === UploadType.YOUTUBE || pendingAnalysis?.type === UploadType.URL ? pendingAnalysis.val as string : ''}
                initialCategory={pendingAnalysis?.cat}
            />
        )}
        {isTipModalOpen && selectedVideo && <DirectTipModal creatorName={selectedVideo.creator} qrUrl={selectedVideo.creatorTipQrUrl} venmoHandle={selectedVideo.creatorVenmoHandle} currentUser={currentUser} onClose={() => setTipModalOpen(false)} onSignalTip={(amt: number) => { dbService.upsertUser({...currentUser!, totalTipsReported: (currentUser?.totalTipsReported || 0) + amt}); if(currentUser) addXP(50 + (amt * 2), "Maker Support"); }} onShare={() => handleTriggerShare(selectedVideo, false)} onSignupClick={() => setAuthModalMode('signup')} />}
        {authModalMode && <AuthModal onClose={() => setAuthModalMode(null)} onSubmit={handleAuthSubmit} />}
        <ShoppingCartPanel isOpen={isCartPanelOpen} onClose={() => setCartPanelOpen(false)} cartItems={shoppingCart} onUpdateQuantity={(id: any, qty: number) => setShoppingCart(prev => prev.map(i => i.id === id ? {...i, quantity: Math.max(1, qty)} : i))} onRemoveItem={(id: any) => setShoppingCart(prev => prev.filter(i => i.id !== id))} onCheckout={handleCheckout} onEmailKit={() => setIsEmailModalOpen(true)} selectedVideo={selectedVideo} />
        <DebugTrackingPanel isOpen={isDebugPanelOpen} onClose={() => setDebugPanelOpen(false)} />
        {isManageSubscriptionModalOpen && currentUser && <ManageSubscriptionModal onClose={() => setManageSubscriptionModalOpen(false)} currentStatus={currentUser.subscriptionStatus} onSubscriptionChange={(ns, t) => { if(ns === 'Premium') handleSubscriptionProcess(t || 'annual'); else { setCurrentUser({...currentUser, subscriptionStatus: 'Standard'}); setManageSubscriptionModalOpen(false); } }} />}
        {isShareModalOpen && shareData && <ShareModal video={shareData.video} isCreatorView={shareData.isCreator} onClose={() => setShareModalOpen(false)} />}
        
        {/* Global Loading Overlay */}
        {isLoading && !isAnalyzeModalOpen && !isUploadModalOpen && (
            <div className="fixed inset-0 z-[300] bg-slate-950/60 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in no-print">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-[#7D8FED]/20 border-t-[#7D8FED] rounded-full animate-spin" />
                    <img src={APP_LOGO_PATH} alt="Logo" className="absolute inset-0 m-auto w-10 h-10 object-contain animate-pulse" referrerPolicy="no-referrer" />
                </div>
                <div className="mt-8 text-center">
                    <p className="text-white font-black uppercase tracking-[0.3em] text-sm mb-2">{loadingMessage || "Vision Intel Active..."}</p>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">Extracting Visual Logic Patterns</p>
                </div>
            </div>
        )}
        
        {sdkCheckoutId && <div className="no-print"><CheckoutExperience cartId={sdkCheckoutId} items={shoppingCart.filter(i => i.sourceType === 'direct')} currentUser={currentUser} onClose={() => setSdkCheckoutId(null)} onSuccess={() => { addXP(250, "Verified Acquisition"); setShoppingCart(prev => prev.filter(i => i.sourceType !== 'direct')); setSdkCheckoutId(null); }} /></div>}
        {affiliateSyncUrl && <div className="no-print"><AffiliateCheckoutModal url={affiliateSyncUrl} itemCount={shoppingCart.filter(i => i.sourceType !== 'direct').length} onClose={() => setAffiliateSyncUrl(null)} /></div>}
        {isEmailModalOpen && <div className="no-print"><EmailKitModal items={shoppingCart} projectTitle={selectedVideo?.title || "Watch1Do1 Project"} onClose={() => setIsEmailModalOpen(false)} onSend={async (email: string) => { await emailService.sendEmailKit(email, selectedVideo?.title || "Kit", shoppingCart); }} /></div>}

        {xpNotification && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-slate-800 border border-[#7D8FED]/40 px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-6 animate-scale-in no-print">
                <div className="w-12 h-12 bg-[#7D8FED]/20 rounded-xl flex items-center justify-center border border-[#7D8FED]/30"><SparkleIcon className="w-6 h-6 text-[#7D8FED]" /></div>
                <div><p className="text-[10px] font-black text-[#7D8FED] uppercase tracking-widest">{xpNotification.label}</p><p className="text-xl font-black text-white">+{xpNotification.amount} XP SECURED</p></div>
            </div>
        )}

        {toast && (
            <div className={`fixed bottom-10 right-10 z-[250] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-up no-print ${
                toast.type === 'error' ? 'bg-red-900/90 border border-red-500/50 text-red-100' : 'bg-emerald-900/90 border border-emerald-500/50 text-emerald-100'
            }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    toast.type === 'error' ? 'bg-red-500/20' : 'bg-emerald-500/20'
                }`}>
                    {toast.type === 'error' ? <CloseIcon className="w-4 h-4" /> : <SparkleIcon className="w-4 h-4" />}
                </div>
                <p className="text-xs font-bold uppercase tracking-wider">{toast.message}</p>
                <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
                    <CloseIcon className="w-4 h-4" />
                </button>
            </div>
        )}
    </div>
  );
};
export default App;
