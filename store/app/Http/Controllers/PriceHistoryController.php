<?php

namespace App\Http\Controllers;

use App\Models\PriceHistory;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PriceHistoryController extends Controller
{
    /**
     * Get price history for a specific product
     */
    public function index(Request $request, $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);

        $query = PriceHistory::where('product_id', $productId)
            ->with('changedByUser')
            ->orderBy('created_at', 'desc');

        $histories = $query->paginate($request->get('per_page', 50));

        // Calculate overall inflation
        $firstRecord = PriceHistory::where('product_id', $productId)
            ->orderBy('created_at', 'asc')
            ->first();

        $overallInflation = 0;
        if ($firstRecord && $firstRecord->old_price > 0) {
            $overallInflation = round(
                (($product->price - $firstRecord->old_price) / $firstRecord->old_price) * 100,
                2
            );
        }

        return response()->json([
            'histories' => $histories,
            'current_price' => $product->price,
            'product_name' => $product->name,
            'overall_inflation' => $overallInflation,
            'total_changes' => PriceHistory::where('product_id', $productId)->count(),
        ]);
    }
}
