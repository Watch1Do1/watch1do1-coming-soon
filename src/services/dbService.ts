import { Video, User } from "../types";
import { getSupabase } from "./supabaseClient";

// Database service with Supabase integration
export const dbService = {
    getAllVideos: async (): Promise<Video[]> => {
        const stored = localStorage.getItem('w1d1_videos');
        return stored ? JSON.parse(stored) : [];
    },
    insertVideo: async (video: Video) => {
        const videos = await dbService.getAllVideos();
        localStorage.setItem('w1d1_videos', JSON.stringify([video, ...videos]));
        
        // Store analysis result in Supabase if configured
        try {
            const supabase = getSupabase();
            if (supabase) {
                const { error } = await supabase
                    .from('analysis_results')
                    .insert([{ 
                        video_id: video.id, 
                        title: video.title, 
                        url: video.videoUrl, 
                        results: video.insights,
                        products: video.products,
                        category: video.category,
                        created_at: new Date().toISOString()
                    }]);
                if (error) console.error('Supabase analysis storage error:', error);
            }
        } catch (e) {
            console.warn('Supabase not configured or error:', e);
        }
    },
    getUser: async (email: string): Promise<User | null> => {
        const stored = localStorage.getItem(`w1d1_user_${email}`);
        return stored ? JSON.parse(stored) : null;
    },
    upsertUser: async (user: User) => {
        localStorage.setItem(`w1d1_user_${user.email}`, JSON.stringify(user));
    },
    incrementVideoStat: async (videoId: number, stat: string) => {
        console.log(`Incrementing ${stat} for video ${videoId}`);
    },
    updateVideoStatus: async (videoId: number, status: string, products?: any, comp?: any, insights?: any, title?: string) => {
        const videos = await dbService.getAllVideos();
        const updated = videos.map(v => v.id === videoId ? { ...v, status, products: products || v.products, complementaryProducts: comp || v.complementaryProducts, insights: insights || v.insights, title: title || v.title } : v);
        localStorage.setItem('w1d1_videos', JSON.stringify(updated));
    },
    logEvent: async (eventName: string, data?: any) => {
        console.log('Event Logged:', eventName, data);
        try {
            const supabase = getSupabase();
            if (supabase) {
                const { error } = await supabase
                    .from('app_events')
                    .insert([{ 
                        event_name: eventName, 
                        event_data: data, 
                        created_at: new Date().toISOString() 
                    }]);
                if (error) console.error('Supabase event logging error:', error);
            }
        } catch (e) {
            // Silent fail for analytics
        }
    },
    // Waitlist signup
    addToWaitlist: async (email: string) => {
        console.log(`Waitlist signup for: ${email}`);
        try {
            const supabase = getSupabase();
            if (supabase) {
                const { error } = await supabase
                    .from('waitlist')
                    .insert([{ email, created_at: new Date().toISOString() }]);
                if (error) throw error;
                return { success: true };
            } else {
                throw new Error('Supabase not configured');
            }
        } catch (e) {
            console.error('Supabase waitlist error:', e);
            // Fallback to local storage for demo purposes if Supabase fails
            const waitlist = JSON.parse(localStorage.getItem('w1d1_waitlist') || '[]');
            localStorage.setItem('w1d1_waitlist', JSON.stringify([...waitlist, { email, ts: new Date().toISOString() }]));
            return { success: true, local: true };
        }
    }
};
