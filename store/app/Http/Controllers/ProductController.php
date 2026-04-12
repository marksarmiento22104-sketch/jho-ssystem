<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\InventoryLog;
use App\Models\PriceHistory;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    use LogsActivity;
    /**
     * Display a listing of products.
     */
    public function index(): JsonResponse
    {
        // Mark expired products as inactive
        Product::expired()->where('is_active', true)->update(['is_active' => false]);
        
        $products = Product::with('category')->get();
        return response()->json($products);
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'reorder_point' => 'nullable|integer|min:0',
            'expiration_date' => 'nullable|date',
            'sku' => 'nullable|string|unique:products,sku',
            'barcode' => 'nullable|string|unique:products,barcode',
            'image_path' => 'nullable|string',
            'is_active' => 'nullable|boolean'
        ]);

        // Set defaults
        if (!isset($validated['is_active'])) {
            $validated['is_active'] = true;
        }
        if (!isset($validated['reorder_point'])) {
            $validated['reorder_point'] = 10;
        }

        $product = Product::create($validated);

        // Log initial stock as inventory in
        if ($product->stock > 0) {
            InventoryLog::record(
                $product->id,
                'in',
                $product->stock,
                0,
                $product->stock,
                'Product',
                $product->id,
                'Initial stock on product creation'
            );
        }

        $this->logActivity(
            'created',
            'Product',
            $product->id,
            "Created product: {$product->name}"
        );

        return response()->json($product->load('category'), 201);
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product): JsonResponse
    {
        return response()->json($product->load('category'));
    }

    /**
     * Update the specified product.
     * 
     * @param Request $request
     * @param Product $product
     * @return JsonResponse
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        /** @var Product $product */
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'sometimes|required|exists:categories,id',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'reorder_point' => 'nullable|integer|min:0',
            'expiration_date' => 'nullable|date',
            'sku' => 'nullable|string|unique:products,sku,' . $product->id,
            'barcode' => 'nullable|string|unique:products,barcode,' . $product->id,
            'image_path' => 'nullable|string',
            'is_active' => 'nullable|boolean'
        ]);

        // Prevent reactivating expired products
        if (isset($validated['is_active']) && $validated['is_active'] && $product->isExpired()) {
            return response()->json([
                'message' => 'Cannot activate an expired product.'
            ], 422);
        }

        $old = $product->toArray();
        $oldPrice = (float) $product->price;

        // Remove stock from update data - stock should only be changed via stock adjustment
        unset($validated['stock']);

        $product->update($validated);

        // Track price change
        if (isset($validated['price']) && (float) $validated['price'] !== $oldPrice) {
            PriceHistory::record(
                $product->id,
                $oldPrice,
                (float) $validated['price'],
                'Price updated via product edit'
            );
        }

        $this->logActivity(
            'updated',
            'Product',
            $product->id,
            "Updated product: {$product->name}",
            $old,
            $product->toArray()
        );

        return response()->json($product->load('category'));
    }

    /**
     * Remove the specified product.
     */
    public function destroy(Product $product): JsonResponse
    {
        $name = $product->name;
        $product->delete();

        $this->logActivity(
            'deleted',
            'Product',
            $product->id,
            "Deleted product: {$name}"
        );

        return response()->json(['message' => 'Product deleted successfully']);
    }

    /**
     * Update stock level for a product
     */
    public function updateStock(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'stock' => 'required|integer|min:0',
            'reason' => 'nullable|string',
        ]);

        $oldStock = $product->stock;
        $product->update(['stock' => $validated['stock']]);

        $reason = $validated['reason'] ?? 'Stock adjustment';
        $diff = $validated['stock'] - $oldStock;

        InventoryLog::record(
            $product->id,
            $diff > 0 ? 'in' : 'adjustment',
            $diff,
            $oldStock,
            $validated['stock'],
            'StockAdjustment',
            $product->id,
            $reason
        );

        $this->logActivity(
            'updated',
            'Product',
            $product->id,
            "Updated stock for {$product->name}: {$oldStock} → {$validated['stock']}. Reason: {$reason}",
            ['stock' => $oldStock],
            ['stock' => $validated['stock']]
        );

        return response()->json($product);
    }

    /**
     * Search product by barcode
     */
    public function searchByBarcode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'barcode' => 'required|string',
        ]);

        $product = Product::with('category')
            ->where('barcode', $validated['barcode'])
            ->first();

        if (!$product) {
            return response()->json([
                'message' => 'Product not found'
            ], 404);
        }

        return response()->json($product);
    }
}
