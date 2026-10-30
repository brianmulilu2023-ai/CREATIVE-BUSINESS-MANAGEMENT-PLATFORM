import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  FolderKanban,
  Inbox,
  CheckCircle2,
  DollarSign,
  Clock,
  ArrowUpRight,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Calendar,
  AlertCircle,
  FileCheck2,
  Receipt
} from 'lucide-react';
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
  Cell
} from 'recharts';
import { api } from '../../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadStats() {
      try {
        const stats = await api.getDashboardStats();
        setData(stats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleAcceptRequest = async (requestId) => {
    try {
      await api.convertRequest(requestId);
      // Reload stats
      const stats = await api.getDashboardStats();
      setData(stats);
      navigate('/projects');
    } catch (err) {
      alert('Error accepting request: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading CreativeDesk Command Center...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-rose-200">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <p className="font-bold text-slate-900">Failed to load dashboard metrics</p>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
      </div>
    );
  }

  const { metrics, revenueChart, projectDistribution, upcomingDeadlines, recentRequests, recentActivities } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Studio Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              Live
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time overview of active projects, client requests, and Kenyan Shillings cash flow.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/requests"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <Inbox className="w-3.5 h-3.5 text-blue-600" /> Intake Requests
          </Link>
          <Link
            to="/artwork"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-purple-600" /> Upload Artwork
          </Link>
          <Link
            to="/financials"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-600" /> New Invoice
          </Link>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" /> New Project
          </Link>
        </div>
      </div>

      {/* 2. Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Metric 1: Total Clients */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Clients</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics.totalClients}</p>
          <Link to="/clients" className="mt-2 text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1">
            View directory <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Metric 2: Active Projects */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Projects</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics.activeProjects}</p>
          <Link to="/projects" className="mt-2 text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1">
            Kanban board <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Metric 3: Pending Requests */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Briefs</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{metrics.pendingRequests}</p>
          <Link to="/requests" className="mt-2 text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1">
            Review briefs <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Metric 4: Completed Projects */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics.completedProjects}</p>
          <span className="mt-2 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            100% On-spec delivery
          </span>
        </div>

        {/* Metric 5: Monthly Revenue (KES) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/20 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-blue-100">
            <span className="text-[11px] font-bold uppercase tracking-wider">Revenue (KES)</span>
            <div className="p-1.5 rounded-lg bg-blue-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">
            KSh {metrics.monthlyRevenue?.toLocaleString()}
          </p>
          <p className="mt-2 text-[10px] text-blue-200 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Settled this cycle
          </p>
        </div>

        {/* Metric 6: Outstanding Balances */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-300 transition col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unpaid Balances</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">
            KSh {metrics.outstandingPayments?.toLocaleString()}
          </p>
          <Link to="/financials" className="mt-2 text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1">
            Collect now <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Analytics (Area Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Revenue Trajectory (KES)</h2>
              <p className="text-xs text-slate-500">Monthly gross creative collections</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
              +28% vs Last Quarter
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => [`KSh ${Number(value).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Pipeline Breakdown (Donut Chart) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Pipeline Status</h2>
            <p className="text-xs text-slate-500">Distribution of projects by production stage</p>
          </div>

          <div className="h-48 w-full my-auto flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                >
                  {projectDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '10px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {projectDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-600 truncate">{item.name}</span>
                <span className="font-bold text-slate-900 ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Two-Column Operational Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Client Requests with Accept Action */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Incoming Design Briefs</h2>
              <p className="text-xs text-slate-500">Requests waiting for review and project conversion</p>
            </div>
            <Link to="/requests" className="text-xs font-bold text-blue-600 hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recentRequests.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No pending design requests</p>
            ) : (
              recentRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        {req.requestId}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        {req.category}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{req.title}</p>
                    <p className="text-xs text-slate-500">{req.clientName}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-600 pt-1">
                      <span>Budget: <strong>KSh {req.budget?.toLocaleString()}</strong></span>
                      <span>•</span>
                      <span>Deadline: {req.deadline}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 shrink-0">
                    {req.status === 'pending' ? (
                      <button
                        onClick={() => handleAcceptRequest(req.id)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
                      >
                        Accept & Convert
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold text-center">
                        Accepted
                      </span>
                    )}
                    <Link
                      to="/requests"
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold text-center transition"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Deadlines & Recent Activities */}
        <div className="space-y-8">
          {/* Upcoming Deadlines */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Upcoming Deadlines</h2>
                <p className="text-xs text-slate-500">Prioritized delivery target dates</p>
              </div>
              <Link to="/projects" className="text-xs font-bold text-blue-600 hover:underline">
                View Kanban
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingDeadlines.map((p) => {
                const daysLeft = Math.ceil((new Date(p.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysLeft <= 7;
                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-slate-500">{p.clientName}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          isUrgent ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Due today'}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">{p.deadline}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight mb-4">Recent Studio Timeline</h2>
            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                  <div className="flex-1">
                    <p className="text-slate-800 font-medium">{act.text}</p>
                    <span className="text-[10px] text-slate-400">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
