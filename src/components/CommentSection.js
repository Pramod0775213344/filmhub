"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { User, MessageSquare, Reply, Send, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function CommentSection({ mediaId, mediaType }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
   const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const supabase = createClient();
  const isAdmin = user?.email === "admin@gmail.com";

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    fetchUser();
    fetchComments();

    const channel = supabase
      .channel('comments_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'comments', filter: `media_id=eq.${mediaId}` },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mediaId, supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("media_id", mediaId)
        .eq("media_type", mediaType)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      const { error } = await supabase.from("comments").insert({
        user_id: user.id,
        user_email: user.email,
        media_id: mediaId,
        media_type: mediaType,
        content: newComment,
      });

      if (error) throw error;
      setNewComment("");
      fetchComments(); // Immediate update
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handleReply = async (parentId) => {
    if (!replyContent.trim() || !isAdmin) return;

    try {
      const { error } = await supabase.from("comments").insert({
        user_id: user.id,
        user_email: user.email,
        media_id: mediaId,
        media_type: mediaType,
        content: replyContent,
        parent_id: parentId,
      });

      if (error) throw error;
      setReplyContent("");
      setReplyingTo(null);
      fetchComments(); // Immediate update
    } catch (err) {
      console.error("Error posting reply:", err);
    }
  };

  const handleDelete = async (commentId) => {
    try {
       const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);
      if (error) throw error;
      fetchComments(); // Immediate update
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

  return (
    <div className="mt-12 max-w-4xl mx-auto px-6">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <MessageSquare className="text-primary" />
        Comments <span className="text-zinc-500 text-lg">({comments.length})</span>
      </h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-10 bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <User size={20} className="text-primary" />
            </div>
            <div className="flex-grow">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary/50 transition-colors resize-none h-24"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={16} />
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-6 bg-zinc-900/30 rounded-2xl border border-white/5 text-center">
          <p className="text-zinc-400 mb-4">Please sign in to join the discussion.</p>
          <a href="/login" className="inline-block bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors">
            Sign In
          </a>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : rootComments.length > 0 ? (
          rootComments.map(comment => (
            <div key={comment.id} className="group">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-white/5">
                  <span className="text-zinc-400 font-bold text-sm">
                    {comment.user_email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-grow">
                  <div className="bg-zinc-900/40 p-4 rounded-2xl rounded-tl-none border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-white font-bold text-sm block">
                          {comment.user_email?.split('@')[0]}
                        </span>
                        <span className="text-zinc-500 text-xs">
                          {isMounted && formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {(user?.id === comment.user_id || isAdmin) && (
                        <button 
                          onClick={() => handleDelete(comment.id)} 
                          className="text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-zinc-300 text-sm leading-relaxed">{comment.content}</p>
                    
                    {isAdmin && (
                      <button 
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="mt-3 text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1"
                      >
                        <Reply size={12} />
                        Reply
                      </button>
                    )}
                  </div>

                  {/* Reply Form (Admin Only) */}
                  {replyingTo === comment.id && (
                    <div className="mt-4 ml-4 flex gap-3 animate-in fade-in slide-in-from-top-2">
                      <div className="flex-grow">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none h-20"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                           <button
                            onClick={() => setReplyingTo(null)}
                            className="px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReply(comment.id)}
                            disabled={!replyContent.trim()}
                            className="bg-primary hover:bg-primary-hover text-white px-4 py-1.5 rounded-lg font-bold text-xs transition-colors disabled:opacity-50"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Replies List */}
                  {getReplies(comment.id).map(reply => (
                    <div key={reply.id} className="mt-4 ml-8 flex gap-4">
                       <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                        <span className="text-primary font-bold text-xs">A</span>
                      </div>
                      <div className="flex-grow">
                        <div className="bg-primary/5 p-3 rounded-xl rounded-tl-none border border-primary/10">
                           <div className="flex justify-between items-start mb-1">
                            <div>
                              <span className="text-primary font-bold text-xs block flex items-center gap-1">
                                Admin <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider">Staff</span>
                              </span>
                              <span className="text-zinc-500 text-[10px]">
                                {isMounted && formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                              </span>
                            </div>
                             {(user?.id === reply.user_id || isAdmin) && (
                                <button 
                                  onClick={() => handleDelete(reply.id)} 
                                  className="text-zinc-600 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                          </div>
                          <p className="text-zinc-300 text-sm">{reply.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-zinc-500 bg-zinc-900/20 rounded-2xl border border-white/5 border-dashed">
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}
