import React from 'react';
import { LucideIcon, Sparkles, Search, LayoutGrid, ChevronDown, RefreshCw, Medal, Camera, DollarSign, ExternalLink, CheckCircle2, X, Share2, Shield, XCircle, Plus, Scan, Youtube, Image, Link, Play, Lightbulb, Printer } from 'lucide-react';

export const SparkleIcon = Sparkles;
export const SearchIcon = Search;
export const ShieldIcon = Shield;
export const ChevronDownIcon = ChevronDown;
export const RefreshCwIcon = RefreshCw;
export const MedalIcon = Medal;
export const CameraIcon = Camera;
export const DollarSignIcon = DollarSign;
export const ExternalLinkIcon = ExternalLink;
export const CheckCircleIcon = CheckCircle2;
export const CloseIcon = X;
export const ShareIcon = Share2;
export const XCircleIcon = XCircle;
export const PlusIcon = Plus;
export const ScanFrameIcon = Scan;
export const YouTubeIcon = Youtube;
export const PhotoIcon = Image;
export const LinkIcon = Link;
export const PlayIcon = Play;
export const LightBulbIcon = Lightbulb;
export const PrinterIcon = Printer;

export const CategoryIcon: React.FC<{ category: string; className?: string }> = ({ category, className }) => {
    return <LayoutGrid className={className} />;
};
