import React, { useState, useRef, useEffect } from 'react';
import { UploadType, ProjectCategory, User } from '../types';
import { APP_LOGO_PATH } from '../constants';
import { SparkleIcon, XCircleIcon, PlusIcon, CameraIcon, ScanFrameIcon, YouTubeIcon, PhotoIcon, LinkIcon, PlayIcon, LightBulbIcon, ChevronDownIcon, CheckCircleIcon, RefreshCwIcon, ShieldIcon } from './IconComponents';

interface AnalyzeModalProps {
  onClose: () => void;
  onAnalyze: (type: UploadType, value: File[] | string, category: ProjectCategory) => void;
  onAuthPrompt: (mode: 'login' | 'signup') => void;
  isLoading: boolean;
  loadingMessage: string;
  initialTab: UploadType;
  initialUrl?: string;
  initialCategory?: ProjectCategory;
  currentUser: User | null;
}

const CATEGORIES: ProjectCategory[] = [
  'Home Improvement', 'DIY Crafts', 'Cooking & Kitchen', 'Gardening', 
  'Tech & Gadgets', 'Fitness & Sports', 'Automotive', 'Fashion & Beauty', 'Other'
];

const AnalyzeModal: React.FC<AnalyzeModalProps> = ({ 
  onClose, onAnalyze, onAuthPrompt, isLoading, loadingMessage, 
  initialTab, initialUrl = '', initialCategory = 'Other', currentUser 
}) => {
  const [activeTab, setActiveTab] = useState<UploadType>(initialTab);
  const [url, setUrl] = useState(initialUrl);
  const [category, setCategory] = useState<ProjectCategory>(initialCategory);
  const [files, setFiles] = useState<File[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasAffirmed, setHasAffirmed] = useState(false);
  const [showBriefing, setShowBriefing] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'CAMERA' && isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab, isCameraActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
            setFiles([file]);
            setIsCameraActive(false);
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = () => {
    if (!hasAffirmed) return;
    
    if (activeTab === 'YOUTUBE' || activeTab === 'URL') {
      if (!url) return;
      onAnalyze(activeTab, url, category);
    } else {
      if (files.length === 0) return;
      onAnalyze(activeTab, files, category);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7D8FED]/10 rounded-xl flex items-center justify-center overflow-hidden">
              <img src={APP_LOGO_PATH} alt="Logo" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">AI Project Analyzer</h2>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Vision-Powered Insights</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/30">
          {[
            { id: 'YOUTUBE', label: 'YouTube', icon: YouTubeIcon },
            { id: 'IMAGE', label: 'Images', icon: PhotoIcon },
            { id: 'CAMERA', label: 'Camera', icon: CameraIcon },
            { id: 'URL', label: 'Web URL', icon: LinkIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as UploadType)}
              className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all relative ${
                activeTab === tab.id ? 'text-[#7D8FED]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7D8FED]" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {showBriefing && (
            <div className="bg-[#7D8FED]/5 border border-[#7D8FED]/20 rounded-2xl p-4 relative overflow-hidden group">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-[#7D8FED]/20 rounded-full flex-shrink-0 flex items-center justify-center text-[#7D8FED]">
                  <LightBulbIcon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Operational Briefing</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Our AI analyzes visual and textual data to extract technical specifications, safety protocols, and required materials. 
                    Select your input method and project category to begin the deep-scan.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowBriefing(false)}
                className="absolute top-2 right-2 p-1 text-slate-500 hover:text-white transition-colors"
              >
                <XCircleIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="space-y-4">
            {activeTab === 'YOUTUBE' && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">YouTube Link</label>
                <div className="relative">
                  <YouTubeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#7D8FED]/50 transition-all"
                  />
                </div>
              </div>
            )}

            {activeTab === 'URL' && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Project Webpage</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://blog.maker.com/project-guide"
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#7D8FED]/50 transition-all"
                  />
                </div>
              </div>
            )}

            {activeTab === 'IMAGE' && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Upload Visuals</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 hover:border-[#7D8FED]/30 hover:bg-slate-800/50 transition-all cursor-pointer group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                  />
                  {files.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-2">
                      {files.map((f, i) => (
                        <div key={i} className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden relative">
                          <img src={URL.createObjectURL(f)} alt="preview" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <div className="w-16 h-16 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-500">
                        <PlusIcon className="w-6 h-6" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-[#7D8FED] group-hover:scale-110 transition-all">
                        <PhotoIcon className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">Drop project photos here</p>
                        <p className="text-xs text-slate-500 mt-1">AI will identify tools & materials</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'CAMERA' && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Real-time Scan</label>
                <div className="relative aspect-video bg-slate-800 rounded-3xl overflow-hidden border border-slate-700">
                  {!isCameraActive ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <CameraIcon className="w-12 h-12 text-slate-600" />
                      <button 
                        onClick={() => setIsCameraActive(true)}
                        className="bg-[#7D8FED] text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-all"
                      >
                        Activate Lens
                      </button>
                    </div>
                  ) : (
                    <>
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <div className="absolute inset-0 border-2 border-[#7D8FED]/30 pointer-events-none">
                        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#7D8FED]" />
                        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#7D8FED]" />
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#7D8FED]" />
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#7D8FED]" />
                      </div>
                      <button 
                        onClick={capturePhoto}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-slate-900 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all"
                      >
                        <div className="w-12 h-12 rounded-full border-2 border-slate-900" />
                      </button>
                    </>
                  )}
                </div>
                {files.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-2xl border border-slate-700">
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <img src={URL.createObjectURL(files[0])} alt="capture" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-xs font-bold text-white">Frame Captured</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Ready for analysis</p>
                    </div>
                    <button onClick={() => setFiles([])} className="text-slate-500 hover:text-white">
                      <RefreshCwIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Project Classification</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                    category === cat 
                      ? 'bg-[#7D8FED] border-[#7D8FED] text-white shadow-lg shadow-[#7D8FED]/20' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Legal Affirmation */}
          <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="affirmation"
                checked={hasAffirmed}
                onChange={(e) => setHasAffirmed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-800 text-[#7D8FED] focus:ring-[#7D8FED]"
              />
              <label htmlFor="affirmation" className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-wider font-medium">
                I affirm that I have the legal right to analyze this content and that my use complies with the platform's terms of service and ethical AI guidelines.
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldIcon className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted Analysis</span>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={isLoading || !hasAffirmed || (activeTab === 'IMAGE' && files.length === 0) || (activeTab === 'CAMERA' && files.length === 0) || ((activeTab === 'YOUTUBE' || activeTab === 'URL') && !url)}
            className={`w-full sm:w-auto px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${
              isLoading || !hasAffirmed || ((activeTab === 'IMAGE' || activeTab === 'CAMERA') && files.length === 0) || ((activeTab === 'YOUTUBE' || activeTab === 'URL') && !url)
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-[#7D8FED] text-white hover:scale-105 active:scale-95 shadow-xl shadow-[#7D8FED]/20'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCwIcon className="w-4 h-4 animate-spin" />
                <span>{loadingMessage || 'Processing...'}</span>
              </>
            ) : (
              <>
                <ScanFrameIcon className="w-4 h-4" />
                <span>Initiate Deep Scan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyzeModal;
