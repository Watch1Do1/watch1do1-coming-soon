
export type ProjectCategory = 
  | 'Home Improvement' | 'DIY Crafts' | 'Cooking & Kitchen' | 'Gardening' 
  | 'Tech & Gadgets' | 'Fitness & Sports' | 'Automotive' | 'Fashion & Beauty' 
  | 'Kids & Toys' | 'Survival & Outdoors' | 'Music' | 'Pets & Animal Care' 
  | 'Art & Photography' | 'Hobbies' | 'Other';

export type UploadType = 'YOUTUBE' | 'URL' | 'FILE' | 'CAMERA' | 'IMAGE';
export const UploadType = {
    YOUTUBE: 'YOUTUBE' as const,
    URL: 'URL' as const,
    FILE: 'FILE' as const,
    CAMERA: 'CAMERA' as const,
    IMAGE: 'IMAGE' as const
};

export type SubscriptionStatus = 'Standard' | 'Premium';
export type MakerRank = 'Apprentice' | 'Studio Lead' | 'Senior Builder' | 'Master Maker' | 'Grand Architect';
export type VideoStatus = 'curating' | 'pending_review' | 'published' | 'rejected';

export interface Money {
    amount: number;
    currency: string;
}

export interface Product {
    id: string | number;
    name: string;
    price: Money;
    imageUrl: string;
    purchaseUrl: string;
    retailer: string;
    sourceType: 'direct' | 'affiliate';
    brand?: string;
    confidence?: number;
    matchType?: 'exact' | 'similar' | 'alternative';
}

export interface CartItem extends Product {
    quantity: number;
}

export interface SafetyProtocol {
    hazard: string;
    prevention: string;
    requiredGear: string[];
}

export interface CostEstimate {
    low: number;
    high: number;
    currency: string;
    breakdown?: { category: string; amount: number }[];
}

export interface ProjectInsights {
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
    timeEstimate: string;
    costEstimate: CostEstimate;
    safetyRating: number;
    safetyProtocols: SafetyProtocol[];
    toolsRequired: string[];
    materialsRequired: string[];
    technicalPrerequisites?: string[];
    environmentalRequirements?: string[];
}

export interface Video {
    id: number;
    title: string;
    creator: string;
    creatorId: string;
    status: VideoStatus;
    category: ProjectCategory;
    suggestedCategory?: string;
    videoUrl: string;
    thumbnailUrl: string;
    products: Product[];
    complementaryProducts: Product[];
    insights: ProjectInsights;
    activeBuilders: number;
    rating: number;
    ratingCount: number;
    description?: string;
    isAiGenerated?: boolean;
    creatorAvatarUrl?: string;
    sourceType?: 'internal' | 'external';
    epnCampId?: string;
    creatorTipQrUrl?: string;
    creatorVenmoHandle?: string;
    stats?: {
        views: number;
        clicks: number;
        sales: number;
        tips: number;
        addToKitCount: number;
    };
}

export interface User {
    email: string;
    displayName: string;
    avatarUrl?: string;
    subscriptionStatus: SubscriptionStatus;
    bio: string;
    favoritedVideoIds: number[];
    scannedVideoIds?: number[];
    purchaseHistory: any[];
    completedProjects: any[];
    isAdmin: boolean;
    isVerifiedPartner: boolean;
    makerXP: number;
    makerRank: MakerRank;
    pendingBalance: number;
    totalTipsReported: number;
    isOver18: boolean;
    stripeConnected: boolean;
    gamificationEnabled: boolean;
    tipQrUrl?: string;
    venmoHandle?: string;
}
