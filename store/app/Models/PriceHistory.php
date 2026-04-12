<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PriceHistory extends Model
{
    protected $fillable = [
        'product_id',
        'old_price',
        'new_price',
        'inflation_rate',
        'reason',
        'changed_by',
    ];

    protected $casts = [
        'old_price' => 'decimal:2',
        'new_price' => 'decimal:2',
        'inflation_rate' => 'decimal:4',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function changedByUser()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    /**
     * Calculate and record a price change
     */
    public static function record(int $productId, float $oldPrice, float $newPrice, ?string $reason = null, ?int $changedBy = null): self
    {
        $inflationRate = $oldPrice > 0
            ? (($newPrice - $oldPrice) / $oldPrice) * 100
            : 0;

        return self::create([
            'product_id' => $productId,
            'old_price' => $oldPrice,
            'new_price' => $newPrice,
            'inflation_rate' => round($inflationRate, 4),
            'reason' => $reason,
            'changed_by' => $changedBy ?? auth()->id(),
        ]);
    }
}
