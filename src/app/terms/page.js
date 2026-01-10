"use client";

import { Scale, FileText, AlertCircle, HelpCircle, CheckCircle2, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function TermsPage() {
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
              Terms of <span className="text-primary italic">Service</span>
            </h1>
            <p className="mt-6 text-xl text-zinc-400 font-medium leading-relaxed">
              Please read these terms carefully before using the SubHub SL platform.
            </p>
          </motion.div>

          <div className="space-y-16">
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <FileText size={24} />
                <h2 className="text-2xl font-bold uppercase tracking-widest">Agreement to Terms</h2>
              </div>
              <div className="glass rounded-3xl p-8 md:p-10 ring-1 ring-white/10 space-y-4 text-zinc-400 leading-relaxed font-medium">
                <p>
                  By accessing or using SubHub SL, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                </p>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <CheckCircle2 size={24} />
                <h2 className="text-2xl font-bold uppercase tracking-widest">User Conduct</h2>
              </div>
              <div className="glass rounded-3xl p-8 md:p-10 ring-1 ring-white/10 space-y-6 text-zinc-400 leading-relaxed font-medium">
                <ul className="space-y-4 list-disc pl-5">
                  <li>You must be at least 13 years of age to use this service.</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                  <li>You agree not to use the service for any illegal or unauthorized purpose.</li>
                  <li>You must not transmit any worms, viruses, or any code of a destructive nature.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <Scale size={24} />
                <h2 className="text-2xl font-bold uppercase tracking-widest">Intellectual Property</h2>
              </div>
              <div className="glass rounded-3xl p-8 md:p-10 ring-1 ring-white/10 text-zinc-400 leading-relaxed font-medium">
                <p>
                  The service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of SubHub SL and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without prior written consent.
                </p>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 text-primary">
                <AlertCircle size={24} />
                <h2 className="text-2xl font-bold uppercase tracking-widest">Termination</h2>
              </div>
              <div className="glass rounded-3xl p-8 md:p-10 ring-1 ring-white/10 text-zinc-400 leading-relaxed font-medium">
                <p>
                  We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
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
