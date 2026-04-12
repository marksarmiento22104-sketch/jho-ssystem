import { useState, useEffect, useCallback } from "react";
import { FaTimes, FaArrowUp, FaArrowDown, FaExchangeAlt, FaUndo, FaExclamationTriangle, FaChartLine, FaHistory, FaBoxOpen, FaFilter, FaPlus, FaMinus } from "react-icons/fa";
import axios from "../utils/axios";
import { toast } from "./Toast";

export default function ProductInventoryModal({ product, isOpen, onClose, onStockUpdated }) {
  const [activeTab, setActiveTab] = useState("inventory");
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [priceInfo, setPriceInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");

  // Stock adjustment state
  const [adjustmentQty, setAdjustmentQty] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("add");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  const fetchInventoryLogs = useCallback(async () => {
    if (!product) return;
    try {
      setLoading(true);
      const params = typeFilter ? `?type=${typeFilter}&per_page=100` : "?per_page=100";
      const response = await axios.get(`/api/products/${product.id}/inventory-logs${params}`);
      setInventoryLogs(response.data.logs?.data || []);
      setSummary(response.data.summary || null);
    } catch (err) {
      console.error("Error fetching inventory logs:", err);
    } finally {
      setLoading(false);
    }
  }, [product, typeFilter]);

  const fetchPriceHistory = useCallback(async () => {
    if (!product) return;
    try {
      const response = await axios.get(`/api/products/${product.id}/price-history?per_page=100`);
      setPriceHistory(response.data.histories?.data || []);
      setPriceInfo({
        current_price: response.data.current_price,
        overall_inflation: response.data.overall_inflation,
        total_changes: response.data.total_changes,
      });
    } catch (err) {
      console.error("Error fetching price history:", err);
    }
  }, [product]);

  const handleStockAdjustment = async () => {
    const qty = parseInt(adjustmentQty);
    if (!qty || qty <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    if (!adjustmentReason.trim()) {
      toast.error("Please provide a reason for the adjustment");
      return;
    }

    const newStock = adjustmentType === "add"
      ? product.stock + qty
      : Math.max(0, product.stock - qty);

    try {
      setAdjusting(true);
      await axios.put(`/api/products/${product.id}/stock`, {
        stock: newStock,
        reason: adjustmentReason.trim(),
      });
      toast.success(`Stock ${adjustmentType === "add" ? "increased" : "decreased"} by ${qty}`);
      setAdjustmentQty("");
      setAdjustmentReason("");
      // Update product stock locally
      product.stock = newStock;
      // Refresh logs
      fetchInventoryLogs();
      if (onStockUpdated) onStockUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to adjust stock");
    } finally {
      setAdjusting(false);
    }
  };

  useEffect(() => {
    if (isOpen && product) {
      fetchInventoryLogs();
      fetchPriceHistory();
    }
  }, [isOpen, product, fetchInventoryLogs, fetchPriceHistory]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const getTypeIcon = (type) => {
    switch (type) {
      case "in": return <FaArrowUp className="text-green-500" />;
      case "out": return <FaArrowDown className="text-red-500" />;
      case "adjustment": return <FaExchangeAlt className="text-blue-500" />;
      case "void_return": return <FaUndo className="text-purple-500" />;
      case "damage": return <FaExclamationTriangle className="text-orange-500" />;
      default: return <FaBoxOpen className="text-gray-500" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "in": return "Stock In";
      case "out": return "Stock Out (Sale)";
      case "adjustment": return "Adjustment";
      case "void_return": return "Void Return";
      case "damage": return "Damaged/Lost";
      default: return type;
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "in": return "bg-green-100 text-green-700 border-green-300";
      case "out": return "bg-red-100 text-red-700 border-red-300";
      case "adjustment": return "bg-blue-100 text-blue-700 border-blue-300";
      case "void_return": return "bg-purple-100 text-purple-700 border-purple-300";
      case "damage": return "bg-orange-100 text-orange-700 border-orange-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              SKU: {product.sku || "N/A"} • Current Stock: <span className="font-bold text-yellow-600">{product.stock}</span> • Price: <span className="font-bold text-green-600">₱{parseFloat(product.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl transition-colors p-2" title="Close (Esc)">
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "inventory" ? "border-yellow-400 text-yellow-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FaHistory /> Inventory History
          </button>
          <button
            onClick={() => setActiveTab("price")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "price" ? "border-yellow-400 text-yellow-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FaChartLine /> Price History & Inflation
          </button>
          <button
            onClick={() => setActiveTab("adjust")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "adjust" ? "border-yellow-400 text-yellow-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FaExchangeAlt /> Adjust Stock
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "inventory" && (
            <div>
              {/* Summary Cards */}
              {summary && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                    <p className="text-xs text-green-600 font-medium">Total In</p>
                    <p className="text-xl font-bold text-green-700">+{summary.total_in || 0}</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                    <p className="text-xs text-red-600 font-medium">Total Out</p>
                    <p className="text-xl font-bold text-red-700">{summary.total_out || 0}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                    <p className="text-xs text-purple-600 font-medium">Void Returns</p>
                    <p className="text-xl font-bold text-purple-700">+{summary.total_void_returns || 0}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                    <p className="text-xs text-blue-600 font-medium">Adjustments</p>
                    <p className="text-xl font-bold text-blue-700">{summary.total_adjustments || 0}</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
                    <p className="text-xs text-yellow-600 font-medium">Current Stock</p>
                    <p className="text-xl font-bold text-yellow-700">{summary.current_stock}</p>
                  </div>
                </div>
              )}

              {/* Filter */}
              <div className="flex items-center gap-2 mb-4">
                <FaFilter className="text-gray-400 text-sm" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-700 text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-yellow-400"
                >
                  <option value="">All Types</option>
                  <option value="in">Stock In</option>
                  <option value="out">Stock Out (Sale)</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="void_return">Void Return</option>
                  <option value="damage">Damaged/Lost</option>
                </select>
              </div>

              {/* Inventory Log Table */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-400 mx-auto"></div>
                  <p className="text-gray-500 mt-3 text-sm">Loading inventory history...</p>
                </div>
              ) : inventoryLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FaBoxOpen className="mx-auto text-4xl mb-3 text-gray-300" />
                  <p className="text-sm">No inventory movements recorded yet.</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr className="text-gray-600 text-xs font-medium uppercase">
                        <th className="py-3 px-4 text-left">Date</th>
                        <th className="py-3 px-4 text-left">Type</th>
                        <th className="py-3 px-4 text-center">Qty Change</th>
                        <th className="py-3 px-4 text-center">Before</th>
                        <th className="py-3 px-4 text-center">After</th>
                        <th className="py-3 px-4 text-left">Notes</th>
                        <th className="py-3 px-4 text-left">By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryLogs.map((log) => (
                        <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                          <td className="py-3 px-4 text-gray-700">
                            <div>{new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                            <div className="text-xs text-gray-400">{new Date(log.created_at).toLocaleTimeString()}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border ${getTypeBadgeColor(log.type)}`}>
                              {getTypeIcon(log.type)} {getTypeLabel(log.type)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold">
                            <span className={log.quantity_change > 0 ? "text-green-600" : log.quantity_change < 0 ? "text-red-600" : "text-gray-600"}>
                              {log.quantity_change > 0 ? "+" : ""}{log.quantity_change}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-gray-500">{log.quantity_before}</td>
                          <td className="py-3 px-4 text-center font-semibold text-gray-800">{log.quantity_after}</td>
                          <td className="py-3 px-4 text-gray-600 max-w-[200px]">
                            <div className="truncate" title={log.notes}>
                              {log.notes || "-"}
                              {log.reference_type === "SalesTransaction" && log.notes?.includes("VOID") && (
                                <span className="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-600 text-[10px] font-bold rounded">VOID</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-500 text-xs">{log.user?.name || "System"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "price" && (
            <div>
              {/* Price Summary */}
              {priceInfo && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-green-600 font-medium">Current Price</p>
                    <p className="text-2xl font-bold text-green-700">₱{parseFloat(priceInfo.current_price).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className={`border rounded-xl p-4 text-center ${
                    priceInfo.overall_inflation > 0 ? "bg-red-50 border-red-200" : priceInfo.overall_inflation < 0 ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                  }`}>
                    <p className={`text-xs font-medium ${priceInfo.overall_inflation > 0 ? "text-red-600" : priceInfo.overall_inflation < 0 ? "text-green-600" : "text-gray-600"}`}>
                      Overall Inflation Rate
                    </p>
                    <p className={`text-2xl font-bold ${priceInfo.overall_inflation > 0 ? "text-red-700" : priceInfo.overall_inflation < 0 ? "text-green-700" : "text-gray-700"}`}>
                      {priceInfo.overall_inflation > 0 ? "+" : ""}{priceInfo.overall_inflation}%
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-blue-600 font-medium">Total Price Changes</p>
                    <p className="text-2xl font-bold text-blue-700">{priceInfo.total_changes}</p>
                  </div>
                </div>
              )}

              {/* Price History Table */}
              {priceHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FaChartLine className="mx-auto text-4xl mb-3 text-gray-300" />
                  <p className="text-sm">No price changes recorded yet.</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr className="text-gray-600 text-xs font-medium uppercase">
                        <th className="py-3 px-4 text-left">Date</th>
                        <th className="py-3 px-4 text-right">Old Price</th>
                        <th className="py-3 px-4 text-right">New Price</th>
                        <th className="py-3 px-4 text-center">Change</th>
                        <th className="py-3 px-4 text-center">Inflation Rate</th>
                        <th className="py-3 px-4 text-left">Reason</th>
                        <th className="py-3 px-4 text-left">Changed By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {priceHistory.map((entry) => {
                        const priceChange = parseFloat(entry.new_price) - parseFloat(entry.old_price);
                        return (
                          <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="py-3 px-4 text-gray-700">
                              <div>{new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                              <div className="text-xs text-gray-400">{new Date(entry.created_at).toLocaleTimeString()}</div>
                            </td>
                            <td className="py-3 px-4 text-right text-gray-500">₱{parseFloat(entry.old_price).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                            <td className="py-3 px-4 text-right font-semibold text-gray-800">₱{parseFloat(entry.new_price).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                            <td className="py-3 px-4 text-center font-bold">
                              <span className={priceChange > 0 ? "text-red-600" : priceChange < 0 ? "text-green-600" : "text-gray-600"}>
                                {priceChange > 0 ? "+" : ""}₱{priceChange.toFixed(2)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                parseFloat(entry.inflation_rate) > 0 ? "bg-red-100 text-red-700" : parseFloat(entry.inflation_rate) < 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                              }`}>
                                {parseFloat(entry.inflation_rate) > 0 ? "↑" : parseFloat(entry.inflation_rate) < 0 ? "↓" : ""}
                                {Math.abs(parseFloat(entry.inflation_rate)).toFixed(2)}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600 max-w-[150px] truncate" title={entry.reason}>{entry.reason || "-"}</td>
                            <td className="py-3 px-4 text-gray-500 text-xs">{entry.changed_by_user?.name || "System"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "adjust" && (
            <div className="max-w-lg mx-auto">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-center">
                <p className="text-xs text-yellow-700 font-medium mb-1">Current Stock</p>
                <p className="text-4xl font-bold text-yellow-600">{product.stock}</p>
              </div>

              {/* Adjustment Type */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setAdjustmentType("add")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                    adjustmentType === "add"
                      ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaPlus className="text-xs" /> Add Stock
                </button>
                <button
                  onClick={() => setAdjustmentType("remove")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                    adjustmentType === "remove"
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaMinus className="text-xs" /> Remove Stock
                </button>
              </div>

              {/* Quantity */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(e.target.value)}
                  placeholder="Enter quantity..."
                  min="1"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400"
                />
              </div>

              {/* Preview */}
              {adjustmentQty && parseInt(adjustmentQty) > 0 && (
                <div className={`rounded-xl p-3 mb-4 text-center text-sm font-medium ${
                  adjustmentType === "add" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
                }`}>
                  {product.stock} {adjustmentType === "add" ? "+" : "−"} {adjustmentQty} = <span className="font-bold text-lg">{
                    adjustmentType === "add"
                      ? product.stock + parseInt(adjustmentQty)
                      : Math.max(0, product.stock - parseInt(adjustmentQty))
                  }</span>
                </div>
              )}

              {/* Reason */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <textarea
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="e.g., Physical count correction, New delivery received..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 resize-none"
                  rows={3}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleStockAdjustment}
                disabled={!adjustmentQty || parseInt(adjustmentQty) <= 0 || !adjustmentReason.trim() || adjusting}
                className={`w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  adjustmentType === "add"
                    ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20"
                    : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
                }`}
              >
                <FaExchangeAlt className="text-xs" />
                {adjusting ? "Adjusting..." : `${adjustmentType === "add" ? "Add" : "Remove"} ${adjustmentQty || 0} units`}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end items-center bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-400">
            Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono text-[10px]">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
