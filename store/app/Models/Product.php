<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string $price
 * @property int $stock
 * @property int $category_id
 * @property string|null $sku
 * @property string|null $image_path
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \App\Models\Category $category
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\OrderItem[] $orderItems
 */
class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'reorder_point',
        'expiration_date',
        'category_id',
        'sku',
        'barcode',
        'image_path',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        'is_active' => 'boolean',
        'expiration_date' => 'date',
    ];

    /**
     * Check if the product is expired
     */
    public function isExpired(): bool
    {
        if (!$this->expiration_date) {
            return false;
        }
        
        return $this->expiration_date->isPast();
    }

    /**
     * Check if the product is available for sale
     */
    public function isAvailable(): bool
    {
        return $this->is_active && !$this->isExpired() && $this->stock > 0;
    }

    /**
     * Scope to get only available products (active, not expired, in stock)
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_active', true)
            ->where(function($q) {
                $q->whereNull('expiration_date')
                  ->orWhere('expiration_date', '>', now());
            })
            ->where('stock', '>', 0);
    }

    /**
     * Scope to get expired products
     */
    public function scopeExpired($query)
    {
        return $query->whereNotNull('expiration_date')
            ->where('expiration_date', '<=', now());
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class);
    }

    public function priceHistories()
    {
        return $this->hasMany(PriceHistory::class);
    }
}