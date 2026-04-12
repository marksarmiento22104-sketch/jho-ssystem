<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InventoryLogSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('inventory_logs')->count() > 0) return;

        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        DB::table('inventory_logs')->insertOrIgnore([
            ['id' => 1, 'product_id' => 4, 'type' => 'in', 'quantity_change' => 90, 'quantity_before' => 10, 'quantity_after' => 100, 'reference_type' => 'Product', 'reference_id' => 4, 'notes' => 'Stock updated via product edit', 'user_id' => 11, 'created_at' => '2026-04-12 12:58:51', 'updated_at' => '2026-04-12 12:58:51'],
            ['id' => 2, 'product_id' => 4, 'type' => 'out', 'quantity_change' => -1, 'quantity_before' => 100, 'quantity_after' => 99, 'reference_type' => 'Order', 'reference_id' => 136, 'notes' => 'POS Sale: Order #136 - 1x', 'user_id' => 11, 'created_at' => '2026-04-12 13:03:09', 'updated_at' => '2026-04-12 13:03:09'],
            ['id' => 3, 'product_id' => 4, 'type' => 'void_return', 'quantity_change' => 1, 'quantity_before' => 99, 'quantity_after' => 100, 'reference_type' => 'Order', 'reference_id' => 136, 'notes' => 'VOID Order #136: Restored 1x Ice cream', 'user_id' => 11, 'created_at' => '2026-04-12 13:18:48', 'updated_at' => '2026-04-12 13:18:48'],
            ['id' => 4, 'product_id' => 4, 'type' => 'in', 'quantity_change' => 10, 'quantity_before' => 100, 'quantity_after' => 110, 'reference_type' => 'StockAdjustment', 'reference_id' => 4, 'notes' => 'new delivery', 'user_id' => 11, 'created_at' => '2026-04-12 13:26:46', 'updated_at' => '2026-04-12 13:26:46'],
            ['id' => 5, 'product_id' => 6, 'type' => 'out', 'quantity_change' => -2, 'quantity_before' => 29, 'quantity_after' => 27, 'reference_type' => 'Order', 'reference_id' => 137, 'notes' => 'POS Sale: Order #137 - 2x', 'user_id' => 9, 'created_at' => '2026-04-12 13:31:00', 'updated_at' => '2026-04-12 13:31:00']
        ]);

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
}