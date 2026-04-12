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
                'name'                => 'Senior Citizen Discount',
                'type'                => 'percentage',
                'value'               => 20.00,
                'min_purchase'        => null,
                'max_discount_amount' => null,
                'max_percentage'      => null,
                'start_date'          => null,
                'end_date'            => null,
                'is_active'           => true,
                'applicable_to'       => null,
                'excluded_product_ids'=> null,
                'usage_limit'         => null,
                'usage_count'         => 0,
                'requires_approval'   => false,
            ],
            [
                'name'                => 'PWD Discount',
                'type'                => 'percentage',
                'value'               => 20.00,
                'min_purchase'        => null,
                'max_discount_amount' => null,
                'max_percentage'      => null,
                'start_date'          => null,
                'end_date'            => null,
                'is_active'           => true,
                'applicable_to'       => null,
                'excluded_product_ids'=> null,
                'usage_limit'         => null,
                'usage_count'         => 0,
                'requires_approval'   => false,
            ],
            [
                'name'                => 'Student discount',
                'type'                => 'percentage',
                'value'               => 10.00,
                'min_purchase'        => null,
                'max_discount_amount' => null,
                'max_percentage'      => null,
                'start_date'          => null,
                'end_date'            => null,
                'is_active'           => true,
                'applicable_to'       => null,
                'excluded_product_ids'=> null,
                'usage_limit'         => null,
                'usage_count'         => 0,
                'requires_approval'   => false,
            ],
        ];

        foreach ($rules as $rule) {
            DiscountRule::firstOrCreate(['name' => $rule['name']], $rule);
        }
    }
}
