<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BusinessSettingsSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('business_settings')->count() > 0) return;

        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        DB::table('business_settings')->insertOrIgnore([
            ['id' => 1, 'key' => 'business_name', 'value' => 'Soriano Store', 'type' => 'text', 'created_at' => '2025-11-19 15:04:43', 'updated_at' => '2025-11-19 15:04:43'],
            ['id' => 2, 'key' => 'contact_phone', 'value' => '+63 123 456 7890', 'type' => 'text', 'created_at' => '2025-11-19 15:04:43', 'updated_at' => '2025-11-19 15:04:43'],
            ['id' => 3, 'key' => 'contact_email', 'value' => 'info@sorianostore.com', 'type' => 'text', 'created_at' => '2025-11-19 15:04:43', 'updated_at' => '2025-11-19 15:04:43'],
            ['id' => 4, 'key' => 'address', 'value' => 'Sample Address, City, Province', 'type' => 'text', 'created_at' => '2025-11-19 15:04:43', 'updated_at' => '2025-11-19 15:04:43'],
            ['id' => 5, 'key' => 'tax_rate', 'value' => 0, 'type' => 'text', 'created_at' => '2025-11-19 15:04:43', 'updated_at' => '2025-11-19 15:04:43']
        ]);

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
}