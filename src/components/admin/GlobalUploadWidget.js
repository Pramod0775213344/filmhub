"use client";

import { useUpload } from "@/context/UploadContext";
import { Loader2, Minimize2, X, CheckCircle2, AlertCircle, Cloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function GlobalUploadWidget() {
  const { activeUpload, cancelUpload, accessToken, requestAuth } = useUpload();
  const [minimized, setIsMinimized] = useState(false);

  // Auto-connect prompt if not connected (optional, but good for UX)
  // For now, we only show specific UI when there's an active upload OR if user explicitly wants to check status

  if (!activeUpload) {
     // If not uploading, maybe show a tiny floating button to Connect Drive if not connected?
     // Or just return null to keep UI clean.
     // Let's return null for cleanliness, but maybe a floating 'Connect Drive' if they are on admin pages?
     // Actually, let's keep it hidden unless uploading.
     return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {!minimized ? (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="glass w-80 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-white/5 p-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <Cloud size={16} className="text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-white">Upload Manager</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsMinimized(true)} className="text-zinc-400 hover:text-white"><Minimize2 size={14} /></button>
                <button onClick={cancelUpload} className="text-zinc-400 hover:text-red-500"><X size={14} /></button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                 <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    {activeUpload.status === 'uploading' && <Loader2 className="animate-spin text-primary" size={20} />}
                    {activeUpload.status === 'complete' && <CheckCircle2 className="text-green-500" size={20} />}
                    {activeUpload.status === 'error' && <AlertCircle className="text-red-500" size={20} />}
                    {activeUpload.status === 'preparing' && <Loader2 className="animate-spin text-zinc-500" size={20} />}
                 </div>
                 <div className="overflow-hidden">
                   <p className="text-xs font-bold text-white truncate">{activeUpload.movieTitle}</p>
                   <p className="text-[10px] text-zinc-500 uppercase font-black">{activeUpload.status}</p>
                 </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${activeUpload.status === 'error' ? 'bg-red-500' : (activeUpload.status === 'complete' ? 'bg-green-500' : 'bg-primary')}`} 
                  style={{ width: `${activeUpload.progress}%` }} 
                />
              </div>
              <div className="flex justify-end mt-1">
                <span className="text-[10px] font-bold text-zinc-400">{activeUpload.progress}%</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsMinimized(false)}
            className="h-14 w-14 rounded-full glass border border-primary/30 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform relative"
          >
            {/* Circular Progress */}
            <svg className="absolute inset-0 h-full w-full -rotate-90 text-zinc-800" viewBox="0 0 36 36">
              <path className="fill-none stroke-current stroke-[3]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path 
                className={`fill-none stroke-[3] transition-all duration-300 ${activeUpload.status === 'error' ? 'stroke-red-500' : (activeUpload.status === 'complete' ? 'stroke-green-500' : 'stroke-primary')}`}
                strokeDasharray={`${activeUpload.progress}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              />
            </svg>
            <Cloud size={20} className="text-white relative z-10" />
            {activeUpload.status === 'uploading' && <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full animate-pulse z-20" />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
