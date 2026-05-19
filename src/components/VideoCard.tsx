import React from 'react';
import { Video } from '../types';
import { SparkleIcon } from './IconComponents';

const VideoCard: React.FC<{ video: Video; onSelect: (v: Video) => void; currentUser: any }> = ({ video, onSelect }) => {
    return (
        <article 
            onClick={() => onSelect(video)}
            className="group bg-slate-800/40 border border-slate-700 rounded-[2rem] overflow-hidden cursor-pointer hover:border-[#7D8FED]/50 transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(video)}
            aria-label={`View project kit for ${video.title}`}
        >
            <div className="aspect-video relative overflow-hidden">
                <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <div className="flex items-center gap-2 bg-[#7D8FED] text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                        <SparkleIcon className="w-3 h-3" /> View Build
                    </div>
                </div>
            </div>
            <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#7D8FED]">{video.category}</span>
                </div>
                <h3 className="text-white font-bold text-lg leading-tight mb-2 group-hover:text-[#7D8FED] transition-colors">{video.title}</h3>
                <p className="text-slate-500 text-xs font-medium">by {video.creator}</p>
            </div>
        </article>
    );
};

export default VideoCard;
