<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PriceHistorySeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('price_histories')->count() > 0) return;

        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        DB::table('price_histories')->insertOrIgnore([
            ['id' => 1, 'product_id' => 4, 'old_price' => '32.00', 'new_price' => '35.00', 'inflation_rate' => '9.3750', 'reason' => 'Price updated via product edit', 'changed_by' => 11, 'created_at' => '2026-04-12 13:27:13', 'updated_at' => '2026-04-12 13:27:13']
        ]);

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
}