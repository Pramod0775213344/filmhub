"use client";

import { useState } from "react";
import { Mail, Phone, Send, MessageSquare, Twitter, Instagram, Github, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  const supabase = createClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      // Assuming a 'messages' table exists or will exist. Standard columns: name, email, message.
      const { error } = await supabase.from("messages").insert([
        { 
          name: formData.name, 
          email: formData.email, 
          message: formData.message,
          created_at: new Date().toISOString()
        }
      ]);

      if (error) throw error;

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Submission error:", err);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-white">
      
      <div className="container-custom pt-48 pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-4xl font-black tracking-tight text-white md:text-6xl lg:text-7xl"
            >
              Get in <span className="text-primary italic">Touch</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-xl font-medium text-zinc-500"
            >
              Have a question or feedback? We&apos;d love to hear from you.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Contact Info */}
            <div className="space-y-8 lg:col-span-1">
              <div className="glass flex items-start gap-6 rounded-3xl p-8 transition-transform hover:scale-[1.02]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Email Us</h3>
                  <p className="font-bold text-white">pramodravishanka3344@gmail.com</p>
                </div>
              </div>

              <div className="glass flex items-start gap-6 rounded-3xl p-8 transition-transform hover:scale-[1.02]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Call Us</h3>
                  <p className="font-bold text-white">0775213344</p>
                </div>
              </div>

              <div className="glass flex items-start gap-6 rounded-3xl p-8 transition-transform hover:scale-[1.02]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Social Media</h3>
                  <div className="mt-2 flex gap-4">
                    <Twitter size={20} className="text-zinc-400 hover:text-primary cursor-pointer transition-colors" />
                    <Instagram size={20} className="text-zinc-400 hover:text-primary cursor-pointer transition-colors" />
                    <Github size={20} className="text-zinc-400 hover:text-primary cursor-pointer transition-colors" />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="glass relative overflow-hidden rounded-3xl p-8 md:p-12">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Message</label>
                  <textarea 
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-2xl bg-zinc-900/50 py-4 px-6 text-white outline-none ring-1 ring-white/10 focus:bg-zinc-900 focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="How can we help you?"
                  />
                </div>

                {status === "success" && (
                  <div className="mt-6 rounded-2xl bg-green-500/10 p-4 text-center font-bold text-green-500 ring-1 ring-green-500/20">
                    Message sent successfully! We&apos;ll get back to you soon.
                  </div>
                )}
                {status === "error" && (
                  <div className="mt-6 rounded-2xl bg-red-500/10 p-4 text-center font-bold text-red-500 ring-1 ring-red-500/20">
                    Something went wrong. Please try again later.
                  </div>
                )}

                <div className="mt-8">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="cinematic-glow flex items-center justify-center gap-3 w-full rounded-2xl bg-primary py-5 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
