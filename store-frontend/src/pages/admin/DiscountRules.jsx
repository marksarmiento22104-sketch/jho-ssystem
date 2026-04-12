import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaPercent, FaDollarSign, FaShieldAlt, FaInfoCircle } from "react-icons/fa";
import axios from "../../utils/axios";
import { toast } from "../../components/Toast";

export default function DiscountRules() {
  const [rules, setRules] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "percentage",
    value: "",
    min_purchase: "",
    start_date: "",
    end_date: "",
    is_active: true,
    max_discount_amount: "",
    max_percentage: "",
    usage_limit: "",
    excluded_product_ids: [],
    requires_approval: false,
  });

  useEffect(() => {
    fetchRules();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/discount-rules');
      setRules(response.data);
    } catch (err) {
      toast.error('Failed to fetch discount rules');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.value) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editing) {
        await axios.put(`/api/discount-rules/${editing}`, formData);
        toast.success("Discount rule updated successfully!");
      } else {
        await axios.post('/api/discount-rules', formData);
        toast.success("Discount rule created successfully!");
      }

      resetForm();
      setShowModal(false);
      fetchRules();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save discount rule');
    }
  };

  const handleEdit = (rule) => {
    setEditing(rule.id);
    setFormData({
      name: rule.name,
      type: rule.type,
      value: rule.value,
      min_purchase: rule.min_purchase || "",
      start_date: rule.start_date || "",
      end_date: rule.end_date || "",
      is_active: rule.is_active,
      max_discount_amount: rule.max_discount_amount || "",
      max_percentage: rule.max_percentage || "",
      usage_limit: rule.usage_limit || "",
      excluded_product_ids: rule.excluded_product_ids || [],
      requires_approval: rule.requires_approval || false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this discount rule?")) return;

    try {
      await axios.delete(`/api/discount-rules/${id}`);
      toast.success("Discount rule deleted successfully!");
      fetchRules();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete discount rule');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const rule = rules.find(r => r.id === id);
      if (!rule) return;

      await axios.put(`/api/discount-rules/${id}`, {
        ...rule,
        is_active: !rule.is_active
      });
      
      toast.success(`Discount rule ${!rule.is_active ? 'activated' : 'deactivated'} successfully!`);
      fetchRules();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle discount rule');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "percentage",
      value: "",
      min_purchase: "",
      start_date: "",
      end_date: "",
      is_active: true,
      max_discount_amount: "",
      max_percentage: "",
      usage_limit: "",
      excluded_product_ids: [],
      requires_approval: false,
    });
    setEditing(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-yellow-200 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-yellow-300">Loading discount rules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 bg-white text-gray-900">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-yellow-400 mb-2">
            Discount Rules
          </h2>
          <p className="text-gray-700 text-sm">Configure pricing and discount rules</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm shadow-lg shadow-yellow-400/20"
        >
          <FaPlus /> Add Rule
        </button>
      </div>

      {/* Rules Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="border-b border-gray-200">
              <tr className="text-sm text-gray-600 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4 text-left font-semibold">Name</th>
                <th className="py-3 px-4 text-center font-semibold">Type</th>
                <th className="py-3 px-4 text-center font-semibold">Value</th>
                <th className="py-3 px-4 text-center font-semibold">Min Purchase</th>
                <th className="py-3 px-4 text-center font-semibold">Usage</th>
                <th className="py-3 px-4 text-center font-semibold">Restrictions</th>
                <th className="py-3 px-4 text-center font-semibold">Valid Period</th>
                <th className="py-3 px-4 text-center font-semibold">Status</th>
                <th className="py-3 px-4 text-center font-semibold w-32">Actions</th>
              </tr>
            </thead>
          <tbody>
            {rules.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-8 text-center text-gray-600 text-sm italic">
                  No discount rules found. Create one to get started.
                </td>
              </tr>
            ) : (
              rules.map((rule) => (
                <tr key={rule.id} className="border-b border-gray-200 hover:bg-yellow-50 transition-all">
                  <td className="py-3 px-4 font-semibold text-gray-900 text-sm">{rule.name}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs uppercase font-semibold ${
                      rule.type === 'percentage'
                        ? 'bg-blue-500/20 text-blue-600'
                        : 'bg-green-500/20 text-green-600'
                    }`}>
                      {rule.type === 'percentage' ? <FaPercent className="inline mr-1" /> : <FaDollarSign className="inline mr-1" />}
                      {rule.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-yellow-500 font-bold text-sm">
                    {rule.type === 'percentage' ? `${rule.value}%` : `₱${parseFloat(rule.value).toFixed(2)}`}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-900 text-sm">
                    {rule.min_purchase ? `₱${parseFloat(rule.min_purchase).toFixed(2)}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-center text-sm">
                    {rule.usage_limit ? (
                      <span className={`font-medium ${rule.usage_count >= rule.usage_limit ? 'text-red-500' : 'text-gray-700'}`}>
                        {rule.usage_count || 0}/{rule.usage_limit}
                      </span>
                    ) : (
                      <span className="text-gray-400">Unlimited</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {rule.max_discount_amount && (
                        <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-600 text-[10px] rounded font-medium">
                          Max ₱{parseFloat(rule.max_discount_amount).toFixed(0)}
                        </span>
                      )}
                      {rule.requires_approval && (
                        <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-600 text-[10px] rounded font-medium">
                          Approval
                        </span>
                      )}
                      {rule.excluded_product_ids?.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-red-500/10 text-red-600 text-[10px] rounded font-medium">
                          {rule.excluded_product_ids.length} excluded
                        </span>
                      )}
                      {!rule.max_discount_amount && !rule.requires_approval && (!rule.excluded_product_ids || rule.excluded_product_ids.length === 0) && (
                        <span className="text-gray-400 text-xs">None</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {rule.start_date || rule.end_date ? (
                      <div className="text-xs text-gray-700">
                        {rule.start_date && <div>{new Date(rule.start_date).toLocaleDateString()}</div>}
                        {rule.start_date && rule.end_date && <div>to</div>}
                        {rule.end_date && <div>{new Date(rule.end_date).toLocaleDateString()}</div>}
                      </div>
                    ) : (
                      <span className="text-gray-700 text-sm font-medium">Always</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleActive(rule.id)}
                      className="flex items-center justify-center mx-auto"
                    >
                      {rule.is_active ? (
                        <FaToggleOn className="text-green-500 text-2xl hover:text-green-600 transition-colors" />
                      ) : (
                        <FaToggleOff className="text-red-500 text-2xl hover:text-red-600 transition-colors" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="text-gray-600 hover:text-blue-500 transition-colors p-2 text-lg"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="text-gray-600 hover:text-red-500 transition-colors p-2 text-lg"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-yellow-400/30 rounded-2xl shadow-2xl shadow-yellow-400/10 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {editing ? 'Edit Discount Rule' : 'Add Discount Rule'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-700 text-sm font-medium mb-2 block">
                  Rule Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Summer Sale"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400/50 placeholder-gray-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-2 block">
                    Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                    className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400/50 text-sm"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₱)</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-700 text-sm font-medium mb-2 block">
                    Value <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder={formData.type === 'percentage' ? '10' : '100'}
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    required
                    step="0.01"
                    min="0"
                    className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400/50 placeholder-gray-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-700 text-sm font-medium mb-2 block">
                  Minimum Purchase (₱)
                </label>
                <input
                  type="number"
                  placeholder="Optional"
                  value={formData.min_purchase}
                  onChange={(e) => setFormData({...formData, min_purchase: e.target.value})}
                  step="0.01"
                  min="0"
                  className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400/50 placeholder-gray-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-2 block">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400/50 text-sm"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm font-medium mb-2 block">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400/50 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-gray-700 text-sm">
                  Active
                </label>
              </div>

              {/* Restrictions Section */}
              <div className="border-t border-gray-200 pt-4 mt-2">
                <h4 className="text-gray-900 font-semibold text-sm mb-3 flex items-center gap-2">
                  <FaShieldAlt className="text-yellow-500" /> Restrictions
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-700 text-sm font-medium mb-2 block">
                      Max Discount Amount (₱)
                    </label>
                    <input
                      type="number"
                      placeholder="No limit"
                      value={formData.max_discount_amount}
                      onChange={(e) => setFormData({...formData, max_discount_amount: e.target.value})}
                      step="0.01"
                      min="0"
                      className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400/50 placeholder-gray-500 text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">Caps the discount to this amount</p>
                  </div>

                  <div>
                    <label className="text-gray-700 text-sm font-medium mb-2 block">
                      Max Percentage (%)
                    </label>
                    <input
                      type="number"
                      placeholder="No limit"
                      value={formData.max_percentage}
                      onChange={(e) => setFormData({...formData, max_percentage: e.target.value})}
                      step="0.01"
                      min="0"
                      max="100"
                      className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400/50 placeholder-gray-500 text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">Maximum percentage cap</p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-gray-700 text-sm font-medium mb-2 block">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    placeholder="Unlimited"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                    min="1"
                    className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400/50 placeholder-gray-500 text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">How many times this discount can be used total</p>
                </div>

                <div className="mt-4">
                  <label className="text-gray-700 text-sm font-medium mb-2 block">
                    Excluded Products
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-xl p-3 space-y-2 bg-white">
                    {products.length === 0 ? (
                      <p className="text-gray-400 text-sm italic">No products available</p>
                    ) : (
                      products.map((product) => (
                        <label key={product.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={formData.excluded_product_ids.includes(product.id)}
                            onChange={(e) => {
                              const ids = e.target.checked
                                ? [...formData.excluded_product_ids, product.id]
                                : formData.excluded_product_ids.filter(id => id !== product.id);
                              setFormData({...formData, excluded_product_ids: ids});
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-700">{product.name}</span>
                          <span className="text-gray-400 text-xs ml-auto">₱{parseFloat(product.price).toFixed(2)}</span>
                        </label>
                      ))
                    )}
                  </div>
                  {formData.excluded_product_ids.length > 0 && (
                    <p className="text-xs text-orange-500 mt-1">
                      {formData.excluded_product_ids.length} product(s) excluded from this discount
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="requires_approval"
                    checked={formData.requires_approval}
                    onChange={(e) => setFormData({...formData, requires_approval: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label htmlFor="requires_approval" className="text-gray-700 text-sm">
                    Requires admin approval before applying
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm shadow-lg shadow-yellow-400/20"
                >
                  {editing ? 'Update Rule' : 'Create Rule'}
                </button>
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-900 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
