import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Plus,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Smartphone,
  CreditCard,
  Building,
  X,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { api } from '../../services/api';

export default function Financials() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'payments'
  const [loading, setLoading] = useState(true);

  // Modals
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Invoice Form
  const [invoiceForm, setInvoiceForm] = useState({
    projectId: '',
    clientId: '',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    depositPercent: 50,
    items: [
      { description: 'Brand Identity & Visual Style Guide', quantity: 1, unitPrice: 30000, amount: 30000 }
    ]
  });

  // Payment Form
  const [paymentForm, setPaymentForm] = useState({
    invoiceId: '',
    amount: '',
    method: 'mpesa', // 'mpesa' | 'bank_transfer'
    phone: '+254 7',
    transactionRef: '',
    paymentType: 'deposit',
    notes: ''
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  const fetchFinancialData = async () => {
    try {
      const q = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const [invData, payData, projData, cliData] = await Promise.all([
        api.getInvoices(q),
        api.getPayments(),
        api.getProjects(),
        api.getClients()
      ]);
      setInvoices(invData);
      setPayments(payData);
      setProjects(projData);
      setClients(cliData);

      if (projData.length > 0 && !invoiceForm.projectId) {
        setInvoiceForm((prev) => ({
          ...prev,
          projectId: projData[0].id,
          clientId: projData[0].clientId
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, [statusFilter]);

  // Invoice line item helpers
  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceForm.items];
    newItems[index][field] = value;
    if (field === 'quantity' || field === 'unitPrice') {
      const qty = Number(newItems[index].quantity) || 0;
      const price = Number(newItems[index].unitPrice) || 0;
      newItems[index].amount = qty * price;
    }
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  const addItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { description: '', quantity: 1, unitPrice: 5000, amount: 5000 }]
    });
  };

  const removeItem = (idx) => {
    if (invoiceForm.items.length === 1) return;
    setInvoiceForm({
      ...invoiceForm,
      items: invoiceForm.items.filter((_, i) => i !== idx)
    });
  };

  const totalCalculated = invoiceForm.items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  const depositCalculated = Math.round((totalCalculated * (Number(invoiceForm.depositPercent) || 0)) / 100);
  const balanceCalculated = totalCalculated - depositCalculated;

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      await api.createInvoice({
        projectId: invoiceForm.projectId,
        clientId: invoiceForm.clientId,
        totalAmount: totalCalculated,
        depositAmount: depositCalculated,
        dueDate: invoiceForm.dueDate,
        items: invoiceForm.items
      });
      setShowInvoiceModal(false);
      fetchFinancialData();
      alert('Invoice created successfully in Kenyan Shillings!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleOpenPayment = (inv) => {
    setSelectedInvoice(inv);
    setPaymentForm({
      invoiceId: inv.id,
      amount: inv.balanceAmount > 0 ? inv.balanceAmount : inv.depositAmount,
      method: 'mpesa',
      phone: '+254 722 000 000',
      transactionRef: '',
      paymentType: inv.status === 'unpaid' ? 'deposit' : 'full',
      notes: ''
    });
    setShowPaymentModal(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);
    try {
      await api.recordPayment({
        invoiceId: paymentForm.invoiceId,
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
        phone: paymentForm.phone,
        transactionRef: paymentForm.transactionRef,
        paymentType: paymentForm.paymentType
      });
      setShowPaymentModal(false);
      fetchFinancialData();
      alert('Payment registered! Invoice balance updated automatically.');
    } catch (err) {
      alert('Error recording payment: ' + err.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  // Metrics
  const totalBilled = invoices.reduce((s, i) => s + (Number(i.totalAmount) || 0), 0);
  const totalCollected = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalOutstanding = invoices.reduce((s, i) => s + (Number(i.balanceAmount) || 0), 0);

  const filteredInvoices = invoices.filter((i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      i.invoiceNumber.toLowerCase().includes(q) ||
      i.projectName.toLowerCase().includes(q) ||
      i.clientName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Financial Management & Invoicing (KES)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated milestone calculations, Kenyan Shillings quotations, deposits, and M-Pesa STK simulations.
          </p>
        </div>

        <button
          onClick={() => setShowInvoiceModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Create Invoice / Quotation
        </button>
      </div>

      {/* 2. Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Invoiced</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            KSh {totalBilled.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            Across {invoices.length} commercial contracts
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Collected (Cash Flow)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            KSh {totalCollected.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
            Verified M-Pesa & Bank settlements
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Receivable</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">
            KSh {totalOutstanding.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            Pending artwork completion or final sign-off
          </span>
        </div>
      </div>

      {/* 3. Tab Switcher & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold w-full md:w-auto">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'invoices' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Invoices & Quotations ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'payments' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Payment Transactions ({payments.length})
          </button>
        </div>

        {activeTab === 'invoices' && (
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice # or client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {['all', 'unpaid', 'deposit_paid', 'paid'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg capitalize font-semibold transition ${
                    statusFilter === st ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Tab 1: Invoices Table */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Invoice #</th>
                  <th className="py-3.5 px-6">Project & Client</th>
                  <th className="py-3.5 px-6">Total Cost</th>
                  <th className="py-3.5 px-6">Deposit (50%)</th>
                  <th className="py-3.5 px-6">Balance Due</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-6 font-mono font-bold text-blue-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{inv.projectName}</p>
                      <p className="text-[11px] text-slate-400">{inv.clientName}</p>
                    </td>
                    <td className="py-4 px-6 font-black text-slate-900">
                      KSh {inv.totalAmount?.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      KSh {inv.depositAmount?.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 font-bold text-rose-600">
                      KSh {inv.balanceAmount?.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-500">{inv.dueDate}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'deposit_paid'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {inv.status !== 'paid' ? (
                        <button
                          onClick={() => handleOpenPayment(inv)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                        >
                          Record Payment
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700">Settled ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Payments Ledger */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Date / Time</th>
                  <th className="py-3.5 px-6">Client</th>
                  <th className="py-3.5 px-6">Method & Ref</th>
                  <th className="py-3.5 px-6">Payment Stage</th>
                  <th className="py-3.5 px-6">Amount (KES)</th>
                  <th className="py-3.5 px-6">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(p.paidAt).toLocaleDateString()} {new Date(p.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">{p.clientName}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {p.method === 'mpesa' ? (
                          <span className="px-2 py-0.5 rounded font-black text-[10px] bg-emerald-100 text-emerald-800">
                            M-PESA
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded font-black text-[10px] bg-blue-100 text-blue-800">
                            BANK
                          </span>
                        )}
                        <span className="font-mono text-slate-700 font-bold">{p.transactionRef}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 capitalize font-medium text-slate-700">
                      {p.paymentType} Payment
                    </td>
                    <td className="py-4 px-6 font-black text-slate-900 text-sm">
                      KSh {p.amount?.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Create Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Create Professional Invoice / Quotation</h2>
                <p className="text-xs text-slate-400">All amounts calculated in Kenyan Shillings (KES)</p>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Select Project
                  </label>
                  <select
                    value={invoiceForm.projectId}
                    onChange={(e) => {
                      const pr = projects.find((p) => p.id === e.target.value);
                      setInvoiceForm({
                        ...invoiceForm,
                        projectId: e.target.value,
                        clientId: pr ? pr.clientId : invoiceForm.clientId
                      });
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {projects.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.name} ({pr.clientName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Payment Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Dynamic Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Deliverable Items & Services
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add line
                  </button>
                </div>

                <div className="space-y-2">
                  {invoiceForm.items.map((it, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        placeholder="Item description (e.g. Logo Vector Package)"
                        required
                        value={it.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={it.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-14 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-center"
                      />
                      <input
                        type="number"
                        placeholder="Rate (KES)"
                        value={it.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="w-24 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-right font-bold"
                      />
                      <span className="w-24 text-right font-black text-slate-900 pr-2">
                        KSh {Number(it.amount).toLocaleString()}
                      </span>
                      {invoiceForm.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Deposit & Balance Calculation Card */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Total Project Fee:</span>
                  <span className="font-black text-base text-slate-900">
                    KSh {totalCalculated.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs pt-1 border-t border-blue-100">
                  <span className="font-semibold text-slate-600">Upfront Deposit Required:</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={invoiceForm.depositPercent}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, depositPercent: Number(e.target.value) })}
                      className="text-xs bg-white border border-blue-200 rounded-lg px-2 py-0.5 font-bold"
                    >
                      <option value="50">50% Deposit</option>
                      <option value="30">30% Deposit</option>
                      <option value="100">100% Full Payment</option>
                    </select>
                    <span className="font-bold text-blue-700">KSh {depositCalculated.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1 border-t border-blue-100">
                  <span className="font-semibold text-slate-600">Remaining Balance on Sign-Off:</span>
                  <span className="font-bold text-slate-800">KSh {balanceCalculated.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Record Payment Modal (M-Pesa STK & Bank Transfer) */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Record Client Payment</h2>
                <p className="text-xs text-slate-400 font-mono">{selectedInvoice.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-800">{selectedInvoice.projectName}</p>
                <p className="text-slate-500">Client: {selectedInvoice.clientName}</p>
                <div className="flex justify-between pt-1 font-semibold">
                  <span>Balance Due:</span>
                  <span className="text-rose-600 font-black">
                    KSh {selectedInvoice.balanceAmount?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, method: 'mpesa' })}
                    className={`p-3 rounded-xl border flex items-center gap-2 font-bold transition ${
                      paymentForm.method === 'mpesa'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-600" /> M-Pesa STK
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, method: 'bank_transfer' })}
                    className={`p-3 rounded-xl border flex items-center gap-2 font-bold transition ${
                      paymentForm.method === 'bank_transfer'
                        ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Building className="w-4 h-4 text-blue-600" /> Bank Transfer
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Amount to Settle (KES) *
                </label>
                <input
                  type="number"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-black bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {paymentForm.method === 'mpesa' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    M-Pesa Registered Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={paymentForm.phone}
                    onChange={(e) => setPaymentForm({ ...paymentForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="+254 722 000 000"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Simulates STK Push prompt to client device
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Bank Transaction / EFT Code
                  </label>
                  <input
                    type="text"
                    value={paymentForm.transactionRef}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    placeholder="e.g. KCB-EFT-991204"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingPayment}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  {processingPayment ? 'Confirming...' : 'Record Payment (KES)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
