<?php

namespace App\Http\Controllers;

use App\Models\InventoryLog;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InventoryLogController extends Controller
{
    /**
     * Get inventory logs for a specific product
     */
    public function index(Request $request, $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);

        $query = InventoryLog::where('product_id', $productId)
            ->with('user')
            ->orderBy('created_at', 'desc');

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $logs = $query->paginate($request->get('per_page', 50));

        // Calculate summary
        $allLogs = InventoryLog::where('product_id', $productId);
        $summary = [
            'total_in' => (clone $allLogs)->where('type', 'in')->sum('quantity_change'),
            'total_out' => (clone $allLogs)->whereIn('type', ['out', 'damage'])->sum('quantity_change'),
            'total_void_returns' => (clone $allLogs)->where('type', 'void_return')->sum('quantity_change'),
            'total_adjustments' => (clone $allLogs)->where('type', 'adjustment')->sum('quantity_change'),
            'current_stock' => $product->stock,
            'product_name' => $product->name,
        ];

        return response()->json([
            'logs' => $logs,
            'summary' => $summary,
        ]);
    }

    /**
     * Get all inventory logs (admin)
     */
    public function all(Request $request): JsonResponse
    {
        $query = InventoryLog::with(['product', 'user'])
            ->orderBy('created_at', 'desc');

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $logs = $query->paginate($request->get('per_page', 50));

        return response()->json($logs);
    }
}
