"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  Shield, 
  MoreVertical,
  User as UserIcon,Loader2
} from "lucide-react";

import { motion } from "framer-motion";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!error) setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, [supabase]);

  return (
    <>
      <div className="space-y-12">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-4xl font-black tracking-tight text-white">
              Users <span className="text-primary italic">Management</span>
            </h1>
            <p className="mt-2 font-medium text-zinc-500">View and manage registered platform members.</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl bg-zinc-900/50 py-4 pl-12 pr-4 text-white outline-none ring-1 ring-white/10 focus:ring-primary/50"
            />
          </div>
          <div className="flex items-center gap-4 text-sm font-bold text-zinc-400 px-4">
            <Users size={18} className="text-primary" />
            <span>{users.length} Registered Users</span>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass overflow-hidden rounded-[2.5rem] ring-1 ring-white/5 shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">User</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Role</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Joined Date</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.filter(u => 
                u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((u) => (
                <tr key={u.id} className="group hover:bg-white/[0.01] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden ring-1 ring-white/10">
                        {u.avatar_url ? <img src={u.avatar_url} alt="" className="h-full w-full object-cover" /> : <UserIcon size={20} className="text-zinc-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-tight">{u.full_name || "Anonymous"}</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">ID: {u.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 ring-1 ring-white/10">
                      <Shield size={10} className="text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">User</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                      <Calendar size={14} className="text-zinc-700" />
                      {new Date(u.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-zinc-600 hover:text-white transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          )}
          
          {!loading && users.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-sm font-bold text-zinc-600 italic">No users found.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
