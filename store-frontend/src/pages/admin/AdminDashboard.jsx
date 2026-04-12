import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
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
  BarChart,
  Bar,
} from "recharts";
import {
  FaChartLine,
  FaUsers,
  FaClipboardList,
  FaListUl,
  FaMoneyBillWave,
  FaTrophy,
  FaExclamationTriangle,
  FaBoxes,
  FaCalendarAlt,
  FaSyncAlt,
} from "react-icons/fa";
import axios from "../../utils/axios";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState("daily");
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const [dashboardData, setDashboardData] = useState({
    summary: {
      todays_sales: "0.00",
      transactions: 0,
      profit: "0.00",
      active_staff: 0,
    },
    sales_trend: [],
    product_breakdown: [],
    top_products: [],
    inventory_status: [],
    recent_transactions: [],
  });

  const [salesReport, setSalesReport] = useState(null);
  const [topSelling, setTopSelling] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [revenueExpense, setRevenueExpense] = useState(null);

  const COLORS = ["#FFD700", "#FFC107", "#FFECB3", "#FFF8E1"];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Dashboard data received:", response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (activeTab === "sales") {
        const res = await axios.get(
          `/api/reports/sales?period=${period}&start_date=${dateRange.start}&end_date=${dateRange.end}`,
          config
        );
        setSalesReport(res.data);
      } else if (activeTab === "low-stock") {
        const res = await axios.get(
          "/api/reports/low-stock",
          config
        );
        setLowStock(res.data);
      } else if (activeTab === "inventory") {
        const res = await axios.get(
          "/api/reports/inventory",
          config
        );
        setInventoryReport(res.data);
      } else if (activeTab === "revenue") {
        const res = await axios.get(
          `/api/reports/revenue-expense?period=${period}&start_date=${dateRange.start}&end_date=${dateRange.end}`,
          config
        );
        setRevenueExpense(res.data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load report data");
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh dashboard data every 30 seconds
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (activeTab !== "overview") {
      fetchReports();
    }
  }, [activeTab, period, dateRange]);

  const handleRefresh = () => {
    if (activeTab === "overview") {
      fetchDashboardData();
      toast.success("Dashboard refreshed");
    } else {
      fetchReports();
      toast.success("Report refreshed");
    }
  };

  // Hide vertical scrollbar for dashboard
  // Tailwind: scrollbar-hide (if plugin), or fallback to custom CSS
  // Add class to root div
  return (
    <div className="min-h-screen p-6 md:p-8 bg-white text-gray-900 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overflowY: 'scroll' }}>
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-yellow-400 mb-2">
            Dashboard
          </h2>
          <p className="text-gray-600 text-sm">Welcome back! Here's what's happening today.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-white border border-gray-200 hover:border-yellow-400/50 text-gray-600 hover:text-yellow-400 rounded-lg transition-all flex items-center gap-2 text-sm"
        >
          <FaSyncAlt className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Tabs - Cleaner Design */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[
          { id: "overview", label: "Overview", icon: <FaChartLine /> },
          { id: "sales", label: "Sales", icon: <FaMoneyBillWave /> },
          { id: "low-stock", label: "Low Stock", icon: <FaExclamationTriangle /> },
          { id: "inventory", label: "Inventory", icon: <FaBoxes /> },
          { id: "revenue", label: "Revenue", icon: <FaCalendarAlt /> },
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

      {loading && activeTab === "overview" ? (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-700">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              {/* Stats Cards - Cleaner Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                  { title: "Today's Sales", icon: <FaMoneyBillWave />, value: `₱${dashboardData.summary.todays_sales}`, color: "blue" },
                  { title: "Transactions", icon: <FaClipboardList />, value: dashboardData.summary.transactions, color: "green" },
                  { title: "Profit", icon: <FaChartLine />, value: `₱${dashboardData.summary.profit}`, color: "yellow" },
                  { title: "Active Staff", icon: <FaUsers />, value: dashboardData.summary.active_staff, color: "purple" },
                ].map((card, i) => (
                  <div key={i} className="bg-white border-2 border-yellow-400 rounded-2xl p-6 hover:shadow-lg hover:shadow-yellow-400/20 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-${card.color}-500/10 text-${card.color}-400`}>
                        <span className="text-2xl">{card.icon}</span>
                      </div>
                    </div>
                    <h3 className="text-gray-600 text-sm mb-1 uppercase tracking-wide">{card.title}</h3>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                ))}
              </div>

              {/* Sales Trend Chart - More Space */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales Trend</h3>
                {dashboardData.sales_trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData.sales_trend}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#FFD700" stopOpacity={0.1}/>
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                        <filter id="shadow">
                          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#FFD700" floodOpacity="0.8"/>
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #FFD700',
                          borderRadius: '8px',
                          color: '#FFD700',
                          boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                        }}
                        labelStyle={{ color: '#FFF', fontWeight: 'bold', marginBottom: '4px' }}
                        itemStyle={{ color: '#FFD700', fontWeight: '600' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#FFD700" 
                        strokeWidth={4}
                        fill="url(#colorSales)"
                        filter="url(#shadow)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#FFD700" 
                        strokeWidth={4} 
                        dot={{ r: 6, fill: "#FFD700", strokeWidth: 2, stroke: "#FFF", filter: "url(#glow)" }}
                        activeDot={{ r: 8, fill: "#FFD700", strokeWidth: 2, stroke: "#FFF", filter: "url(#shadow)" }}
                        filter="url(#shadow)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-600">No sales data available</div>
                )}
              </div>

              {/* Charts Row - Better Spacing */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Product Breakdown */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Product Breakdown</h3>
                  {dashboardData.product_breakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie 
                          data={dashboardData.product_breakdown} 
                          dataKey="value" 
                          nameKey="name" 
                          cx="50%" 
                          cy="50%" 
                          outerRadius={80} 
                          label
                        >
                          {dashboardData.product_breakdown.map((entry, index) => (
                            <Cell key={'cell-' + index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-600">No product data</div>
                  )}
                </div>

                {/* Top Products */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Products</h3>
                  {dashboardData.top_products.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={dashboardData.top_products}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }} 
                        />
                        <Bar dataKey="sales" fill="#FFD700" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-600">No sales data</div>
                  )}
                </div>
              </div>

              {/* Recent Transactions - Cleaner Table */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-6 pb-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <FaListUl className="text-yellow-400" />
                    Recent Transactions
                  </h3>
                </div>
                {dashboardData.recent_transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr className="text-gray-600 text-sm font-medium">
                          <th className="py-3 px-4 text-left">Order ID</th>
                          <th className="py-3 px-4 text-left">Customer</th>
                          <th className="py-3 px-4 text-center">Items</th>
                          <th className="py-3 px-4 text-right">Total</th>
                          <th className="py-3 px-4 text-center">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.recent_transactions.map((t) => (
                          <tr key={t.id} className="border-b border-gray-200 hover:bg-gray-50 transition text-sm">
                            <td className="py-3 px-4 text-yellow-500 font-bold">#{t.id}</td>
                            <td className="py-3 px-4 text-gray-900">{t.customer || 'Walk-in'}</td>
                            <td className="py-3 px-4 text-center text-gray-700">{t.items_count}</td>
                            <td className="py-3 px-4 text-right text-yellow-400 font-bold">₱{parseFloat(t.total || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td className="py-3 px-4 text-center">
                              <div className="text-sm text-gray-700">{t.date}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-gray-600">No recent transactions</div>
                )}
              </div>
            </>
          )}

          {/* Sales Report Tab */}
          {activeTab === "sales" && salesReport && (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-6">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:border-yellow-400/50 text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-yellow-400/50 text-sm"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-yellow-400/50 text-sm"
                />
              </div>

              {/* Key Metrics - Only show non-duplicate info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                {[
                  { title: "Average Sale", value: `₱${parseFloat(salesReport.average_sale || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: <FaChartLine />, color: "yellow" },
                  { title: "Total Discount", value: `₱${parseFloat(salesReport.total_discount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: <FaMoneyBillWave />, color: "red" },
                  { title: "Total Tax", value: `₱${parseFloat(salesReport.total_tax || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: <FaListUl />, color: "blue" },
                ].map((card, i) => (
                  <div key={i} className="bg-white border-2 border-yellow-400 rounded-2xl p-6 hover:shadow-lg hover:shadow-yellow-400/20 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-${card.color}-500/10 text-${card.color}-400`}>
                        <span className="text-2xl">{card.icon}</span>
                      </div>
                    </div>
                    <h3 className="text-gray-700 text-sm mb-1">{card.title}</h3>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                ))}
              </div>

              {/* Sales Trend Chart */}
              {salesReport.sales_trend && salesReport.sales_trend.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales Trend - {period.charAt(0).toUpperCase() + period.slice(1)}</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={salesReport.sales_trend}>
                      <defs>
                        <linearGradient id="salesAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#FFD700" stopOpacity={0.1}/>
                        </linearGradient>
                        <filter id="salesGlow">
                          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                        <filter id="salesShadow">
                          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#FFD700" floodOpacity="0.8"/>
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #FFD700',
                          borderRadius: '8px',
                          color: '#FFD700',
                          boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                        }}
                        labelStyle={{ color: '#FFF', fontWeight: 'bold', marginBottom: '4px' }}
                        itemStyle={{ color: '#FFD700', fontWeight: '600' }}
                        formatter={(value) => [`₱${parseFloat(value).toLocaleString()}`, 'Sales']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#FFD700" 
                        strokeWidth={3}
                        fill="url(#salesAreaGradient)"
                        filter="url(#salesShadow)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#FFD700" 
                        strokeWidth={3} 
                        dot={{ r: 5, fill: "#FFD700", strokeWidth: 2, stroke: "#FFF" }}
                        activeDot={{ r: 7, fill: "#FFD700", strokeWidth: 2, stroke: "#FFF", filter: "url(#salesShadow)" }}
                        filter="url(#salesShadow)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Detailed Transaction List */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-6 pb-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Transactions</h3>
                </div>
                {salesReport.recent_transactions && salesReport.recent_transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr className="text-gray-600 text-sm font-medium">
                          <th className="py-3 px-4 text-left">Order ID</th>
                          <th className="py-3 px-4 text-left">Customer</th>
                          <th className="py-3 px-4 text-left">Items</th>
                          <th className="py-3 px-4 text-right">Discount</th>
                          <th className="py-3 px-4 text-right">Total</th>
                          <th className="py-3 px-4 text-center">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesReport.recent_transactions.map((t) => (
                          <tr key={t.id} className="border-b border-gray-200 hover:bg-gray-50 transition text-sm">
                            <td className="py-3 px-4 text-yellow-500 font-bold">#{t.order_id || t.id}</td>
                            <td className="py-3 px-4 text-gray-900">{t.customer_name || 'Walk-in'}</td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-1">
                                {t.items?.map((item, idx) => (
                                  <span key={idx} className="text-gray-700">
                                    {item.product_name} <span className="text-gray-500">(×{item.quantity})</span>
                                  </span>
                                )) || <span className="text-gray-400">-</span>}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {t.discount && parseFloat(t.discount) > 0 ? (
                                <span className="text-orange-400 font-semibold">
                                  -₱{parseFloat(t.discount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right text-yellow-400 font-bold">₱{parseFloat(t.total || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td className="py-3 px-4 text-center">
                              <div className="text-sm text-gray-700">{new Date(t.created_at).toLocaleDateString()}</div>
                              <div className="text-xs text-gray-500">{new Date(t.created_at).toLocaleTimeString()}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-gray-600">No transactions found</div>
                )}
              </div>
            </>
          )}

          {/* Low Stock Tab */}
          {activeTab === "low-stock" && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <FaExclamationTriangle className="text-red-400" /> Low Stock Alert
              </h3>
              {lowStock.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="py-3 px-4 text-left text-gray-600 font-semibold text-xs uppercase tracking-wider">Product</th>
                        <th className="py-3 px-4 text-left text-gray-600 font-semibold text-xs uppercase tracking-wider">Category</th>
                        <th className="py-3 px-4 text-right text-gray-600 font-semibold text-xs uppercase tracking-wider">Stock</th>
                        <th className="py-3 px-4 text-right text-gray-600 font-semibold text-xs uppercase tracking-wider">Reorder At</th>
                        <th className="py-3 px-4 text-center text-gray-600 font-semibold text-xs uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStock.map((product) => (
                        <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-700/30 transition">
                          <td className="py-3 px-4 text-gray-700 font-medium">{product.name}</td>
                          <td className="py-3 px-4 text-gray-700">{product.category?.name || "N/A"}</td>
                          <td className="py-3 px-4 text-right text-gray-700">{product.stock_quantity}</td>
                          <td className="py-3 px-4 text-right text-gray-700">{product.reorder_point}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                              product.stock_quantity === 0
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}>
                              {product.stock_quantity === 0 ? "Out of Stock" : "Low Stock"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-600 font-medium">All products well stocked</div>
              )}
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === "inventory" && inventoryReport && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { title: "Total Products", value: inventoryReport.total_products || 0, icon: <FaBoxes />, color: "blue" },
                { title: "Stock Value", value: `₱${inventoryReport.total_stock_value || 0}`, icon: <FaMoneyBillWave />, color: "green" },
                { title: "Low Stock", value: inventoryReport.low_stock_count || 0, icon: <FaExclamationTriangle />, color: "yellow" },
                { title: "Out of Stock", value: inventoryReport.out_of_stock_count || 0, icon: <FaExclamationTriangle />, color: "red" },
              ].map((card, i) => (
                <div key={i} className="bg-white border-2 border-yellow-400 rounded-2xl p-6 hover:shadow-lg hover:shadow-yellow-400/20 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-${card.color}-500/10 text-${card.color}-400`}>
                      <span className="text-2xl">{card.icon}</span>
                    </div>
                  </div>
                  <h3 className="text-gray-700 text-sm mb-1">{card.title}</h3>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Revenue & Expense Tab */}
          {activeTab === "revenue" && revenueExpense && (
            <>
              <div className="flex flex-wrap gap-3 mb-6">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-yellow-400/50 text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-yellow-400/50 text-sm"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-yellow-400/50 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                  { title: "Total Revenue", value: `₱${parseFloat(revenueExpense.total_revenue || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: <FaMoneyBillWave />, color: "green" },
                  { title: "Gross Revenue", value: `₱${parseFloat(revenueExpense.gross_revenue || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: <FaChartLine />, color: "blue" },
                  { title: "Total Discounts", value: `₱${parseFloat(revenueExpense.total_discount_given || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: <FaMoneyBillWave />, color: "red" },
                  { title: "Tax Collected", value: `₱${parseFloat(revenueExpense.total_tax_collected || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: <FaListUl />, color: "yellow" },
                ].map((card, i) => (
                  <div key={i} className="bg-white border-2 border-yellow-400 rounded-2xl p-6 hover:shadow-lg hover:shadow-yellow-400/20 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-${card.color}-500/10 text-${card.color}-400`}>
                        <span className="text-2xl">{card.icon}</span>
                      </div>
                    </div>
                    <h3 className="text-gray-700 text-sm mb-1">{card.title}</h3>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                ))}
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-white border-2 border-yellow-400 rounded-2xl p-6 hover:shadow-lg hover:shadow-yellow-400/20 transition-all">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <FaClipboardList className="text-yellow-400" />
                    Transaction Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-700 text-sm">Total Transactions</span>
                      <span className="text-2xl font-bold text-gray-900">{revenueExpense.transaction_count || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 text-sm">Daily Average</span>
                      <span className="text-xl font-bold text-yellow-500">₱{parseFloat(revenueExpense.daily_average || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-yellow-400 rounded-2xl p-6 hover:shadow-lg hover:shadow-yellow-400/20 transition-all">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-700 text-sm">Net Revenue</span>
                      <span className="text-xl font-bold text-green-500">₱{parseFloat((revenueExpense.total_revenue || 0) - (revenueExpense.total_discount_given || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 text-sm">Discount Rate</span>
                      <span className="text-xl font-bold text-red-500">
                        {revenueExpense.gross_revenue > 0 
                          ? ((revenueExpense.total_discount_given / revenueExpense.gross_revenue) * 100).toFixed(1) 
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
