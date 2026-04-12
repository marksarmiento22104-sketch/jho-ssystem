<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('categories')->count() > 0) return;

        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        DB::table('categories')->insertOrIgnore([
            ['id' => 1, 'name' => 'Condiments', 'description' => 'Pepper, salt, mayonnaise', 'is_active' => 1, 'created_at' => '2025-11-05 23:47:57', 'updated_at' => '2025-11-21 03:26:45', 'deleted_at' => null],
            ['id' => 2, 'name' => 'Beverages', 'description' => 'Sodas, alcoholic drinks', 'is_active' => 1, 'created_at' => '2025-11-05 23:53:06', 'updated_at' => '2025-11-25 03:38:48', 'deleted_at' => '2025-11-25 03:38:48'],
            ['id' => 3, 'name' => 'Can goods', 'description' => 'Century tuna, san marino', 'is_active' => 1, 'created_at' => '2025-11-05 23:58:59', 'updated_at' => '2025-11-05 23:58:59', 'deleted_at' => null],
            ['id' => 4, 'name' => 'Fresh foods', 'description' => 'fruits, vegetables, meat, poultry, seafood', 'is_active' => 1, 'created_at' => '2025-11-06 00:17:59', 'updated_at' => '2025-11-06 00:17:59', 'deleted_at' => null],
            ['id' => 5, 'name' => 'Bakery products', 'description' => 'Bread, cakes, pastries, cookies, biscuits', 'is_active' => 1, 'created_at' => '2025-11-06 00:18:35', 'updated_at' => '2025-11-06 00:18:35', 'deleted_at' => null],
            ['id' => 6, 'name' => 'Dairy products', 'description' => 'Milk, cheese, yogurt, butter, ice cream', 'is_active' => 1, 'created_at' => '2025-11-06 00:19:02', 'updated_at' => '2025-11-06 00:19:02', 'deleted_at' => null],
            ['id' => 7, 'name' => 'Frozen foods', 'description' => 'Fish, hotdogs, nuggets', 'is_active' => 1, 'created_at' => '2025-11-06 00:19:35', 'updated_at' => '2025-11-06 00:19:35', 'deleted_at' => null],
            ['id' => 8, 'name' => 'Ready-to-eat', 'description' => 'Instant noodles, instant coffees', 'is_active' => 1, 'created_at' => '2025-11-06 00:20:18', 'updated_at' => '2025-11-25 02:47:29', 'deleted_at' => '2025-11-25 02:47:29'],
            ['id' => 9, 'name' => 'Daily necessities', 'description' => 'Toothbrush, soap, shampoo, napkin', 'is_active' => 1, 'created_at' => '2025-11-06 00:27:44', 'updated_at' => '2025-11-20 14:20:50', 'deleted_at' => null],
            ['id' => 10, 'name' => 'Others', 'description' => 'Other things that we sell', 'is_active' => 1, 'created_at' => '2025-11-21 00:59:18', 'updated_at' => '2025-11-21 00:59:18', 'deleted_at' => null],
            ['id' => 11, 'name' => 'Instant noodles', 'description' => 'Pre-cooked and dried noodle block, usually made from wheat flour, that are sold with flavor packets of seasoning powder and/or oil.', 'is_active' => 1, 'created_at' => '2025-11-25 02:53:13', 'updated_at' => '2025-11-25 02:53:13', 'deleted_at' => null],
            ['id' => 12, 'name' => 'Coffee', 'description' => 'Instant coffees, cold coffee', 'is_active' => 1, 'created_at' => '2025-11-25 03:39:38', 'updated_at' => '2025-11-25 03:39:38', 'deleted_at' => null]
        ]);

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
}