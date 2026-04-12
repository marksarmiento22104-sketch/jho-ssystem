<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DiscountRuleSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('discount_rules')->count() > 0) return;

        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        DB::table('discount_rules')->insertOrIgnore([
            ['id' => 1, 'name' => 'Senior Citizen Discount', 'type' => 'percentage', 'value' => '20.00', 'min_purchase' => null, 'max_discount_amount' => null, 'max_percentage' => null, 'usage_limit' => null, 'usage_count' => 0, 'start_date' => null, 'end_date' => null, 'is_active' => 1, 'applicable_to' => null, 'excluded_product_ids' => null, 'requires_approval' => 0, 'created_at' => '2025-11-19 18:44:21', 'updated_at' => '2025-11-27 13:58:38'],
            ['id' => 2, 'name' => 'PWD Discount', 'type' => 'percentage', 'value' => '20.00', 'min_purchase' => null, 'max_discount_amount' => null, 'max_percentage' => null, 'usage_limit' => null, 'usage_count' => 0, 'start_date' => null, 'end_date' => null, 'is_active' => 1, 'applicable_to' => null, 'excluded_product_ids' => null, 'requires_approval' => 0, 'created_at' => '2025-11-19 18:44:59', 'updated_at' => '2025-11-27 13:58:22'],
            ['id' => 5, 'name' => 'Student discount', 'type' => 'percentage', 'value' => '10.00', 'min_purchase' => null, 'max_discount_amount' => null, 'max_percentage' => null, 'usage_limit' => null, 'usage_count' => 0, 'start_date' => null, 'end_date' => null, 'is_active' => 1, 'applicable_to' => null, 'excluded_product_ids' => null, 'requires_approval' => 0, 'created_at' => '2025-11-21 00:22:32', 'updated_at' => '2025-12-10 06:00:43']
        ]);

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
}