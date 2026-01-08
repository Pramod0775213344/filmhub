"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, CheckCircle2, AlertCircle, FileVideo, Minimize2, Maximize2, Copy } from "lucide-react";
import { useState } from "react";

export default function FloatingUploads({ uploads, onClose, onMinimize }) {
  const [minimized, setMinimized] = useState(false);

  if (uploads.length === 0) return null;

  const toggleMinimize = () => setMinimized(!minimized);

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-4 pointer-events-none">
       {/* Main Container */}
       <div className="pointer-events-auto bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden w-80 sm:w-96 flex flex-col transition-all duration-300">
           {/* Header */}
           <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 cursor-pointer" onClick={toggleMinimize}>
              <div className="flex items-center gap-2">
                 <div className="relative">
                    <Loader2 className={`text-primary ${uploads.some(u => u.status === 'uploading') ? 'animate-spin' : ''}`} size={18} />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                        {uploads.filter(u => u.status === 'uploading').length}
                    </span>
                 </div>
                 <h3 className="text-xs font-black uppercase tracking-widest text-white">Upload Manager</h3>
              </div>
              <div className="flex items-center gap-1">
                 <button onClick={(e) => { e.stopPropagation(); toggleMinimize(); }} className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                    {minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                 </button>
              </div>
           </div>

           {/* List */}
           {!minimized && (
               <div className="max-h-96 overflow-y-auto custom-scrollbar p-2 space-y-2">
                  <AnimatePresence mode="popLayout">
                    {uploads.slice().reverse().map((upload) => (
                        <motion.div 
                           key={upload.id}
                           layout
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, scale: 0.9 }}
                           className="bg-zinc-900 rounded-xl p-3 border border-white/5 relative group"
                        >
                           <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                                  {upload.status === 'complete' ? <CheckCircle2 className="text-green-500" size={20} /> : 
                                   upload.status === 'error' ? <AlertCircle className="text-red-500" size={20} /> :
                                   <FileVideo className="text-zinc-500" size={20} />
                                  }
                              </div>
                              <div className="flex-grow min-w-0">
                                 <div className="flex justify-between items-start">
                                     <p className="text-xs font-bold text-white truncate pr-6" title={upload.name}>{upload.name}</p>
                                     <button onClick={() => onClose(upload.id)} className="text-zinc-600 hover:text-white transition-colors"><X size={12} /></button>
                                 </div>
                                 
                                 {upload.status === 'uploading' && (
                                     <div className="mt-2 space-y-1">
                                         <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                             <div className="h-full bg-primary transition-all duration-300" style={{ width: `${upload.progress}%` }} />
                                         </div>
                                         <div className="flex justify-between text-[10px] font-medium text-zinc-500 uppercase">
                                             <span>{upload.progress}%</span>
                                             <span>{upload.speed}</span>
                                         </div>
                                     </div>
                                 )}

                                 {upload.status === 'complete' && (
                                     <div className="mt-2">
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(upload.link);
                                                alert("Link copied!");
                                            }}
                                            className="flex items-center gap-2 text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1.5 rounded-lg hover:bg-green-500/20 w-full justify-center transition-colors"
                                        >
                                            <Copy size={12} /> Copy Link
                                        </button>
                                     </div>
                                 )}

                                 {upload.status === 'error' && (
                                     <p className="mt-1 text-[10px] text-red-500 font-medium">Upload Failed. Try again.</p>
                                 )}
                              </div>
                           </div>
                        </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {uploads.length === 0 && (
                      <p className="text-center text-xs text-zinc-600 py-4">No active uploads</p>
                  )}
               </div>
           )}
       </div>
    </div>
  );
}
