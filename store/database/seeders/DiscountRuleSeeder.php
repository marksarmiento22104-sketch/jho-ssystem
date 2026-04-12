<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DiscountRule;
use Carbon\Carbon;

class DiscountRuleSeeder extends Seeder
{
    public function run(): void
    {
        $rules = [
            [
                'name'               => 'Senior Citizen Discount',
                'type'               => 'percentage',
                'value'              => 20.00,
                'min_purchase'       => null,
                'max_discount_amount'=> 500.00,
                'max_percentage'     => 20,
                'start_date'         => null,
                'end_date'           => null,
                'is_active'          => true,
                'applicable_to'      => null,
                'excluded_product_ids'=> null,
                'usage_limit'        => null,
                'usage_count'        => 0,
                'requires_approval'  => false,
            ],
            [
                'name'               => 'PWD Discount',
                'type'               => 'percentage',
                'value'              => 20.00,
                'min_purchase'       => null,
                'max_discount_amount'=> 500.00,
                'max_percentage'     => 20,
                'start_date'         => null,
                'end_date'           => null,
                'is_active'          => true,
                'applicable_to'      => null,
                'excluded_product_ids'=> null,
                'usage_limit'        => null,
                'usage_count'        => 0,
                'requires_approval'  => false,
            ],
            [
                'name'               => 'Bulk Purchase (5% off ₱500+)',
                'type'               => 'percentage',
                'value'              => 5.00,
                'min_purchase'       => 500.00,
                'max_discount_amount'=> null,
                'max_percentage'     => null,
                'start_date'         => null,
                'end_date'           => null,
                'is_active'          => true,
                'applicable_to'      => null,
                'excluded_product_ids'=> null,
                'usage_limit'        => null,
                'usage_count'        => 0,
                'requires_approval'  => false,
            ],
            [
                'name'               => '₱50 Off on ₱300+ Purchase',
                'type'               => 'fixed',
                'value'              => 50.00,
                'min_purchase'       => 300.00,
                'max_discount_amount'=> null,
                'max_percentage'     => null,
                'start_date'         => null,
                'end_date'           => null,
                'is_active'          => true,
                'applicable_to'      => null,
                'excluded_product_ids'=> null,
                'usage_limit'        => null,
                'usage_count'        => 0,
                'requires_approval'  => false,
            ],
            [
                'name'               => 'Staff Discount (10%)',
                'type'               => 'percentage',
                'value'              => 10.00,
                'min_purchase'       => null,
                'max_discount_amount'=> 200.00,
                'max_percentage'     => 10,
                'start_date'         => null,
                'end_date'           => null,
                'is_active'          => true,
                'applicable_to'      => null,
                'excluded_product_ids'=> null,
                'usage_limit'        => null,
                'usage_count'        => 0,
                'requires_approval'  => true,
            ],
        ];

        foreach ($rules as $rule) {
            DiscountRule::firstOrCreate(['name' => $rule['name']], $rule);
        }
    }
}
