<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property string $customer_name
 * @property int|null $user_id
 * @property string $total_amount
 * @property string $payment_method
 * @property string $amount_paid
 * @property string $change_amount
 * @property string $status
 * @property string $order_status
 * @property string $payment_status
 * @property string|null $reference_number
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\OrderItem[] $items
 * @property-read \App\Models\User|null $user
 */
class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_name',
        'user_id',
        'total_amount',
        'subtotal',
        'discount',
        'discount_type',
        'discount_value',
        'discount_category',
        'payment_method',
        'amount_paid',
        'change_amount',
        'status',
        'payment_status',
        'order_status',
        'notes',
        'reference_number',
        'is_voided',
        'voided_by',
        'voided_at',
        'void_reason',
        'sales_transaction_id',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'is_voided' => 'boolean',
        'voided_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function voidedByUser()
    {
        return $this->belongsTo(User::class, 'voided_by');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($order) {
            // Only generate reference number for non-cash payments
            if ($order->payment_method !== 'cash') {
                $order->reference_number = 'ORD-' . strtoupper(uniqid());
            } else {
                $order->reference_number = null;
            }
        });
    }
}