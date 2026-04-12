<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function index(): JsonResponse
    {
        $today = Carbon::today();
        
        // Today's sales (exclude voided)
        $todaysSales = Order::whereDate('created_at', $today)
            ->where('payment_status', 'paid')
            ->where(function($q) {
                $q->where('is_voided', false)->orWhereNull('is_voided');
            })
            ->sum('total_amount');

        // Today's transactions count (exclude voided)
        $todaysTransactions = Order::whereDate('created_at', $today)
            ->where(function($q) {
                $q->where('is_voided', false)->orWhereNull('is_voided');
            })
            ->count();

        // Calculate profit (assuming 30% margin for simplicity)
        $todaysProfit = $todaysSales * 0.30;

        // Active staff count
        $activeStaff = User::where('role', 'staff')
            ->where('is_active', true)
            ->count();

        // Sales trend (last 5 months, exclude voided)
        $salesTrend = DB::table('orders')
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%b") as name'),
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(total_amount) as sales')
            )
            ->where('payment_status', 'paid')
            ->where(function($q) {
                $q->where('is_voided', false)->orWhereNull('is_voided');
            })
            ->where('created_at', '>=', Carbon::now()->subMonths(5))
            ->whereNull('deleted_at')
            ->groupBy(DB::raw('YEAR(created_at)'), DB::raw('MONTH(created_at)'), DB::raw('DATE_FORMAT(created_at, "%b")'))
            ->orderBy(DB::raw('YEAR(created_at)'), 'asc')
            ->orderBy(DB::raw('MONTH(created_at)'), 'asc')
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->name,
                    'sales' => $item->sales
                ];
            });

        // Product breakdown by category
        $productBreakdown = DB::table('categories')
            ->select('categories.name', DB::raw('COUNT(products.id) as value'))
            ->leftJoin('products', function($join) {
                $join->on('categories.id', '=', 'products.category_id')
                     ->where('products.is_active', '=', true)
                     ->whereNull('products.deleted_at');
            })
            ->whereNull('categories.deleted_at')
            ->groupBy('categories.name')
            ->get();

        // Top selling products (exclude voided)
        $topProducts = DB::table('products')
            ->select('products.name', DB::raw('SUM(order_items.quantity) as sales'))
            ->join('order_items', 'products.id', '=', 'order_items.product_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.payment_status', 'paid')
            ->where(function($q) {
                $q->where('orders.is_voided', false)->orWhereNull('orders.is_voided');
            })
            ->whereNull('products.deleted_at')
            ->whereNull('orders.deleted_at')
            ->groupBy('products.name')
            ->orderByDesc('sales')
            ->limit(5)
            ->get();

        // Inventory status by category (stock percentage)
        $inventoryStatus = DB::table('categories')
            ->select(
                'categories.name as category',
                DB::raw('AVG(CASE WHEN products.stock > 50 THEN 80 WHEN products.stock > 20 THEN 55 WHEN products.stock > 10 THEN 40 ELSE 20 END) as stock')
            )
            ->leftJoin('products', function($join) {
                $join->on('categories.id', '=', 'products.category_id')
                     ->where('products.is_active', '=', true)
                     ->whereNull('products.deleted_at');
            })
            ->whereNull('categories.deleted_at')
            ->groupBy('categories.name')
            ->get();

        // Recent transactions (last 10, exclude voided)
        $recentTransactions = Order::with(['items.product'])
            ->where(function($q) {
                $q->where('is_voided', false)->orWhereNull('is_voided');
            })
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'customer' => $order->customer_name,
                    'items_count' => $order->items->count(),
                    'total' => $order->total_amount,
                    'date' => $order->created_at->format('Y-m-d'),
                    'payment_method' => $order->payment_method,
                ];
            });

        return response()->json([
            'summary' => [
                'todays_sales' => number_format($todaysSales, 2),
                'transactions' => $todaysTransactions,
                'profit' => number_format($todaysProfit, 2),
                'active_staff' => $activeStaff,
            ],
            'sales_trend' => $salesTrend,
            'product_breakdown' => $productBreakdown,
            'top_products' => $topProducts,
            'inventory_status' => $inventoryStatus,
            'recent_transactions' => $recentTransactions,
        ]);
    }
}
