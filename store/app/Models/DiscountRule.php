<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiscountRule extends Model
{
    protected $fillable = [
        'name',
        'type',
        'value',
        'min_purchase',
        'max_discount_amount',
        'max_percentage',
        'usage_limit',
        'usage_count',
        'start_date',
        'end_date',
        'is_active',
        'applicable_to',
        'excluded_product_ids',
        'requires_approval',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_purchase' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'requires_approval' => 'boolean',
        'applicable_to' => 'array',
        'excluded_product_ids' => 'array',
    ];

    public function calculateDiscount($amount)
    {
        $discount = 0;

        if ($this->type === 'percentage') {
            $percentage = $this->value;
            // Apply max percentage cap if set
            if ($this->max_percentage && $percentage > $this->max_percentage) {
                $percentage = $this->max_percentage;
            }
            $discount = ($amount * $percentage) / 100;
        } else {
            $discount = $this->value;
        }

        // Apply max discount amount cap if set
        if ($this->max_discount_amount && $discount > $this->max_discount_amount) {
            $discount = (float) $this->max_discount_amount;
        }

        return $discount;
    }

    public function isValid()
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();
        if ($this->start_date && $now->lt($this->start_date)) {
            return false;
        }

        if ($this->end_date && $now->gt($this->end_date)) {
            return false;
        }

        // Check usage limit
        if ($this->usage_limit && $this->usage_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    /**
     * Check if a product is excluded from this discount
     */
    public function isProductExcluded($productId): bool
    {
        if (!$this->excluded_product_ids) {
            return false;
        }
        return in_array($productId, $this->excluded_product_ids);
    }

    /**
     * Increment usage count
     */
    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }
}
