<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\DamagedItemController;
use App\Http\Controllers\BusinessSettingController;
use App\Http\Controllers\DiscountRuleController;
use App\Http\Controllers\SalesTransactionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\InventoryLogController;
use App\Http\Controllers\PriceHistoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public authentication routes
Route::post('login', [AuthController::class, 'login']);

// Simple test route
Route::get('ping', function() {
    return response()->json(['message' => 'pong', 'time' => now()]);
});

// Test route to check users
Route::get('test-users', function() {
    $users = \App\Models\User::select('email', 'role', 'is_active')->get();
    return response()->json($users);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
    
    // Public data endpoints (both admin and staff can access)
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('products', [ProductController::class, 'index']);
    Route::post('products/search-barcode', [ProductController::class, 'searchByBarcode']);
    Route::post('orders', [OrderController::class, 'store']);
    Route::get('orders', [OrderController::class, 'index']);
    Route::put('orders/{id}/void', [OrderController::class, 'void']);
    
    // Activity logs (filtered by role)
    Route::get('activity-logs', [ActivityLogController::class, 'index']);
    Route::get('activity-logs/{id}', [ActivityLogController::class, 'show']);
    
    // Damaged items
    Route::get('damaged-items', [DamagedItemController::class, 'index']);
    Route::post('damaged-items', [DamagedItemController::class, 'store']);
    
    // Sales transactions
    Route::get('sales-transactions', [SalesTransactionController::class, 'index']);
    Route::post('sales-transactions', [SalesTransactionController::class, 'store']);
    Route::get('sales-transactions/{id}', [SalesTransactionController::class, 'show']);
    
    // Inventory logs (both admin and staff can view their product logs)
    Route::get('products/{productId}/inventory-logs', [InventoryLogController::class, 'index']);
    
    // Price history (both admin and staff can view)
    Route::get('products/{productId}/price-history', [PriceHistoryController::class, 'index']);
    
    // Discount rules (read)
    Route::get('discount-rules', [DiscountRuleController::class, 'index']);
    Route::get('discount-rules/active', [DiscountRuleController::class, 'getActive']);
    
    // Reports
    Route::get('reports/sales', [ReportController::class, 'salesReport']);
    Route::get('reports/top-selling', [ReportController::class, 'topSellingProducts']);
    Route::get('reports/low-stock', [ReportController::class, 'lowStockReport']);
    
    // Business settings (read)
    Route::get('business-settings', [BusinessSettingController::class, 'index']);
    
    // Profile update (any authenticated user)
    Route::put('profile', [UserController::class, 'updateProfile']);
    
    // Admin only endpoints
    Route::middleware('check.role:admin')->group(function () {
        Route::apiResource('categories', CategoryController::class)->except(['index']);
        Route::apiResource('products', ProductController::class)->except(['index']);
        Route::put('products/{product}/stock', [ProductController::class, 'updateStock']);
        Route::apiResource('orders', OrderController::class)->except(['index', 'store']);
        Route::apiResource('users', UserController::class);
        
        // Damaged items approval
        Route::put('damaged-items/{id}/approve', [DamagedItemController::class, 'approve']);
        Route::put('damaged-items/{id}/reject', [DamagedItemController::class, 'reject']);
        
        // Void sales transactions
        Route::put('sales-transactions/{id}/void', [SalesTransactionController::class, 'void']);
        
        // All inventory logs (admin only)
        Route::get('inventory-logs', [InventoryLogController::class, 'all']);
        
        // Business settings
        Route::post('business-settings', [BusinessSettingController::class, 'update']);
        
        // Discount rules
        Route::post('discount-rules', [DiscountRuleController::class, 'store']);
        Route::put('discount-rules/{id}', [DiscountRuleController::class, 'update']);
        Route::delete('discount-rules/{id}', [DiscountRuleController::class, 'destroy']);
        
        // Admin reports
        Route::get('reports/inventory', [ReportController::class, 'inventoryReport']);
        Route::get('reports/revenue-expense', [ReportController::class, 'revenueExpenseSummary']);
    });
});