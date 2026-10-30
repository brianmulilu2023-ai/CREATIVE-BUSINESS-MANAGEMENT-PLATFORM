import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  FileCheck2,
  Receipt,
  Users,
  ShieldCheck,
  Zap,
  TrendingUp,
  Layers,
  ChevronDown,
  ChevronUp,
  Star,
  ExternalLink,
  Smartphone,
  Eye,
  Clock,
  Play
} from 'lucide-react';
import Logo from '../../components/common/Logo';
import { useAuth } from '../../context/AuthContext';

export default function LandingPage() {
  const { demoLogin, user } = useAuth();
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [activePreviewTab, setActivePreviewTab] = useState('kanban');

  const handleDesignerDemo = async () => {
    await demoLogin('designer');
    navigate('/dashboard');
  };

  const handleClientDemo = async () => {
    await demoLogin('client');
    navigate('/portal');
  };

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'Does CreativeDesk support Kenyan Shillings (KES) and M-Pesa payments?',
      a: 'Yes! CreativeDesk was custom-crafted for African and international creative entrepreneurs. You can issue quotations and invoices in KES, record deposits, and simulate M-Pesa STK push transactions seamlessly.'
    },
    {
      q: 'Can my clients submit requests and review artwork without a complicated account setup?',
      a: 'Absolutely. CreativeDesk includes a dedicated Client Portal. Clients can submit requests with color preferences and file attachments, annotate visual artwork versions, approve designs, and download final assets directly.'
    },
    {
      q: 'Are previous artwork versions preserved when a client asks for revisions?',
      a: 'Yes, never overwritten. Version history is strictly tracked (v1.0, v2.0, v3.0, etc.) so you and your client can compare iterations and view exact historical feedback notes anytime.'
    },
    {
      q: 'How does the deposit and balance calculation work?',
      a: 'CreativeDesk automatically handles milestone accounting. When a project is accepted, a 50% deposit invoice is auto-calculated. As partial or full payments are recorded, balances update in real-time.'
    },
    {
      q: 'Can creative agencies with multiple designers use CreativeDesk?',
      a: 'Yes! Agencies can manage dozens of client accounts, assign projects to specialized design categories, and track collective studio revenue from a unified command center.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo size="large" showTagline={true} />

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition">How It Works</a>
            <a href="#benefits" className="hover:text-blue-600 transition">For Studios & Freelancers</a>
            <a href="#pricing" className="hover:text-blue-600 transition">Pricing (KES)</a>
            <a href="#faq" className="hover:text-blue-600 transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={user.role === 'designer' ? '/dashboard' : '/portal'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition transform hover:-translate-y-0.5"
              >
                Go to Workspace <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition"
                >
                  Sign In
                </Link>
                <button
                  onClick={handleDesignerDemo}
                  className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition transform hover:-translate-y-0.5"
                >
                  Live Demo <Sparkles className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-400/15 via-indigo-400/15 to-transparent rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide uppercase mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Built for Graphic Designers, Photographers, Video Editors & Agencies
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#0F172A] max-w-5xl mx-auto leading-[1.12]">
            Run Your Creative Business <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Like a Pro.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
            Eliminate messy WhatsApp briefs, endless revision emails, and awkward payment follow-ups.
            CreativeDesk is the all-in-one command center to intake requests, review versioned artwork, track Kanban milestones, and bill in Kenyan Shillings.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition transform hover:-translate-y-0.5 inline-flex items-center gap-2"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>

            <button
              onClick={handleDesignerDemo}
              className="px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] border border-slate-200 font-bold text-base shadow-sm transition transform hover:-translate-y-0.5 inline-flex items-center gap-2"
            >
              <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
              Explore Designer Demo
            </button>

            <button
              onClick={handleClientDemo}
              className="px-6 py-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition inline-flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              Preview Client Portal
            </button>
          </div>

          {/* Key Value Props Ticker */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-xs sm:text-sm font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Versioned Artwork Proofing
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> KES & M-Pesa Ready
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Interactive Kanban Milestones
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dedicated Client Portal
            </div>
          </div>

          {/* 3. Interactive Product Dashboard Preview */}
          <div className="mt-16 max-w-6xl mx-auto rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-slate-200 via-slate-100 to-white shadow-2xl border border-slate-200/80">
            {/* Window chrome header */}
            <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-200/60 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                <span className="ml-3 text-xs font-mono text-slate-400">app.creativedesk.io/dashboard</span>
              </div>
              <div className="flex gap-1.5 bg-slate-200/70 p-1 rounded-xl text-xs font-medium text-slate-600">
                <button
                  onClick={() => setActivePreviewTab('kanban')}
                  className={`px-3 py-1 rounded-lg transition ${activePreviewTab === 'kanban' ? 'bg-white text-blue-600 font-bold shadow-xs' : 'hover:text-slate-900'}`}
                >
                  Kanban Workflow
                </button>
                <button
                  onClick={() => setActivePreviewTab('artwork')}
                  className={`px-3 py-1 rounded-lg transition ${activePreviewTab === 'artwork' ? 'bg-white text-blue-600 font-bold shadow-xs' : 'hover:text-slate-900'}`}
                >
                  Artwork Proofing
                </button>
                <button
                  onClick={() => setActivePreviewTab('billing')}
                  className={`px-3 py-1 rounded-lg transition ${activePreviewTab === 'billing' ? 'bg-white text-blue-600 font-bold shadow-xs' : 'hover:text-slate-900'}`}
                >
                  KES Financials
                </button>
              </div>
            </div>

            {/* Tab 1: Kanban Mockup */}
            {activePreviewTab === 'kanban' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 text-left">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Live Production Pipeline</h2>
                    <p className="text-xs text-slate-500">Real-time status tracking across active client projects</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    5 Projects Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Column 1 */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">In Progress</span>
                      <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">1</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                      <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Branding</span>
                      <p className="text-sm font-bold text-slate-800">Apex Fleet Graphic Wraps</p>
                      <p className="text-xs text-slate-500">Apex Logistics Kenya</p>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="bg-blue-600 h-full w-[60%]"></div>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-semibold text-slate-600 pt-1">
                        <span>Due Nov 10</span>
                        <span className="text-emerald-700">KSh 60,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Under Review</span>
                      <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">1</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-xs space-y-2 ring-2 ring-purple-500/10">
                      <span className="text-[10px] uppercase font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">Packaging</span>
                      <p className="text-sm font-bold text-slate-800">Savannah Single-Origin Coffee</p>
                      <p className="text-xs text-slate-500">Savannah Premium Roasters</p>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="bg-purple-600 h-full w-[80%]"></div>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-semibold text-slate-600 pt-1">
                        <span className="text-purple-600 font-bold">Artwork v2.0 Sent</span>
                        <span className="text-emerald-700">KSh 45,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3 */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Revision Required</span>
                      <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">1</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-xs space-y-2">
                      <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Menu Design</span>
                      <p className="text-sm font-bold text-slate-800">Zahra Swahili Coast Menu</p>
                      <p className="text-xs text-slate-500">Dr. Amina Hassan</p>
                      <p className="text-xs bg-rose-50 text-rose-700 p-2 rounded-lg italic">
                        "Please adjust lobster platter price to KSh 3,800..."
                      </p>
                    </div>
                  </div>

                  {/* Column 4 */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Completed</span>
                      <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">1</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs space-y-2">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">App Brand</span>
                      <p className="text-sm font-bold text-slate-800">Kiprono Agro Tech UI Tokens</p>
                      <p className="text-xs text-slate-500">Kevin Kiprono</p>
                      <div className="flex items-center justify-between text-[11px] text-emerald-700 font-bold pt-2">
                        <span>Approved & Paid</span>
                        <span>KSh 50,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Artwork Proofing Mockup */}
            {activePreviewTab === 'artwork' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 text-left">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        Version 2.0 (High Resolution Proof)
                      </span>
                      <span className="text-xs text-slate-400">Uploaded Oct 28, 2026</span>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 h-64 sm:h-80 flex items-center justify-center group">
                      <img
                        src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=1000&q=80"
                        alt="Coffee bag proof"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                        <span className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl shadow">
                          Inspect 100% Vector Detail
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm">Version Feedback History</h3>
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex justify-between font-bold text-slate-700 mb-1">
                          <span>Wanjiku Mwangi (Client)</span>
                          <span className="text-slate-400 font-normal">v1.0 Notes</span>
                        </div>
                        <p className="text-slate-600">"Make the tasting notes 20% larger and add the KEBS diamond mark."</p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                        <div className="flex justify-between font-bold text-emerald-900 mb-1">
                          <span>Alex Kamau (Designer)</span>
                          <span className="text-emerald-700 font-normal">v2.0 Revision</span>
                        </div>
                        <p className="text-emerald-800">"Updated typography scale and embedded certified KEBS vector stamp."</p>
                      </div>
                    </div>
                    <div className="pt-2 flex gap-2">
                      <button className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm">
                        Approve v2.0
                      </button>
                      <button className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200">
                        Request v3.0
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Billing Mockup */}
            {activePreviewTab === 'billing' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold uppercase">Monthly Revenue (KES)</p>
                    <p className="text-2xl font-black text-blue-950 mt-1">KSh 165,000</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-xs text-amber-700 font-bold uppercase">Outstanding Balances</p>
                    <p className="text-2xl font-black text-amber-950 mt-1">KSh 53,000</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <p className="text-xs text-emerald-700 font-bold uppercase">M-Pesa STK Verified</p>
                    <p className="text-2xl font-black text-emerald-950 mt-1">100% On Time</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                      M
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">M-Pesa Express Deposit: KSh 20,000</p>
                      <p className="text-xs text-slate-500 font-mono">Ref: QKH718299A • Savannah Coffee Packaging</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                    Completed
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Features Grid */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-2">Built For Creators</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Everything Your Creative Business Needs. Nothing It Doesn’t.
            </h3>
            <p className="mt-3 text-base text-slate-600">
              Stop juggling 5 different apps for briefs, file delivery, messages, and invoices. CreativeDesk unifies your entire studio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-blue-400 hover:shadow-lg transition group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Centralized Client Hub</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Maintain complete profiles, phone numbers, brand guidelines, and lifetime revenue tracking for every corporate client and startup you serve.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-blue-400 hover:shadow-lg transition group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Visual Kanban Workflow</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Move projects seamlessly from Pending to In Progress, Under Review, Revision, and Completed with clear progress meters and deadline alerts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-blue-400 hover:shadow-lg transition group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Versioned Artwork Proofing</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Upload artwork proofs with version tags (v1.0, v2.0). Clients can approve with a single tap or submit pin-point revision instructions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-blue-400 hover:shadow-lg transition group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Receipt className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">KES Quotations & Invoicing</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Generate professional invoices in Kenyan Shillings with automated deposit and balance splits (e.g., KSh 5,000 project = KSh 2,000 deposit, KSh 3,000 balance).
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-blue-400 hover:shadow-lg transition group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Smartphone className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">M-Pesa STK Simulation</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Clients can test mobile money payment prompts with transaction reference logging, keeping cash flow organized without manual receipt auditing.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-blue-400 hover:shadow-lg transition group">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Dedicated Client Portal</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Give clients a branded, white-glove dashboard to submit 10 design categories (logos, brochures, motion graphics) and track progress independently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-2">Streamlined Workflow</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              From Initial Brief to Final Paid Artwork in 4 Steps
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="text-3xl font-black text-blue-600/20 mb-3">01</div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Submit Request</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Client specifies category, deadline, budget (KES), color palettes, dimensions, and reference files.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="text-3xl font-black text-blue-600/20 mb-3">02</div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Accept & Kanban</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Designer converts the request to an active project with 1-click; initial 50% deposit invoice is auto-created.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="text-3xl font-black text-blue-600/20 mb-3">03</div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Upload & Revise</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Designer submits versioned artwork proofs. Client leaves structured revision comments without ever losing history.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="text-3xl font-black text-blue-600/20 mb-3">04</div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Approve & Settle</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Final artwork is approved, balance is cleared via M-Pesa or bank transfer, and high-res source files are unlocked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Benefits: Freelancers vs Agencies */}
      <section id="benefits" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-2">Tailored Experience</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Designed For Both Solo Creators & Growing Agencies
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-50/60 to-slate-50 border border-blue-200/80 shadow-xs">
              <div className="inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-4">
                Solo Freelancers
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-4">Look Like a 10-Person Studio</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Never work without a deposit again with automated 50% milestone invoicing.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Stop scope creep with locked request categories and clear revision round boundaries.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Keep deadlines organized with countdowns and visual Kanban priority flags.</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 shadow-xs">
              <div className="inline-flex px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold mb-4 border border-blue-400/20">
                Creative Agencies
              </div>
              <h4 className="text-2xl font-bold text-white mb-4">Manage Dozens of High-Ticket Retainers</h4>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <span>Centralized intake queue for 10 creative categories from branding to 4K motion graphics.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <span>Audit-ready financial logs supporting Kenyan Shillings, bank receipts, and M-Pesa refs.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <span>Provide corporate enterprise clients with a modern, high-trust portal experience.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Sample Testimonials */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-2">Proven Results</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Trusted by Top Creatives Across Nairobi & Beyond
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 italic">
                  "Before CreativeDesk, clients would send revision notes across SMS, emails, and phone calls. Now everything is versioned in one dashboard. It saved me at least 10 hours a week."
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Alex Kamau"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">Alex Kamau</p>
                  <p className="text-[11px] text-slate-500">Brand Identity Director, Nairobi</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 italic">
                  "The KES invoicing and 50% deposit automation completely eliminated late payments. Our clients appreciate having their own portal to review proofs and download final files."
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
                  alt="Wanjiku Mwangi"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">Wanjiku Mwangi</p>
                  <p className="text-[11px] text-slate-500">Marketing Lead, Savannah Coffee</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 italic">
                  "As a motion designer, handling client feedback on video frames used to be chaotic. The version history and status transitions make commercial client handoffs feel truly professional."
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                  alt="David Kiprop"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">David Kiprop</p>
                  <p className="text-[11px] text-slate-500">3D & Motion Specialist, Rift Creatives</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Pricing Plans */}
      <section id="pricing" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-2">Transparent Pricing</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Invest in Your Creative Growth
            </h3>
            <p className="mt-2 text-sm text-slate-600">All prices shown in Kenyan Shillings (KES). Cancel or change anytime.</p>

            {/* Billing Toggle */}
            <div className="mt-6 inline-flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  billingCycle === 'monthly' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  billingCycle === 'annual' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Annual <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="p-8 rounded-3xl bg-[#F8FAFC] border border-slate-200 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <h4 className="text-lg font-bold text-slate-900">Freelancer Solo</h4>
                <p className="text-xs text-slate-500 mt-1">For independent designers & photographers</p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-black text-slate-900">
                    KSh {billingCycle === 'annual' ? '2,000' : '2,500'}
                  </span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Up to 15 active projects
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Unlimited client accounts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Versioned artwork proofing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> KES Invoices & M-Pesa receipts
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-8 block text-center py-3 rounded-xl border border-blue-600 text-blue-600 font-bold text-xs hover:bg-blue-50 transition"
              >
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Pro Plan (Highlighted) */}
            <div className="p-8 rounded-3xl bg-blue-600 text-white relative shadow-xl shadow-blue-500/20 flex flex-col justify-between transform md:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                Most Popular for Studios
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Creative Studio</h4>
                <p className="text-xs text-blue-100 mt-1">For small studios and busy freelancers</p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-black text-white">
                    KSh {billingCycle === 'annual' ? '5,200' : '6,500'}
                  </span>
                  <span className="text-xs text-blue-200"> / month</span>
                </div>
                <ul className="space-y-3 text-xs text-blue-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" /> Unlimited active projects
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" /> Client Portal with custom brand logo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" /> Multi-version artwork comparisons
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" /> Priority notifications & deadline alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" /> Exportable revenue tax summaries
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-8 block text-center py-3 rounded-xl bg-white text-blue-600 font-bold text-xs shadow-md hover:bg-slate-50 transition"
              >
                Get Started Now
              </Link>
            </div>

            {/* Agency Scale Plan */}
            <div className="p-8 rounded-3xl bg-[#F8FAFC] border border-slate-200 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <h4 className="text-lg font-bold text-slate-900">Agency Scale</h4>
                <p className="text-xs text-slate-500 mt-1">For full-service advertising & creative agencies</p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-black text-slate-900">
                    KSh {billingCycle === 'annual' ? '11,200' : '14,000'}
                  </span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Everything in Creative Studio
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Unlimited client sub-accounts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Dedicated account manager in Nairobi
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Custom contracts & SLA templates
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="mt-8 block text-center py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
              >
                Contact Agency Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ Section */}
      <section id="faq" className="py-20 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-2">Got Questions?</h2>
            <h3 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-sm text-slate-900 focus:outline-none"
                >
                  <span>{faq.q}</span>
                  {activeFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="bg-[#0F172A] text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
            <div className="space-y-4">
              <Logo size="default" light={true} showTagline={true} />
              <p className="text-xs text-slate-400 leading-relaxed">
                The centralized management platform designed for freelance designers, photographers, video editors, and creative agencies.
              </p>
              <div className="text-xs text-slate-400">
                <p>Nairobi, Kenya</p>
                <p>contact@creativedesk.io</p>
                <p>+254 700 000 000</p>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Platform</h5>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#features" className="hover:text-white transition">Features Overview</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">Kanban Pipelines</a></li>
                <li><a href="#features" className="hover:text-white transition">Artwork Proofing</a></li>
                <li><a href="#pricing" className="hover:text-white transition">KES Invoicing</a></li>
                <li><Link to="/portal" className="hover:text-white transition">Client Portal</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Categories</h5>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><span>Brand Identity & Logos</span></li>
                <li><span>Social Media Graphics</span></li>
                <li><span>Packaging & Print Dielines</span></li>
                <li><span>4K Kinetic Motion Graphics</span></li>
                <li><span>Brochures & Catalogs</span></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Experience</h5>
              <div className="space-y-3">
                <button
                  onClick={handleDesignerDemo}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center transition"
                >
                  Launch Designer Demo
                </button>
                <button
                  onClick={handleClientDemo}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs text-center transition"
                >
                  Launch Client Demo
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 CreativeDesk Inc. All rights reserved. Your Creative Business, Organized.</p>
            <div className="flex gap-6">
              <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-400 cursor-pointer">Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
