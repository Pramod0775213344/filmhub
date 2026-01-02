"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Users, 
  Film, 
  Tv, 
  Eye, 
  TrendingUp, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalTVShows: 0,
    totalUsers: 0,
    totalViews: 0,
  });
  const [topContent, setTopContent] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [chartData, setChartData] = useState([]); // For Pie Chart
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch User Growth Data
        const { data: profiles } = await supabase
          .from("profiles")
          .select("created_at")
          .order("created_at", { ascending: true });

        if (profiles) {
          const growthMap = {};
          profiles.forEach(p => {
            const date = new Date(p.created_at);
            const key = date.toLocaleDateString('default', { month: 'short', year: '2-digit' }); // e.g., "Jan 24"
            growthMap[key] = (growthMap[key] || 0) + 1;
          });

          // Convert to cumulative array
          let cumulative = 0;
          const growthArray = Object.entries(growthMap).map(([name, count]) => {
            cumulative += count;
            return { name, users: cumulative, new: count };
          });
          setUserGrowth(growthArray);
        }

        // Fetch Total Movies
        const { count: moviesCount } = await supabase
          .from("movies")
          .select("*", { count: "exact", head: true })
          .eq("type", "Movie");

        // Fetch Total TV Shows
        const { count: tvCount } = await supabase
          .from("movies")
          .select("*", { count: "exact", head: true })
          .eq("type", "TV Show");

        // Fetch Total Users
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Fetch Total Views
        const { data: viewsData } = await supabase
          .from("movies")
          .select("views");
        
        const totalViews = viewsData?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;

        // Fetch Top Content
        const { data: popularData } = await supabase
            .from("movies")
            .select("title, views, type, rating")
            .order("views", { ascending: false })
            .limit(5);

        setStats({
          totalMovies: moviesCount || 0,
          totalTVShows: tvCount || 0,
          totalUsers: usersCount || 0,
          totalViews: totalViews,
        });
        
        setChartData([
          { name: 'Movies', value: moviesCount || 0 },
          { name: 'TV Shows', value: tvCount || 0 },
        ]);

        setTopContent(popularData || []);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [supabase]);

  const statCards = [
    { name: "Total Movies", value: stats.totalMovies, icon: Film, color: "text-blue-500", trend: "+12%", up: true },
    { name: "TV Shows", value: stats.totalTVShows, icon: Tv, color: "text-purple-500", trend: "+5%", up: true },
    { name: "Registered Users", value: stats.totalUsers, icon: Users, color: "text-green-500", trend: "+8%", up: true },
    { name: "Total Views", value: stats.totalViews.toLocaleString(), icon: Eye, color: "text-primary", trend: "+15%", up: true },
  ];

  const COLORS = ['#3b82f6', '#a855f7'];

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-4xl font-black tracking-tight text-white">
              System <span className="text-primary italic">Overview</span>
            </h1>
            <p className="mt-2 text-zinc-500 font-medium">Real-time performance metrics and platform analytics.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 ring-1 ring-white/10">
              <Activity size={14} className="text-primary" />
              Live Stats
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass group relative overflow-hidden rounded-3xl p-8 ring-1 ring-white/5 transition-all hover:ring-white/10"
            >
              <div className="absolute -right-4 -top-4 opacity-5 bg-gradient-to-br from-primary to-transparent h-24 w-24 rounded-full blur-3xl group-hover:opacity-10 transition-opacity" />
              
              <div className="flex items-center justify-between mb-4">
                <div className={`rounded-2xl bg-white/5 p-3 ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter ${stat.up ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {stat.trend}
                </div>
              </div>
              
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">{stat.name}</h3>
              <p className="text-3xl font-black text-white tracking-tighter">{loading ? "..." : stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Growth Chart */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <TrendingUp size={14} className="text-primary" />
              User Growth Overview
            </h2>
            <div className="glass rounded-3xl p-6 ring-1 ring-white/5 h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowth}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E50914" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#E50914" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    labelStyle={{ color: '#71717a', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#E50914" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <Film size={14} className="text-primary" />
              Content Distribution
            </h2>
            <div className="glass rounded-3xl p-6 ring-1 ring-white/5 h-[400px] flex flex-col items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                     itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-white">{stats.totalMovies + stats.totalTVShows}</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Center & Popular Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <Activity size={14} className="text-primary" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <Link href="/admin/dashboard/movies" className="flex items-center justify-between rounded-2xl bg-white/5 p-6 ring-1 ring-white/5 hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Film size={20} />
                  </div>
                  <span className="text-sm font-black text-white uppercase tracking-wider">Manage Movies</span>
                </div>
                <Plus size={18} className="text-zinc-600 group-hover:text-white transition-colors" />
              </Link>
              
              <Link href="/admin/dashboard/tv-shows" className="flex items-center justify-between rounded-2xl bg-white/5 p-6 ring-1 ring-white/5 hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Tv size={20} />
                  </div>
                  <span className="text-sm font-black text-white uppercase tracking-wider">Manage TV Shows</span>
                </div>
                <Plus size={18} className="text-zinc-600 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

          {/* Most Popular Content */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <TrendingUp size={14} className="text-primary" />
              Most Popular Content
            </h2>
            <div className="glass rounded-3xl p-6 ring-1 ring-white/5">
              <div className="space-y-4">
                {topContent.map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-2xl bg-white/5 p-4 transition-colors hover:bg-white/10">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-black text-white ${i===0 ? 'bg-yellow-500' : i===1 ? 'bg-zinc-400' : i===2 ? 'bg-amber-700' : 'bg-zinc-800'}`}>
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{item.title}</h3>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.type} • ⭐ {item.rating}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-1.5 text-xs font-black text-primary">
                      <Eye size={12} />
                      {item.views || 0}
                    </div>
                  </div>
                ))}
                {topContent.length === 0 && (
                   <div className="text-center py-8 text-zinc-500 italic">No data available yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
