"use client";

import { Shield, Lock, Eye, FileText, Globe, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-white">
      <div className="container-custom page-pt pb-20">
        <div className="max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h1 className="font-display text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
              Privacy <span className="text-primary italic">Policy</span>
            </h1>
            <p className="mt-6 text-xl text-zinc-400 font-medium leading-relaxed">
              Your privacy is paramount. Learn how SubHub SL protects and respects your personal data.
            </p>
          </motion.div>

          <div className="space-y-16">
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <Shield size={24} />
                <h2 className="text-2xl font-bold uppercase tracking-widest">Introduction</h2>
              </div>
              <div className="glass rounded-3xl p-8 md:p-10 ring-1 ring-white/10 space-y-4 text-zinc-400 leading-relaxed font-medium">
                <p>
                  At SubHub SL, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our streaming services.
                </p>
                <p>
                  By using SubHub SL, you consent to the data practices described in this policy. We regularly review our privacy practices to ensure we meet the highest standards of data protection.
                </p>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <Eye size={24} />
                <h2 className="text-2xl font-bold uppercase tracking-widest">Information We Collect</h2>
              </div>
              <div className="glass rounded-3xl p-8 md:p-10 ring-1 ring-white/10 space-y-6 text-zinc-400 leading-relaxed font-medium">
                <div className="space-y-2">
                  <h3 className="text-white font-bold text-lg">Personal Data</h3>
                  <p>When you register for SubHub SL, we collect information such as your name, email address, and profile preferences to provide a personalized experience.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-white font-bold text-lg">Usage Data</h3>
                  <p>We automatically collect information about how you interact with our service, including your watch history, search queries, and device information to improve our content recommendations.</p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <Lock size={24} />
                <h2 className="text-2xl font-bold uppercase tracking-widest">Data Security</h2>
              </div>
              <div className="glass rounded-3xl p-8 md:p-10 ring-1 ring-white/10 text-zinc-400 leading-relaxed font-medium">
                <p>
                  We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits.
                </p>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <Mail size={24} />
                <h2 className="text-2xl font-bold uppercase tracking-widest">Contact Us</h2>
              </div>
              <div className="glass rounded-3xl p-8 md:p-10 ring-1 ring-white/10 text-zinc-400 leading-relaxed font-medium">
                <p>
                  If you have any questions or concerns about our Privacy Policy or data practices, please contact our data protection officer at support@subhubsl.com.
                </p>
              </div>
            </section>
          </div>

          <div className="mt-20 pt-10 border-t border-white/5 text-zinc-600 text-sm font-bold uppercase tracking-widest">
            Last Updated: January 2026
          </div>
        </div>
      </div>
    </main>
  );
}
