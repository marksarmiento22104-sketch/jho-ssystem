<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            BusinessSettingsSeeder::class,
            DiscountRuleSeeder::class,
            SalesTransactionSeeder::class,
            OrderSeeder::class,
            OrderItemSeeder::class,
            SalesTransactionItemSeeder::class,
            DamagedItemSeeder::class,
            InventoryLogSeeder::class,
            PriceHistorySeeder::class,
            ActivityLogSeeder::class,
        ]);
    }
}