<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function salesReport(Request $request)
    {
        $request->validate([
            'period' => 'required|in:daily,weekly,monthly',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $query = Order::query()
            ->where('payment_status', 'paid')
            ->where(function($q) {
                $q->where('is_voided', false)->orWhereNull('is_voided');
            });

        // Apply date filters
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        } else {
            // Default to current period
            switch ($request->period) {
                case 'daily':
                    $query->whereDate('created_at', today());
                    break;
                case 'weekly':
                    $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                    break;
                case 'monthly':
                    $query->whereMonth('created_at', now()->month)
                        ->whereYear('created_at', now()->year);
                    break;
            }
        }

        $transactions = $query->with(['items.product'])->get();

        // Generate sales trend data based on period
        $salesTrend = [];
        if ($request->period === 'daily') {
            // Last 7 days
            for ($i = 6; $i >= 0; $i--) {
                $date = now()->subDays($i)->format('Y-m-d');
                $dayTotal = $transactions->filter(function($t) use ($date) {
                    return $t->created_at->format('Y-m-d') === $date;
                })->sum('total_amount');
                
                $salesTrend[] = [
                    'date' => now()->subDays($i)->format('M d'),
                    'total' => (float) $dayTotal
                ];
            }
        } elseif ($request->period === 'weekly') {
            // Last 8 weeks
            for ($i = 7; $i >= 0; $i--) {
                $weekStart = now()->subWeeks($i)->startOfWeek();
                $weekEnd = now()->subWeeks($i)->endOfWeek();
                $weekTotal = $transactions->filter(function($t) use ($weekStart, $weekEnd) {
                    return $t->created_at->between($weekStart, $weekEnd);
                })->sum('total_amount');
                
                $salesTrend[] = [
                    'date' => 'Week ' . $weekStart->format('M d'),
                    'total' => (float) $weekTotal
                ];
            }
        } elseif ($request->period === 'monthly') {
            // Last 12 months
            for ($i = 11; $i >= 0; $i--) {
                $month = now()->subMonths($i);
                $monthTotal = $transactions->filter(function($t) use ($month) {
                    return $t->created_at->month === $month->month && 
                           $t->created_at->year === $month->year;
                })->sum('total_amount');
                
                $salesTrend[] = [
                    'date' => $month->format('M Y'),
                    'total' => (float) $monthTotal
                ];
            }
        }

        $summary = [
            'total_sales' => $transactions->sum('total_amount'),
            'total_transactions' => $transactions->count(),
            'total_discount' => $transactions->sum('discount'),
            'total_tax' => 0, // Tax calculation can be added if needed
            'average_sale' => $transactions->avg('total_amount'),
            'sales_trend' => $salesTrend,
            'recent_transactions' => $transactions->take(10)->map(function($order) {
                return [
                    'id' => $order->id,
                    'order_id' => $order->id,
                    'customer_name' => $order->customer_name,
                    'subtotal' => $order->subtotal ?? $order->total_amount,
                    'discount' => $order->discount ?? 0,
                    'tax' => 0,
                    'total' => $order->total_amount,
                    'payment_method' => $order->payment_method,
                    'items' => $order->items->map(function($item) {
                        return [
                            'product_name' => $item->product->name ?? 'Deleted Product',
                            'quantity' => $item->quantity,
                        ];
                    }),
                    'created_at' => $order->created_at,
                ];
            }),
        ];

        return response()->json($summary);
    }

    public function topSellingProducts(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $query = OrderItem::select(
            'product_id',
            DB::raw('MAX(products.name) as product_name'),
            DB::raw('SUM(order_items.quantity) as total_quantity'),
            DB::raw('SUM(order_items.quantity * order_items.unit_price) as total_revenue'),
            DB::raw('COUNT(DISTINCT order_items.order_id) as transaction_count')
        )
        ->join('products', 'order_items.product_id', '=', 'products.id')
        ->join('orders', 'order_items.order_id', '=', 'orders.id')
        ->where('orders.payment_status', 'paid')
        ->where(function($q) {
            $q->where('orders.is_voided', false)->orWhereNull('orders.is_voided');
        })
        ->groupBy('product_id')
        ->orderBy('total_quantity', 'desc');

        // Apply date filters
        if ($request->has('start_date')) {
            $query->whereDate('orders.created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('orders.created_at', '<=', $request->end_date);
        }

        $limit = $request->get('limit', 10);
        $products = $query->limit($limit)->get();

        return response()->json($products);
    }

    public function lowStockReport()
    {
        $products = Product::with('category')
            ->whereColumn('stock', '<=', 'reorder_point')
            ->where('is_active', true)
            ->orderBy('stock', 'asc')
            ->get()
            ->map(function($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'category' => $product->category,
                    'stock_quantity' => $product->stock,
                    'reorder_point' => $product->reorder_point,
                    'price' => $product->price,
                ];
            });

        return response()->json($products);
    }

    public function inventoryReport()
    {
        // Only admin can view full inventory report
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $products = Product::with('category')
            ->where('is_active', true)
            ->get();

        $summary = [
            'total_products' => $products->count(),
            'total_stock_value' => number_format($products->sum(function ($product) {
                return $product->stock * $product->price;
            }), 2, '.', ''),
            'low_stock_count' => $products->filter(function ($product) {
                return $product->stock <= $product->reorder_point;
            })->count(),
            'out_of_stock_count' => $products->where('stock', 0)->count(),
            'products' => $products->map(function($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'category' => $product->category,
                    'stock' => $product->stock,
                    'reorder_point' => $product->reorder_point,
                    'price' => $product->price,
                    'stock_value' => $product->stock * $product->price,
                ];
            }),
        ];

        return response()->json($summary);
    }

    public function revenueExpenseSummary(Request $request)
    {
        // Only admin can view
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'period' => 'nullable|in:daily,weekly,monthly',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $query = Order::query()
            ->where('payment_status', 'paid')
            ->where(function($q) {
                $q->where('is_voided', false)->orWhereNull('is_voided');
            });

        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        } else {
            // Default to current month
            $query->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year);
        }

        $transactions = $query->get();

        $summary = [
            'total_revenue' => number_format($transactions->sum('total_amount'), 2, '.', ''),
            'total_discount_given' => number_format($transactions->sum('discount'), 2, '.', ''),
            'gross_revenue' => number_format($transactions->sum('subtotal'), 2, '.', ''),
            'total_tax_collected' => 0, // Add tax calculation if implemented
            'transaction_count' => $transactions->count(),
            'daily_average' => number_format($transactions->avg('total_amount'), 2, '.', ''),
        ];

        return response()->json($summary);
    }
}
