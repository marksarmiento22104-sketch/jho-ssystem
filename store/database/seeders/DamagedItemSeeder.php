<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DamagedItemSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('damaged_items')->count() > 0) return;

        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        DB::table('damaged_items')->insertOrIgnore([
            ['id' => 1, 'product_id' => 3, 'reported_by' => 9, 'quantity' => 98, 'reason' => 'expired', 'notes' => null, 'status' => 'approved', 'reviewed_by' => null, 'reviewed_at' => '2025-11-19 18:18:57', 'review_notes' => 'okay', 'created_at' => '2025-11-19 18:00:19', 'updated_at' => '2025-11-19 18:18:57'],
            ['id' => 2, 'product_id' => 2, 'reported_by' => 9, 'quantity' => 12, 'reason' => 'damaged', 'notes' => 'Good evening, Ma\'am/Sir. I\'m reporting a damaged product today and i hope you review immediately', 'status' => 'rejected', 'reviewed_by' => 11, 'reviewed_at' => '2026-04-12 11:27:39', 'review_notes' => 'thank you', 'created_at' => '2025-11-21 00:25:11', 'updated_at' => '2026-04-12 11:27:39'],
            ['id' => 3, 'product_id' => 14, 'reported_by' => 9, 'quantity' => 9, 'reason' => 'damaged', 'notes' => null, 'status' => 'rejected', 'reviewed_by' => 11, 'reviewed_at' => '2025-11-25 03:04:34', 'review_notes' => 'It\'s not damage', 'created_at' => '2025-11-25 03:03:51', 'updated_at' => '2025-11-25 03:04:34'],
            ['id' => 4, 'product_id' => 27, 'reported_by' => 9, 'quantity' => 3, 'reason' => 'damaged', 'notes' => null, 'status' => 'rejected', 'reviewed_by' => 11, 'reviewed_at' => '2026-04-12 11:37:41', 'review_notes' => 'thank you', 'created_at' => '2026-04-12 11:26:00', 'updated_at' => '2026-04-12 11:37:41'],
            ['id' => 5, 'product_id' => 27, 'reported_by' => 9, 'quantity' => 3, 'reason' => 'damaged', 'notes' => null, 'status' => 'pending', 'reviewed_by' => null, 'reviewed_at' => null, 'review_notes' => null, 'created_at' => '2026-04-12 11:26:12', 'updated_at' => '2026-04-12 11:26:12'],
            ['id' => 6, 'product_id' => 27, 'reported_by' => 9, 'quantity' => 3, 'reason' => 'damaged', 'notes' => null, 'status' => 'pending', 'reviewed_by' => null, 'reviewed_at' => null, 'review_notes' => null, 'created_at' => '2026-04-12 11:26:13', 'updated_at' => '2026-04-12 11:26:13'],
            ['id' => 7, 'product_id' => 27, 'reported_by' => 9, 'quantity' => 3, 'reason' => 'damaged', 'notes' => null, 'status' => 'pending', 'reviewed_by' => null, 'reviewed_at' => null, 'review_notes' => null, 'created_at' => '2026-04-12 11:26:13', 'updated_at' => '2026-04-12 11:26:13'],
            ['id' => 8, 'product_id' => 27, 'reported_by' => 9, 'quantity' => 3, 'reason' => 'damaged', 'notes' => null, 'status' => 'pending', 'reviewed_by' => null, 'reviewed_at' => null, 'review_notes' => null, 'created_at' => '2026-04-12 11:26:14', 'updated_at' => '2026-04-12 11:26:14'],
            ['id' => 9, 'product_id' => 27, 'reported_by' => 9, 'quantity' => 3, 'reason' => 'damaged', 'notes' => null, 'status' => 'pending', 'reviewed_by' => null, 'reviewed_at' => null, 'review_notes' => null, 'created_at' => '2026-04-12 11:26:14', 'updated_at' => '2026-04-12 11:26:14'],
            ['id' => 10, 'product_id' => 27, 'reported_by' => 9, 'quantity' => 3, 'reason' => 'damaged', 'notes' => null, 'status' => 'pending', 'reviewed_by' => null, 'reviewed_at' => null, 'review_notes' => null, 'created_at' => '2026-04-12 11:26:15', 'updated_at' => '2026-04-12 11:26:15'],
            ['id' => 11, 'product_id' => 27, 'reported_by' => 9, 'quantity' => 3, 'reason' => 'damaged', 'notes' => null, 'status' => 'pending', 'reviewed_by' => null, 'reviewed_at' => null, 'review_notes' => null, 'created_at' => '2026-04-12 11:26:15', 'updated_at' => '2026-04-12 11:26:15'],
            ['id' => 12, 'product_id' => 27, 'reported_by' => 9, 'quantity' => 3, 'reason' => 'damaged', 'notes' => null, 'status' => 'pending', 'reviewed_by' => null, 'reviewed_at' => null, 'review_notes' => null, 'created_at' => '2026-04-12 11:26:16', 'updated_at' => '2026-04-12 11:26:16'],
            ['id' => 13, 'product_id' => 27, 'reported_by' => 9, 'quantity' => 3, 'reason' => 'damaged', 'notes' => null, 'status' => 'pending', 'reviewed_by' => null, 'reviewed_at' => null, 'review_notes' => null, 'created_at' => '2026-04-12 11:26:16', 'updated_at' => '2026-04-12 11:26:16'],
            ['id' => 14, 'product_id' => 27, 'reported_by' => 9, 'quantity' => 3, 'reason' => 'damaged', 'notes' => null, 'status' => 'pending', 'reviewed_by' => null, 'reviewed_at' => null, 'review_notes' => null, 'created_at' => '2026-04-12 11:26:17', 'updated_at' => '2026-04-12 11:26:17'],
            ['id' => 15, 'product_id' => 27, 'reported_by' => 9, 'quantity' => 3, 'reason' => 'damaged', 'notes' => null, 'status' => 'pending', 'reviewed_by' => null, 'reviewed_at' => null, 'review_notes' => null, 'created_at' => '2026-04-12 11:26:18', 'updated_at' => '2026-04-12 11:26:18'],
            ['id' => 16, 'product_id' => 27, 'reported_by' => 9, 'quantity' => 3, 'reason' => 'damaged', 'notes' => null, 'status' => 'pending', 'reviewed_by' => null, 'reviewed_at' => null, 'review_notes' => null, 'created_at' => '2026-04-12 11:26:18', 'updated_at' => '2026-04-12 11:26:18'],
            ['id' => 17, 'product_id' => 27, 'reported_by' => 9, 'quantity' => 3, 'reason' => 'damaged', 'notes' => null, 'status' => 'pending', 'reviewed_by' => null, 'reviewed_at' => null, 'review_notes' => null, 'created_at' => '2026-04-12 11:26:19', 'updated_at' => '2026-04-12 11:26:19'],
            ['id' => 18, 'product_id' => 27, 'reported_by' => 9, 'quantity' => 3, 'reason' => 'damaged', 'notes' => null, 'status' => 'pending', 'reviewed_by' => null, 'reviewed_at' => null, 'review_notes' => null, 'created_at' => '2026-04-12 11:26:19', 'updated_at' => '2026-04-12 11:26:19'],
            ['id' => 19, 'product_id' => 27, 'reported_by' => 9, 'quantity' => 3, 'reason' => 'damaged', 'notes' => null, 'status' => 'pending', 'reviewed_by' => null, 'reviewed_at' => null, 'review_notes' => null, 'created_at' => '2026-04-12 11:26:20', 'updated_at' => '2026-04-12 11:26:20'],
            ['id' => 20, 'product_id' => 27, 'reported_by' => 9, 'quantity' => 3, 'reason' => 'damaged', 'notes' => null, 'status' => 'pending', 'reviewed_by' => null, 'reviewed_at' => null, 'review_notes' => null, 'created_at' => '2026-04-12 11:26:20', 'updated_at' => '2026-04-12 11:26:20'],
            ['id' => 21, 'product_id' => 27, 'reported_by' => 9, 'quantity' => 3, 'reason' => 'damaged', 'notes' => null, 'status' => 'pending', 'reviewed_by' => null, 'reviewed_at' => null, 'review_notes' => null, 'created_at' => '2026-04-12 11:26:21', 'updated_at' => '2026-04-12 11:26:21'],
            ['id' => 22, 'product_id' => 27, 'reported_by' => 9, 'quantity' => 3, 'reason' => 'damaged', 'notes' => null, 'status' => 'rejected', 'reviewed_by' => 11, 'reviewed_at' => '2026-04-12 11:37:25', 'review_notes' => 'thank you', 'created_at' => '2026-04-12 11:26:21', 'updated_at' => '2026-04-12 11:37:25']
        ]);

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
}