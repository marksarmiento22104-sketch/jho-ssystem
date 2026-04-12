import { useState, useEffect, useRef } from "react";
import { FaPlus, FaTrashAlt, FaShoppingCart, FaBoxOpen, FaTimes, FaBarcode, FaBan, FaHistory } from "react-icons/fa";
import axios from "../../utils/axios";
import { toast } from "react-hot-toast";
import useKeyboardShortcuts from "../../utils/useKeyboardShortcuts";
import KeyboardShortcutsHelp from "../../components/KeyboardShortcutsHelp";

export default function POS() {
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const barcodeInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    customerName: "",
    paymentMethod: "cash",
    amountPaid: "",
    notes: ""
  });
  const [processing, setProcessing] = useState(false);
  const [focusedCartIndex, setFocusedCartIndex] = useState(0);
  const [discount, setDiscount] = useState({ type: "none", value: 0, category: "" });
  const [discountRules, setDiscountRules] = useState([]);
  const quantityRefs = useRef([]);

  // Void order state
  const [recentOrders, setRecentOrders] = useState([]);
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidTarget, setVoidTarget] = useState(null);
  const [voidReason, setVoidReason] = useState("");
  const [voidProcessing, setVoidProcessing] = useState(false);
  const [showRecentOrders, setShowRecentOrders] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchDiscountRules();
    fetchRecentOrders();

    // Set up real-time polling for products every 5 seconds
    const productInterval = setInterval(() => {
      fetchProducts(false); // Don't show loading spinner on auto-refresh
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(productInterval);
  }, []);

  // Keyboard navigation for cart items
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (cart.length === 0 || showPaymentModal) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const newIndex = Math.min(focusedCartIndex + 1, cart.length - 1);
        setFocusedCartIndex(newIndex);
        // Focus the quantity input of the next item
        setTimeout(() => {
          quantityRefs.current[newIndex]?.focus();
          quantityRefs.current[newIndex]?.select();
        }, 0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const newIndex = Math.max(focusedCartIndex - 1, 0);
        setFocusedCartIndex(newIndex);
        // Focus the quantity input of the previous item
        setTimeout(() => {
          quantityRefs.current[newIndex]?.focus();
          quantityRefs.current[newIndex]?.select();
        }, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart.length, showPaymentModal, focusedCartIndex]);

  // Reset focused index when cart changes
  useEffect(() => {
    if (focusedCartIndex >= cart.length && cart.length > 0) {
      setFocusedCartIndex(cart.length - 1);
    }
  }, [cart.length, focusedCartIndex]);

  // POS Keyboard shortcuts
  const searchInputRef = useRef(null);

  const posShortcuts = [
    { key: "Enter", ctrl: true, handler: () => { if (cart.length > 0 && !showPaymentModal) handleCheckout(); }, description: "Open checkout", allowInInput: true },
    { key: "Escape", handler: () => { if (showPaymentModal) setShowPaymentModal(false); }, description: "Close payment modal" },
    { key: "Delete", ctrl: true, handler: () => { if (cart.length > 0) { setCart([]); setDiscount({ type: "none", value: 0, category: "" }); toast.success("Cart cleared"); } }, description: "Clear cart" },
    { key: "f", ctrl: true, handler: () => { searchInputRef.current?.focus(); }, description: "Focus product search" },
    { key: "b", ctrl: true, handler: () => { barcodeInputRef.current?.focus(); }, description: "Focus barcode scanner" },
  ];

  useKeyboardShortcuts(posShortcuts, true);

  const posShortcutsList = [
    { keys: "Ctrl + Enter", description: "Open checkout" },
    { keys: "Ctrl + Delete", description: "Clear cart" },
    { keys: "Ctrl + F", description: "Focus product search" },
    { keys: "Ctrl + B", description: "Focus barcode scanner" },
    { keys: "↑ / ↓", description: "Navigate cart items" },
    { keys: "Escape", description: "Close modal" },
    { keys: "F1", description: "Toggle shortcuts help" },
  ];

  const fetchProducts = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await axios.get("/api/products", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      // Filter out inactive, expired, and out-of-stock products
      const activeProducts = response.data.filter(product => {
        // Check if product is active and has stock
        if (!product.is_active || product.stock <= 0) {
          return false;
        }
        
        // Check if product is expired
        if (product.expiration_date) {
          const expirationDate = new Date(product.expiration_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (expirationDate < today) {
            return false;
          }
        }
        
        return true;
      });
      
      setProducts(activeProducts);

      // Update cart quantities if products are no longer available or stock reduced
      setCart(prevCart => {
        return prevCart.map(cartItem => {
          const product = activeProducts.find(p => p.id === cartItem.product_id);
          if (!product) {
            // Product no longer available
            toast.error(`${cartItem.name} is no longer available`);
            return null;
          }
          if (cartItem.quantity > product.stock) {
            // Reduce quantity to available stock
            toast.warning(`${cartItem.name} quantity reduced to ${product.stock}`);
            return {
              ...cartItem,
              quantity: product.stock,
              total: parseFloat(product.stock * cartItem.price)
            };
          }
          return cartItem;
        }).filter(item => item !== null);
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      if (showLoading) {
        toast.error("Failed to load products");
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchDiscountRules = async () => {
    try {
      const response = await axios.get("/api/discount-rules", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setDiscountRules(response.data);
    } catch (error) {
      console.error("Error fetching discount rules:", error);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await axios.get("/api/orders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      // Show only today's orders, most recent first
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = response.data
        .filter(o => new Date(o.created_at) >= today)
        .slice(0, 20);
      setRecentOrders(todayOrders);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    }
  };

  const handleVoidOrder = async () => {
    if (!voidTarget || !voidReason.trim()) return;

    try {
      setVoidProcessing(true);
      await axios.put(`/api/orders/${voidTarget.id}/void`, {
        void_reason: voidReason,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      toast.success("Order voided successfully! Stock has been restored.");
      setShowVoidModal(false);
      setVoidTarget(null);
      setVoidReason("");
      fetchRecentOrders();
      fetchProducts(false);
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to void order";
      toast.error(msg);
    } finally {
      setVoidProcessing(false);
    }
  };

  const isDiscountActive = (category) => {
    // Try exact match first
    let rule = discountRules.find(r => r.name === category);
    
    // If not found, try case-insensitive partial match
    if (!rule) {
      rule = discountRules.find(r => 
        r.name.toLowerCase().includes(category.toLowerCase()) || 
        category.toLowerCase().includes(r.name.toLowerCase())
      );
    }
    
    // If no rule exists, default to active (available)
    if (!rule) return true;
    
    // Check if rule is active
    if (!rule.is_active) return false;
    
    // Check usage limit
    if (rule.usage_limit && rule.usage_count >= rule.usage_limit) return false;
    
    return true;
  };

  // Get the matching discount rule for current discount category
  const getActiveDiscountRule = () => {
    if (discount.type === "none" || !discount.category) return null;
    
    let rule = discountRules.find(r => r.name === discount.category);
    if (!rule) {
      rule = discountRules.find(r => 
        r.name.toLowerCase().includes(discount.category.toLowerCase()) || 
        discount.category.toLowerCase().includes(r.name.toLowerCase())
      );
    }
    return rule;
  };

  // Check if a product is excluded from the current discount
  const isProductExcluded = (productId) => {
    const rule = getActiveDiscountRule();
    if (!rule || !rule.excluded_product_ids) return false;
    return rule.excluded_product_ids.includes(productId);
  };

  const handleBarcodeSearch = async (e) => {
    e.preventDefault();
    
    if (!barcodeInput.trim()) {
      return;
    }

    try {
      const response = await axios.post('/api/products/search-barcode', {
        barcode: barcodeInput.trim()
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      const product = response.data;

      // Check if product is active
      if (!product.is_active) {
        toast.error("This product is inactive");
        setBarcodeInput("");
        return;
      }

      // Check if product has stock
      if (product.stock <= 0) {
        toast.error("This product is out of stock");
        setBarcodeInput("");
        return;
      }

      // Add to cart automatically with quantity 1
      const existingItem = cart.find(item => item.product_id === product.id);
      
      if (existingItem) {
        const newQty = existingItem.quantity + 1;
        if (newQty > product.stock) {
          toast.error(`Only ${product.stock} items available in stock`);
          setBarcodeInput("");
          return;
        }
        
        setCart(cart.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: newQty, total: newQty * item.price }
            : item
        ));
      } else {
        const newItem = {
          product_id: product.id,
          name: product.name,
          quantity: 1,
          price: parseFloat(product.price),
          total: parseFloat(product.price),
        };
        setCart([...cart, newItem]);
      }

      toast.success(`${product.name} added to cart!`);
      setBarcodeInput("");
      
      // Refocus barcode input for next scan
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 100);
      
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("Product not found with this barcode");
      } else {
        toast.error("Error scanning barcode");
      }
      setBarcodeInput("");
      console.error("Barcode search error:", error);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
      toast.error("Please select a product and enter quantity");
      return;
    }

    const qty = parseInt(quantity);
    
    if (qty > selectedProduct.stock) {
      toast.error(`Only ${selectedProduct.stock} items available in stock`);
      return;
    }

    const existingItem = cart.find(item => item.product_id === selectedProduct.id);
    
    if (existingItem) {
      const newQty = existingItem.quantity + qty;
      if (newQty > selectedProduct.stock) {
        toast.error(`Only ${selectedProduct.stock} items available in stock`);
        return;
      }
      
      setCart(cart.map(item =>
        item.product_id === selectedProduct.id
          ? { ...item, quantity: newQty, total: newQty * item.price }
          : item
      ));
    } else {
      const newItem = {
        product_id: selectedProduct.id,
        name: selectedProduct.name,
        quantity: qty,
        price: parseFloat(selectedProduct.price),
        total: parseFloat(selectedProduct.price * qty),
      };
      setCart([...cart, newItem]);
    }

    setSelectedProduct(null);
    setQuantity("");
    toast.success("Added to cart!");
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter((item) => item.product_id !== productId));
    toast.success("Removed from cart");
  };

  const handleDecreaseQuantity = (productId) => {
    const item = cart.find(i => i.product_id === productId);
    if (item.quantity > 1) {
      setCart(cart.map(i =>
        i.product_id === productId
          ? { ...i, quantity: i.quantity - 1, total: parseFloat((i.quantity - 1) * i.price) }
          : i
      ));
    } else {
      handleRemoveFromCart(productId);
    }
  };

  const handleIncreaseQuantity = (productId) => {
    const item = cart.find(i => i.product_id === productId);
    const product = products.find(p => p.id === productId);
    
    if (item.quantity >= product.stock) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }
    
    setCart(cart.map(i =>
      i.product_id === productId
        ? { ...i, quantity: i.quantity + 1, total: parseFloat((i.quantity + 1) * i.price) }
        : i
    ));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const qty = parseInt(newQuantity);
    
    if (isNaN(qty) || qty < 1) {
      return;
    }
    
    const product = products.find(p => p.id === productId);
    
    if (qty > product.stock) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }
    
    setCart(cart.map(i =>
      i.product_id === productId
        ? { ...i, quantity: qty, total: parseFloat(qty * i.price) }
        : i
    ));
  };

  const subtotal = cart.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
  
  // Calculate discount with restrictions applied
  const calculateDiscountAmount = () => {
    if (discount.type === "none") return 0;
    
    const rule = getActiveDiscountRule();
    
    // Calculate eligible subtotal (exclude excluded products)
    let eligibleSubtotal = subtotal;
    if (rule?.excluded_product_ids?.length > 0) {
      eligibleSubtotal = cart
        .filter(item => !rule.excluded_product_ids.includes(item.product_id))
        .reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    }
    
    let amount = 0;
    let effectivePercentage = parseFloat(discount.value || 0);
    
    // Apply max_percentage cap
    if (rule?.max_percentage && effectivePercentage > parseFloat(rule.max_percentage)) {
      effectivePercentage = parseFloat(rule.max_percentage);
    }
    
    if (discount.type === "percentage") {
      amount = (eligibleSubtotal * effectivePercentage) / 100;
    } else if (discount.type === "amount") {
      amount = parseFloat(discount.value || 0);
    }
    
    // Apply max_discount_amount cap
    if (rule?.max_discount_amount && amount > parseFloat(rule.max_discount_amount)) {
      amount = parseFloat(rule.max_discount_amount);
    }
    
    return amount;
  };
  
  const discountAmount = calculateDiscountAmount();
  const excludedProductCount = cart.filter(item => isProductExcluded(item.product_id)).length;
  
  const totalAmount = Math.max(0, subtotal - discountAmount);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty!");
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!paymentData.amountPaid || parseFloat(paymentData.amountPaid) < totalAmount) {
      toast.error("Amount paid must be at least the total amount");
      return;
    }

    try {
      setProcessing(true);

      const orderData = {
        customer_name: paymentData.customerName || "Walk-in Customer",
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        })),
        payment_method: paymentData.paymentMethod,
        amount_paid: parseFloat(paymentData.amountPaid),
        discount: discountAmount,
        discount_type: discount.type,
        discount_value: discount.value,
        discount_category: discount.category,
        notes: paymentData.notes
      };

      const response = await axios.post("/api/orders", orderData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      toast.success(`Order completed! Change: ₱${response.data.change_amount}`);
      
      // Immediately update product stock in local state
      setProducts(prevProducts => 
        prevProducts.map(product => {
          const cartItem = cart.find(item => item.product_id === product.id);
          if (cartItem) {
            const newStock = product.stock - cartItem.quantity;
            // Remove from list if out of stock
            if (newStock <= 0) {
              return null;
            }
            return {
              ...product,
              stock: newStock
            };
          }
          return product;
        }).filter(product => product !== null)
      );
      
      setCart([]);
      setShowPaymentModal(false);
      setDiscount({ type: "none", value: 0, category: "" });
      setPaymentData({
        customerName: "",
        paymentMethod: "cash",
        amountPaid: "",
        notes: ""
      });
      
      // Fetch fresh data from server to ensure accuracy
      fetchProducts(false);
      fetchRecentOrders();
      
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Payment failed";
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const changeAmount = paymentData.amountPaid 
    ? Math.max(0, parseFloat(paymentData.amountPaid) - totalAmount)
    : 0;

  const getAvailableStock = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    
    const cartItem = cart.find(item => item.product_id === productId);
    const reservedQty = cartItem ? cartItem.quantity : 0;
    
    return product.stock - reservedQty;
  };

  const handleSelectProduct = (product) => {
    // Check available stock (actual stock minus what's already in cart)
    const availableStock = getAvailableStock(product.id);
    
    if (availableStock <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }
    
    // Directly add to cart with quantity 1
    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      const newQty = existingItem.quantity + 1;
      if (newQty > product.stock) {
        toast.error(`Only ${product.stock} items available in stock`);
        return;
      }
      
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: newQty, total: parseFloat(newQty * item.price) }
          : item
      ));
    } else {
      const newItem = {
        product_id: product.id,
        name: product.name,
        quantity: 1,
        price: parseFloat(product.price),
        total: parseFloat(product.price),
      };
      setCart([...cart, newItem]);
    }
    
    toast.success(`${product.name} added to cart!`);
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen text-gray-900">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-yellow-400 mb-2">Point of Sale</h2>
          <p className="text-gray-600 text-sm">Select products and process transactions</p>
        </div>
        <button
          onClick={() => { setShowRecentOrders(!showRecentOrders); if (!showRecentOrders) fetchRecentOrders(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            showRecentOrders
              ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
              : "bg-white border border-gray-200 text-gray-600 hover:border-yellow-400/50 hover:text-gray-900"
          }`}
        >
          <FaHistory /> Recent Orders
        </button>
      </div>

      {/* Recent Orders Panel */}
      {showRecentOrders && (
        <div className="mb-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaHistory className="text-yellow-400" /> Today's Orders
          </h3>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 italic text-sm text-center py-4">No orders today</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    order.is_voided
                      ? "bg-red-50/50 border-red-200 opacity-70"
                      : "bg-gray-50 border-gray-200 hover:border-yellow-400/30"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-bold ${order.is_voided ? "line-through text-gray-400" : "text-yellow-500"}`}>
                        #{order.id}
                      </span>
                      <span className={`text-sm ${order.is_voided ? "line-through text-gray-400" : "text-gray-900"}`}>
                        {order.customer_name || "Walk-in"}
                      </span>
                      {order.is_voided && (
                        <span className="px-1.5 py-0.5 bg-red-500/20 text-red-600 text-[10px] font-bold rounded">VOIDED</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{order.items?.map(i => `${i.product?.name || 'Product'} (×${i.quantity})`).join(", ")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className={`text-sm font-bold ${order.is_voided ? "line-through text-gray-400" : "text-green-600"}`}>
                      ₱{parseFloat(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {!order.is_voided && (
                      <button
                        onClick={() => { setVoidTarget(order); setVoidReason(""); setShowVoidModal(true); }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                        title="Void Order"
                      >
                        <FaBan className="text-[10px]" /> Void
                      </button>
                    )}
                    {order.is_voided && order.void_reason && (
                      <span className="text-[10px] text-gray-400 max-w-[100px] truncate" title={order.void_reason}>
                        {order.void_reason}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaBoxOpen className="text-yellow-400" /> Products
          </h3>

          <div className="mb-4 space-y-3">
            {/* Barcode Scanner */}
            <form onSubmit={handleBarcodeSearch} className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <FaBarcode className="text-yellow-600 text-xl flex-shrink-0" />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder="Scan barcode to add to cart..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="flex-1 bg-white border border-yellow-300 text-gray-700 px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500 placeholder-gray-500 text-sm"
                />
                <button 
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-all font-medium text-sm whitespace-nowrap"
                >
                  Add
                </button>
              </div>
            </form>

            {/* Text Search */}
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products... (Ctrl+F)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 text-sm transition-all"
            />
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all text-sm ${
                  selectedCategory === "all"
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-400/30"
                    : "bg-white border border-gray-200 text-gray-600 hover:text-yellow-400 hover:border-yellow-400/20"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all text-sm ${
                    selectedCategory === cat.id
                      ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                      : "bg-white border border-gray-200 text-gray-600 hover:text-yellow-400 hover:border-yellow-400/20"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
            {loading ? (
              <div className="col-span-full text-center text-gray-600 py-8">Loading...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-8 text-sm">No products available</div>
            ) : (
              filteredProducts.map((product) => {
                const availableStock = getAvailableStock(product.id);
                return (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="bg-white border border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 hover:border-yellow-400/50 transition-all"
                >
                  <p className="text-gray-900 mb-1 text-sm">{product.name}</p>
                  <p className="text-yellow-600 text-sm mb-1">₱{parseFloat(product.price).toLocaleString()}</p>
                  <p className={`text-xs ${
                    availableStock <= 0 
                      ? 'text-red-400 font-semibold' 
                      : availableStock <= 5 
                      ? 'text-yellow-400' 
                      : 'text-gray-500'
                  }`}>
                    Stock: {availableStock} {availableStock !== product.stock && `(${product.stock} total)`}
                  </p>
                </div>
              )})
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaShoppingCart className="text-yellow-400" /> Cart
          </h3>



          <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto scrollbar-hide">
            {cart.length === 0 ? (
              <p className="text-gray-600 italic text-center py-6 text-sm">No items in cart</p>
            ) : (
              cart.map((item, index) => (
                <div
                  key={item.product_id}
                  className={`bg-gray-50 border rounded-xl p-3 transition-all ${
                    index === focusedCartIndex 
                      ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm">{item.name}</p>
                      <p className="text-gray-600 text-xs">
                        ₱{parseFloat(item.price).toLocaleString()} each
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(item.product_id)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                      title="Remove from cart"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-1 border border-gray-200">
                      <button
                        onClick={() => handleDecreaseQuantity(item.product_id)}
                        className="text-gray-600 hover:text-yellow-600 transition-colors px-2 py-1 font-bold"
                      >
                        -
                      </button>
                      <span
                        ref={(el) => (quantityRefs.current[index] = el)}
                        className="text-gray-900 text-sm w-10 text-center font-semibold select-none"
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncreaseQuantity(item.product_id)}
                        className="text-gray-600 hover:text-yellow-600 transition-colors px-2 py-1 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-yellow-600 font-bold text-sm">₱{item.total.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <>
              {/* Discount Section */}
              <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <h4 className="text-gray-900 font-semibold text-sm mb-3">Discount</h4>
                <div className="space-y-3">
                  {/* Discount Category */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDiscount({ type: "none", value: 0, category: "" })}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        discount.type === "none"
                          ? "bg-yellow-400 text-black"
                          : "bg-white border border-gray-200 text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      None
                    </button>
                    <button
                      onClick={() => {
                        if (isDiscountActive("Senior Citizen")) {
                          setDiscount({ type: "percentage", value: 20, category: "Senior Citizen" });
                        } else {
                          toast.error("Senior Citizen discount is currently unavailable");
                        }
                      }}
                      disabled={!isDiscountActive("Senior Citizen")}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        discount.category === "Senior Citizen"
                          ? "bg-yellow-400 text-black"
                          : !isDiscountActive("Senior Citizen")
                          ? "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-200 text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Senior (20%)
                      {!isDiscountActive("Senior Citizen") && <span className="block text-[10px] text-red-400">Unavailable</span>}
                    </button>
                    <button
                      onClick={() => {
                        if (isDiscountActive("PWD")) {
                          setDiscount({ type: "percentage", value: 20, category: "PWD" });
                        } else {
                          toast.error("PWD discount is currently unavailable");
                        }
                      }}
                      disabled={!isDiscountActive("PWD")}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        discount.category === "PWD"
                          ? "bg-yellow-400 text-black"
                          : !isDiscountActive("PWD")
                          ? "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-200 text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      PWD (20%)
                      {!isDiscountActive("PWD") && <span className="block text-[10px] text-red-400">Unavailable</span>}
                    </button>
                    <button
                      onClick={() => {
                        if (isDiscountActive("Student")) {
                          setDiscount({ type: "percentage", value: 10, category: "Student" });
                        } else {
                          toast.error("Student discount is currently unavailable");
                        }
                      }}
                      disabled={!isDiscountActive("Student")}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        discount.category === "Student"
                          ? "bg-yellow-400 text-black"
                          : !isDiscountActive("Student")
                          ? "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-200 text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Student (10%)
                      {!isDiscountActive("Student") && <span className="block text-[10px] text-red-400">Unavailable</span>}
                    </button>
                  </div>
                  
                  {/* Custom Discount */}
                  <div className="pt-2 border-t border-gray-200">
                    <label className="text-gray-600 text-xs mb-2 block">Custom Discount</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDiscount({ type: "percentage", value: discount.value || 0, category: "Custom" })}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          discount.type === "percentage" && discount.category === "Custom"
                            ? "bg-yellow-400 text-black"
                            : "bg-white border border-gray-200 text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        %
                      </button>
                      <button
                        onClick={() => setDiscount({ type: "amount", value: discount.value || 0, category: "Custom" })}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          discount.type === "amount" && discount.category === "Custom"
                            ? "bg-yellow-400 text-black"
                            : "bg-white border border-gray-200 text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        ₱
                      </button>
                      <input
                        type="number"
                        value={discount.category === "Custom" ? discount.value : ""}
                        onChange={(e) => setDiscount({ ...discount, value: parseFloat(e.target.value) || 0, category: "Custom" })}
                        placeholder={discount.type === "percentage" ? "%" : "Amount"}
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 text-sm"
                        min="0"
                        max={discount.type === "percentage" ? "100" : subtotal}
                        disabled={discount.type === "none"}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">₱{subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Discount {discount.category && `(${discount.category})`}:
                    </span>
                    <span className="text-red-500">-₱{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                {discountAmount > 0 && excludedProductCount > 0 && (
                  <div className="text-xs text-orange-500 bg-orange-50 rounded-lg px-2 py-1">
                    ⚠️ {excludedProductCount} item(s) excluded from discount
                  </div>
                )}
                {discountAmount > 0 && getActiveDiscountRule()?.max_discount_amount && 
                  discountAmount >= parseFloat(getActiveDiscountRule().max_discount_amount) && (
                  <div className="text-xs text-blue-500 bg-blue-50 rounded-lg px-2 py-1">
                    ℹ️ Discount capped at ₱{parseFloat(getActiveDiscountRule().max_discount_amount).toFixed(2)}
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-2xl text-yellow-600">₱{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-xl font-bold transition-all shadow-lg shadow-yellow-400/20 text-sm"
              >
                Checkout
              </button>
            </>
          )}
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-yellow-400/30 rounded-2xl shadow-2xl shadow-yellow-400/10 max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-white text-2xl transition-colors"
                disabled={processing}
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                  Customer Name (Optional)
                </label>
                <input
                  type="text"
                  value={paymentData.customerName}
                  onChange={(e) => setPaymentData({...paymentData, customerName: e.target.value})}
                  placeholder="Walk-in Customer"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 text-sm"
                  disabled={processing}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                  Payment Method
                </label>
                <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-semibold">
                  Cash
                </div>
              </div>

              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4">
                <div className="flex justify-between">
                  <span className="text-gray-700 text-sm">Total Amount:</span>
                  <span className="text-xl font-bold text-yellow-400">₱{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 text-sm">
                  Amount Paid
                </label>
                <input
                  type="number"
                  value={paymentData.amountPaid}
                  onChange={(e) => setPaymentData({...paymentData, amountPaid: e.target.value})}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 text-sm"
                  disabled={processing}
                  step="0.01"
                />
              </div>

              {paymentData.amountPaid && (
                <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-4">
                  <div className="flex justify-between">
                    <span className="text-gray-700 text-sm">Change:</span>
                    <span className="text-xl font-bold text-green-400">₱{changeAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                  Notes (Optional)
                </label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                  placeholder="Add any notes"
                  rows="3"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 resize-none text-sm"
                  disabled={processing}
                />
              </div>

              <button
                onClick={handlePayment}
                disabled={processing || !paymentData.amountPaid}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-400/20 text-sm"
              >
                {processing ? "Processing..." : "Complete Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Void Confirmation Modal */}
      {showVoidModal && voidTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <FaBan className="text-red-500 text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Void Order #{voidTarget.id}</h3>
                <p className="text-xs text-gray-500">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Customer</span>
                <span className="font-medium text-gray-900">{voidTarget.customer_name || "Walk-in"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Items</span>
                <span className="font-medium text-gray-900">{voidTarget.items?.length || 0} item(s)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-green-600">
                  ₱{parseFloat(voidTarget.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-xs text-yellow-700">
              ⚠️ Voiding this order will restore stock for all items back to inventory.
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for voiding *</label>
              <textarea
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Enter the reason for voiding this order..."
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowVoidModal(false); setVoidTarget(null); setVoidReason(""); }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                disabled={voidProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleVoidOrder}
                disabled={!voidReason.trim() || voidProcessing}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <FaBan className="text-xs" />
                {voidProcessing ? "Voiding..." : "Void Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      <KeyboardShortcutsHelp shortcuts={posShortcutsList} />
    </div>
  );
}
