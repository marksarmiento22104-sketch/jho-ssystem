<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Create Railway admin if not exists
        $exists = DB::table('users')->where('email', 'railway@admin.com')->exists();
        
        if (!$exists) {
            DB::table('users')->insert([
                'name' => 'Railway Admin',
                'email' => 'railway@admin.com',
                'password' => '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LvKKxOaL7.YmDxnui', // password123
                'role' => 'admin',
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('users')->where('email', 'railway@admin.com')->delete();
    }
};
