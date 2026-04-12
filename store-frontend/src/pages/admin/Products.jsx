import { useState, useEffect, useRef } from "react";
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSearch, FaEye, FaBarcode } from "react-icons/fa";
import axios from "../../utils/axios";
import Pagination from "../../components/Pagination";
import { toast } from "../../components/Toast";
import ProductInventoryModal from "../../components/ProductInventoryModal";
import useKeyboardShortcuts from "../../utils/useKeyboardShortcuts";
import KeyboardShortcutsHelp from "../../components/KeyboardShortcutsHelp";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const barcodeInputRef = useRef(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    price: "",
    stock: "",
    reorder_point: "10",
    sku: "",
    barcode: "",
    expiration_date: "",
    is_active: true
  });

  // Product search ref
  const searchInputRef = useRef(null);

  // Keyboard shortcuts
  const productShortcuts = [
    { key: "n", ctrl: true, handler: () => { setEditing(null); setShowModal(true); }, description: "Add new product" },
    { key: "f", ctrl: true, handler: () => { searchInputRef.current?.focus(); }, description: "Focus search" },
    { key: "Escape", handler: () => { if (showModal) setShowModal(false); if (showInventoryModal) setShowInventoryModal(false); }, description: "Close modal" },
  ];

  useKeyboardShortcuts(productShortcuts, true);

  const productShortcutsList = [
    { keys: "Ctrl + N", description: "Add new product" },
    { keys: "Ctrl + F", description: "Focus search" },
    { keys: "Escape", description: "Close modal" },
    { keys: "F1", description: "Toggle shortcuts help" },
  ];

  // Fetch products and categories
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products');
      
      // Process products to mark expired ones as inactive
      const processedProducts = response.data.map(product => {
        if (product.expiration_date) {
          const expirationDate = new Date(product.expiration_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // If product is expired but still active, mark it as inactive
          if (expirationDate < today && product.is_active) {
            return { ...product, is_active: false, _isExpired: true };
          }
        }
        return product;
      });
      
      setProducts(processedProducts);
    } catch (err) {
      toast.error('Failed to fetch products');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data.filter(cat => cat.is_active));
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Keyboard shortcut for adding products (Ctrl+Shift+T)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setShowModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add or Update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category_id || !formData.price || !formData.stock) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editing) {
        // Update existing product (exclude stock - use inventory modal to adjust stock)
        const { stock, ...editData } = formData;
        const response = await axios.put(`/api/products/${editing}`, editData);
        setProducts(products.map(p => p.id === editing ? response.data : p));
        toast.success("Product updated successfully!");
      } else {
        // Add new product
        const response = await axios.post('/api/products', formData);
        setProducts([...products, response.data]);
        toast.success("Product added successfully!");
      }
      
      resetForm();
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
      console.error('Error:', err);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await axios.delete(`/api/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
      toast.success("Product deleted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
      console.error('Error:', err);
    }
  };

  // Edit product - load data into form
  const handleEdit = (product) => {
    setEditing(product.id);
    setFormData({
      name: product.name,
      description: product.description || "",
      category_id: product.category_id,
      price: product.price,
      stock: product.stock,
      reorder_point: product.reorder_point || "10",
      sku: product.sku || "",
      barcode: product.barcode || "",
      expiration_date: product.expiration_date || "",
      is_active: product.is_active
    });
    setShowModal(true);
  };

  // View product details - open inventory modal
  const handleView = (product) => {
    setSelectedProduct(product);
    setShowInventoryModal(true);
  };

  // Toggle is_active status
  const handleToggleActive = async (product) => {
    try {
      const response = await axios.put(`/api/products/${product.id}`, {
        ...product,
        category_id: product.category_id,
        is_active: !product.is_active
      });
      
      setProducts(products.map(p => p.id === product.id ? response.data : p));
      toast.success(`Product ${response.data.is_active ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
      console.error('Error:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category_id: "",
      price: "",
      stock: "",
      reorder_point: "10",
      sku: "",
      barcode: "",
      expiration_date: "",
      is_active: true
    });
    setEditing(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  // Barcode scanner search
  const handleBarcodeSearch = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) {
      toast.error("Please enter a barcode");
      return;
    }

    try {
      const response = await axios.post('/api/products/search-barcode', {
        barcode: barcodeInput.trim()
      });
      
      // Open the product in edit mode
      handleEdit(response.data);
      setBarcodeInput("");
      toast.success("Product found!");
    } catch (err) {
      if (err.response?.status === 404) {
        // Product not found, open modal to add new product with this barcode
        setFormData({
          ...formData,
          barcode: barcodeInput.trim()
        });
        setShowModal(true);
        setBarcodeInput("");
        toast.info("Product not found. You can add it now with this barcode.");
      } else {
        toast.error(err.response?.data?.message || 'Failed to search product');
      }
    }
  };

  // Search and pagination
  const filteredProducts = products.filter((product) => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (product.category && product.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="min-h-screen p-6 md:p-8 bg-white text-gray-900">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-yellow-400 mb-2">
          Products
        </h2>
        <p className="text-gray-600 text-sm">Manage your product inventory</p>
      </div>

      {/* Search Bar and Add Button */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Barcode Scanner */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-4">
          <form onSubmit={handleBarcodeSearch} className="flex items-center gap-3">
            <FaBarcode className="text-yellow-600 text-2xl" />
            <div className="flex-1">
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Scan or enter barcode to search/add product..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full bg-white border border-yellow-300 text-gray-700 px-4 py-2.5 rounded-xl focus:outline-none focus:border-yellow-500 placeholder-gray-500 text-sm"
                autoFocus
              />
            </div>
            <button 
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl transition-all font-medium text-sm"
            >
              Search
            </button>
          </form>
        </div>

        {/* Text Search and Add Button */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products... (Ctrl+F)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-700 pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400/50 placeholder-gray-500 text-sm"
            />
          </div>
          <button 
            onClick={() => setShowModal(true)} 
            className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm shadow-lg shadow-yellow-400/20"
          >
            <FaPlus /> Add Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr className="text-gray-600 text-sm font-medium">
                <th className="py-3 px-4 text-left">#</th>
                <th className="py-3 px-4 text-left">Product Name</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-right">Stock</th>
                <th className="py-3 px-4 text-left">Expiration</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product, index) => (
                <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50 transition text-sm">
                  <td className="py-3 px-4 text-gray-600">{indexOfFirstItem + index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <div 
                          className="font-medium text-gray-900 cursor-pointer hover:text-yellow-600 transition-colors"
                          onClick={() => handleView(product)}
                          title="Click to view inventory history"
                        >
                          {product.name}
                        </div>
                        {product.sku && (
                          <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                        )}
                      </div>
                      {product.expiration_date && new Date(product.expiration_date) < new Date() && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-semibold rounded border border-red-500/30">
                          EXPIRED
                        </span>
                      )}
                    </div>
                </td>
                <td className="py-3 px-4 text-gray-700">{product.category?.name || 'N/A'}</td>
                <td className="py-3 px-4 text-right text-yellow-400 font-bold">₱{parseFloat(product.price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td className="py-3 px-4 text-center">
                  <span className={product.stock <= (product.reorder_point || 10) ? 'text-red-400 font-bold' : 'text-gray-700'}>
                    {product.stock}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-700 text-xs">
                  {product.expiration_date ? (
                    <span className={
                      new Date(product.expiration_date) < new Date() 
                        ? 'text-red-400 font-semibold'
                        : new Date(product.expiration_date) < new Date(Date.now() + 30*24*60*60*1000)
                        ? 'text-yellow-400 font-semibold'
                        : 'text-green-400'
                    }>
                      {new Date(product.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {product.expiration_date && new Date(product.expiration_date) < new Date() ? (
                    <div className="flex flex-col items-center gap-1">
                      <button
                        disabled
                        className="flex items-center justify-center gap-1 mx-auto cursor-not-allowed opacity-50"
                        title="Cannot activate expired products"
                      >
                        <FaToggleOff className="text-gray-500 text-2xl" />
                      </button>
                      <span className="text-xs text-gray-500">Expired</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleToggleActive(product)}
                      className="flex items-center justify-center gap-1 mx-auto transition-transform hover:scale-110"
                      title={product.is_active ? "Deactivate product" : "Activate product"}
                    >
                      {product.is_active ? (
                        <FaToggleOn className="text-green-400 text-2xl" />
                      ) : (
                        <FaToggleOff className="text-gray-500 text-2xl" />
                      )}
                    </button>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={() => handleView(product)}
                      className="text-yellow-400 hover:text-yellow-300 transition-colors"
                      title="View details"
                    >
                      <FaEye />
                    </button>
                    <button 
                      onClick={() => handleEdit(product)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Edit product"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete product"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-400">Loading products...</span>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500 italic">
                  No products available.
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500 italic">
                  No products found matching "{searchQuery}"
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && filteredProducts.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={filteredProducts.length}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-yellow-400/30 rounded-2xl shadow-2xl shadow-yellow-400/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-bold text-gray-900">
                {editing ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-2 block">
                    Product Name <span className="text-red-400">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter product name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    required 
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400/50 placeholder-gray-500 text-sm"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm font-medium mb-2 block">
                    <FaBarcode className="inline mr-2" />
                    Barcode (Optional)
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter or scan barcode" 
                    value={formData.barcode} 
                    onChange={(e) => setFormData({...formData, barcode: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400/50 placeholder-gray-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-700 text-sm font-medium mb-2 block">
                  Description
                </label>
                <textarea
                  placeholder="Enter product description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400/50 placeholder-gray-500 resize-none text-sm"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-2 block">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select 
                    value={formData.category_id} 
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})} 
                    required
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400/50 text-sm"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-2 block">
                    Price (₱) <span className="text-red-400">*</span>
                  </label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    required 
                    step="0.01"
                    min="0"
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400/50 placeholder-gray-500 text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-2 block">
                    Stock {!editing && <span className="text-red-400">*</span>}
                  </label>
                  {editing ? (
                    <div>
                      <div className="w-full bg-gray-100 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed">
                        {formData.stock}
                      </div>
                      <p className="text-xs text-yellow-600 mt-1.5 flex items-center gap-1">
                        <FaEye className="text-[10px]" /> Use the inventory modal to adjust stock
                      </p>
                    </div>
                  ) : (
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={formData.stock} 
                      onChange={(e) => setFormData({...formData, stock: e.target.value})} 
                      required 
                      min="0"
                      className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400/50 placeholder-gray-500 text-sm"
                    />
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-2 block">
                    Reorder Point
                  </label>
                  <input 
                    type="number" 
                    placeholder="10" 
                    value={formData.reorder_point} 
                    onChange={(e) => setFormData({...formData, reorder_point: e.target.value})} 
                    min="0"
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400/50 placeholder-gray-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">Alert when stock falls below this level</p>
                </div>
                
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-2 block">
                    Expiration Date
                  </label>
                  <input 
                    type="date" 
                    value={formData.expiration_date} 
                    onChange={(e) => setFormData({...formData, expiration_date: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl focus:outline-none focus:border-yellow-400/50 text-sm"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm shadow-lg shadow-yellow-400/20"
                >
                  {editing ? 'Update Product' : 'Add Product'}
                </button>
                <button 
                  type="button" 
                  onClick={handleModalClose} 
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Inventory Modal */}
      <ProductInventoryModal
        product={selectedProduct}
        isOpen={showInventoryModal}
        onClose={() => {
          setShowInventoryModal(false);
          setSelectedProduct(null);
        }}
        onStockUpdated={fetchProducts}
      />

      <KeyboardShortcutsHelp shortcuts={productShortcutsList} />
    </div>
  );
}
