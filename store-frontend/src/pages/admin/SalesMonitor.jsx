import { useState, useEffect } from "react";
import { FaSearch, FaPrint, FaCalendarAlt, FaBan, FaReceipt, FaShoppingCart, FaMoneyBillWave } from "react-icons/fa";
import axios from "../../utils/axios";
import Pagination from "../../components/Pagination";
import { toast } from "../../components/Toast";
import useKeyboardShortcuts from "../../utils/useKeyboardShortcuts";
import KeyboardShortcutsHelp from "../../components/KeyboardShortcutsHelp";

export default function SalesMonitor() {
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("orders");
  
  // Void modal state
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidTarget, setVoidTarget] = useState(null);
  const [voidReason, setVoidReason] = useState("");
  const [voidProcessing, setVoidProcessing] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/orders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("/api/sales-transactions?per_page=100", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setTransactions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
    }
  };

  const handleVoidTransaction = async () => {
    if (!voidReason.trim()) {
      toast.error("Please provide a reason for voiding");
      return;
    }
    try {
      setVoidProcessing(true);
      await axios.put(`/api/sales-transactions/${voidTarget.id}/void`, {
        void_reason: voidReason,
      });
      toast.success("Transaction voided successfully! Stock has been restored.");
      setShowVoidModal(false);
      setVoidTarget(null);
      setVoidReason("");
      fetchTransactions();
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to void transaction");
    } finally {
      setVoidProcessing(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.reference_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.payment_method?.toLowerCase().includes(searchQuery.toLowerCase());

    const orderDate = new Date(order.created_at);
    const matchesStartDate = !startDate || orderDate >= new Date(startDate);
    const matchesEndDate = !endDate || orderDate <= new Date(endDate + "T23:59:59");

    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  // Filter transactions
  const filteredTransactions = transactions.filter((txn) => {
    const orderId = String(txn.order?.id || txn.id);
    const matchesSearch = 
      orderId.includes(searchQuery) ||
      txn.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.payment_method?.toLowerCase().includes(searchQuery.toLowerCase());

    const txnDate = new Date(txn.created_at);
    const matchesStartDate = !startDate || txnDate >= new Date(startDate);
    const matchesEndDate = !endDate || txnDate <= new Date(endDate + "T23:59:59");

    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  // Use the right data based on active tab
  const currentData = activeTab === "orders" ? filteredOrders : filteredTransactions;

  // Pagination
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = currentData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Calculate totals
  const totalSales = filteredOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
  const totalOrders = filteredOrders.length;

  const totalTransactionSales = filteredTransactions
    .filter(t => !t.is_voided)
    .reduce((sum, t) => sum + parseFloat(t.total || 0), 0);
  const totalTransactions = filteredTransactions.length;
  const voidedTransactions = filteredTransactions.filter(t => t.is_voided).length;

  // Print function
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    const isOrders = activeTab === "orders";
    const title = isOrders ? "Sales Report - Orders" : "Sales Report - Transactions";
    const summaryData = isOrders
      ? `<p><strong>Total Orders:</strong> ${totalOrders}</p>
         <p><strong>Total Sales:</strong> ₱${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>`
      : `<p><strong>Total Transactions:</strong> ${totalTransactions}</p>
         <p><strong>Active Sales:</strong> ₱${totalTransactionSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
         <p><strong>Voided:</strong> ${voidedTransactions}</p>`;

    const tableHeaders = isOrders
      ? `<th>Order ID</th><th>Customer</th><th>Items</th><th>Total Amount</th><th>Status</th><th>Date</th>`
      : `<th>Order ID</th><th>Staff</th><th>Items</th><th>Total Amount</th><th>Status</th><th>Date</th>`;

    const tableRows = isOrders
      ? filteredOrders.map(order => `
          <tr>
            <td>${order.id}</td>
            <td>${order.customer_name || 'N/A'}</td>
            <td>${order.items?.map(item => `${item.product?.name} (${item.quantity}x)`).join(', ') || 'N/A'}</td>
            <td>₱${parseFloat(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>${order.payment_status || 'N/A'}</td>
            <td>${new Date(order.created_at).toLocaleString()}</td>
          </tr>`).join('')
      : filteredTransactions.map(txn => `
          <tr style="${txn.is_voided ? 'text-decoration: line-through; color: #999;' : ''}">
            <td>#${txn.order?.id || txn.id}</td>
            <td>${txn.user?.name || 'N/A'}</td>
            <td>${txn.items?.map(item => `${item.product?.name} (${item.quantity}x)`).join(', ') || 'N/A'}</td>
            <td>₱${parseFloat(txn.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>${txn.is_voided ? 'VOIDED' : 'COMPLETED'}</td>
            <td>${new Date(txn.created_at).toLocaleString()}</td>
          </tr>`).join('');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            .summary { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #FFD700; color: #000; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="summary">
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            ${summaryData}
            ${startDate ? `<p><strong>From:</strong> ${startDate}</p>` : ''}
            ${endDate ? `<p><strong>To:</strong> ${endDate}</p>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                ${tableHeaders}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="footer">
            <p>Generated from Soriano Store Sales Monitor</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Reset to first page when filters or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, startDate, endDate, activeTab]);

  // Keyboard shortcuts for Sales Monitor
  const salesShortcuts = [
    { key: "p", ctrl: true, handler: () => handlePrint(), description: "Print report" },
    { key: "1", alt: true, handler: () => setActiveTab("orders"), description: "Switch to Orders tab" },
    { key: "2", alt: true, handler: () => setActiveTab("transactions"), description: "Switch to Transactions tab" },
    { key: "Escape", handler: () => { if (showVoidModal) { setShowVoidModal(false); setVoidTarget(null); setVoidReason(""); } }, description: "Close void modal" },
  ];

  useKeyboardShortcuts(salesShortcuts, true);

  const salesShortcutsList = [
    { keys: "Ctrl + P", description: "Print report" },
    { keys: "Alt + 1", description: "Switch to Orders tab" },
    { keys: "Alt + 2", description: "Switch to Transactions tab" },
    { keys: "Escape", description: "Close modal" },
    { keys: "F1", description: "Toggle shortcuts help" },
  ];

  return (
    <div className="min-h-screen p-6 md:p-8 bg-white text-gray-900">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-yellow-400 mb-2">
          Sales Monitor
        </h2>
        <p className="text-gray-600 text-sm">Track sales transactions and revenue</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[
          { id: "orders", label: "Orders", icon: <FaShoppingCart /> },
          { id: "transactions", label: "Transactions", icon: <FaReceipt /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-semibold ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-400/30"
                : "bg-white text-gray-600 hover:bg-gray-50 hover:text-yellow-400 border border-gray-200 hover:border-yellow-400/20"
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      {activeTab === "orders" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <div className="bg-white border-2 border-yellow-400 rounded-2xl p-6 hover:shadow-lg hover:shadow-yellow-400/20 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                <FaShoppingCart className="text-2xl" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1 uppercase tracking-wide">Total Orders</h3>
            <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
          </div>
          <div className="bg-white border-2 border-yellow-400 rounded-2xl p-6 hover:shadow-lg hover:shadow-yellow-400/20 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
                <FaMoneyBillWave className="text-2xl" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1 uppercase tracking-wide">Total Sales</h3>
            <p className="text-2xl font-bold text-gray-900">₱{totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white border-2 border-yellow-400 rounded-2xl p-6 hover:shadow-lg hover:shadow-yellow-400/20 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                <FaReceipt className="text-2xl" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1 uppercase tracking-wide">Total Transactions</h3>
            <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
          </div>
          <div className="bg-white border-2 border-yellow-400 rounded-2xl p-6 hover:shadow-lg hover:shadow-yellow-400/20 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
                <FaMoneyBillWave className="text-2xl" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1 uppercase tracking-wide">Active Sales</h3>
            <p className="text-2xl font-bold text-gray-900">₱{totalTransactionSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white border-2 border-yellow-400 rounded-2xl p-6 hover:shadow-lg hover:shadow-yellow-400/20 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
                <FaBan className="text-2xl" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm mb-1 uppercase tracking-wide">Voided</h3>
            <p className="text-2xl font-bold text-gray-900">{voidedTransactions}</p>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={activeTab === "orders" 
              ? "Search by customer or reference..." 
              : "Search by order ID or staff..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-gray-700 pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400/50 placeholder-gray-500 text-sm"
          />
        </div>

        {/* Date Filters */}
        <div className="flex gap-2">
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-700 pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400/50 text-sm"
              placeholder="Start Date"
            />
          </div>
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-700 pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400/50 text-sm"
              placeholder="End Date"
            />
          </div>
        </div>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2.5 rounded-xl transition-all duration-200 whitespace-nowrap font-medium text-sm shadow-lg shadow-yellow-400/20"
        >
          <FaPrint /> Print Report
        </button>
      </div>

      {/* Orders Table */}
      {activeTab === "orders" && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr className="text-gray-600 text-sm font-medium">
                  <th className="py-3 px-4 text-left">Order ID</th>
                  <th className="py-3 px-4 text-left">Customer</th>
                  <th className="py-3 px-4 text-left">Items</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600">Loading orders...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-600 italic text-sm">
                      {filteredOrders.length === 0 && orders.length > 0
                        ? `No orders found matching "${searchQuery}"`
                        : "No orders available"}
                    </td>
                  </tr>
                ) : (
                  currentItems.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition text-sm"
                    >
                      <td className="py-3 px-4 text-yellow-500 font-bold">#{order.id}</td>
                      <td className="py-3 px-4 text-gray-900">{order.customer_name || 'Walk-in'}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          {order.items?.map((item, idx) => (
                            <span key={idx} className="text-gray-700">
                              {item.product?.name} <span className="text-gray-500">(×{item.quantity})</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-yellow-400 font-bold">
                        ₱{parseFloat(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                          order.payment_status === 'paid' 
                            ? 'bg-green-500/20 text-green-400 border-green-400/40' 
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-400/40'
                        } uppercase`}>
                          {order.payment_status || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-sm text-gray-700">{new Date(order.created_at).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      {activeTab === "transactions" && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr className="text-gray-600 text-sm font-medium">
                  <th className="py-3 px-4 text-left">Order ID</th>
                  <th className="py-3 px-4 text-left">Staff</th>
                  <th className="py-3 px-4 text-left">Items</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Discount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Date</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600">Loading transactions...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-600 italic text-sm">
                      {filteredTransactions.length === 0 && transactions.length > 0
                        ? `No transactions found matching "${searchQuery}"`
                        : "No transactions available"}
                    </td>
                  </tr>
                ) : (
                  currentItems.map((txn) => (
                    <tr
                      key={txn.id}
                      className={`border-b border-gray-200 transition text-sm ${
                        txn.is_voided
                          ? "bg-red-50/50 opacity-70"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className={`py-3 px-4 font-bold ${txn.is_voided ? 'line-through text-gray-400' : 'text-yellow-500'}`}>
                        #{txn.order?.id || txn.id}
                      </td>
                      <td className={`py-3 px-4 ${txn.is_voided ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {txn.user?.name || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className={`flex flex-col gap-1 ${txn.is_voided ? 'line-through text-gray-400' : ''}`}>
                          {txn.items?.map((item, idx) => (
                            <span key={idx} className="text-gray-700">
                              {item.product?.name || 'Deleted Product'} <span className="text-gray-500">(×{item.quantity})</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${txn.is_voided ? 'line-through text-gray-400' : 'text-yellow-400'}`}>
                        ₱{parseFloat(txn.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {txn.discount && parseFloat(txn.discount) > 0 ? (
                          <span className="text-orange-400 font-semibold">
                            -₱{parseFloat(txn.discount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {txn.is_voided ? (
                          <div>
                            <span className="px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-400/40 uppercase">
                              VOIDED
                            </span>
                            {txn.void_reason && (
                              <p className="text-xs text-gray-400 mt-1 max-w-[120px] truncate" title={txn.void_reason}>
                                {txn.void_reason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500/20 text-green-400 border border-green-400/40 uppercase">
                            COMPLETED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-sm text-gray-700">{new Date(txn.created_at).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(txn.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {!txn.is_voided ? (
                          <button
                            onClick={() => {
                              setVoidTarget(txn);
                              setVoidReason("");
                              setShowVoidModal(true);
                            }}
                            className="flex items-center gap-1 mx-auto px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                            title="Void Transaction"
                          >
                            <FaBan className="text-[10px]" /> Void
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            {txn.voided_at && new Date(txn.voided_at).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && currentData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={currentData.length}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* Void Confirmation Modal */}
      {showVoidModal && voidTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-yellow-400/30 rounded-2xl shadow-2xl shadow-yellow-400/10 p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-red-500/10">
                <FaBan className="text-2xl text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Void Transaction</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-700 text-sm font-semibold block mb-1">Order ID</label>
                <p className="text-gray-900 text-sm font-medium">#{voidTarget.order?.id || voidTarget.id}</p>
              </div>

              <div>
                <label className="text-gray-700 text-sm font-semibold block mb-1">Total Amount</label>
                <p className="text-yellow-400 text-sm font-bold">
                  ₱{parseFloat(voidTarget.total || voidTarget.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <label className="text-gray-700 text-sm font-semibold block mb-1">Items</label>
                <p className="text-gray-900 text-sm font-medium">{voidTarget.items?.length || 0} item(s)</p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
                <p className="text-yellow-700 text-sm font-medium">
                  <strong>Note:</strong> Voiding will restore all item quantities back to inventory.
                </p>
              </div>

              <div>
                <label className="text-gray-700 text-sm font-semibold mb-2 block">
                  Reason for voiding <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Enter reason for voiding this transaction..."
                  rows="3"
                  className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-lg focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 placeholder-gray-500 resize-none text-sm transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowVoidModal(false);
                  setVoidTarget(null);
                  setVoidReason("");
                }}
                disabled={voidProcessing}
                className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleVoidTransaction}
                disabled={!voidReason.trim() || voidProcessing}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 hover:shadow-red-500/20 px-4 py-2.5 rounded-lg transition-all duration-200 font-semibold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {voidProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                    Voiding...
                  </>
                ) : (
                  <>
                    <FaBan className="text-xs" /> Void Transaction
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <KeyboardShortcutsHelp shortcuts={salesShortcutsList} />
    </div>
  );
}
