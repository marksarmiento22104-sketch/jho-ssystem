<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // Always ensure railway admin exists with known password
        DB::table('users')->updateOrInsert(
            ['email' => 'railway@admin.com'],
            [
                'name' => 'Railway Admin',
                'email' => 'railway@admin.com',
                'role' => 'admin',
                'is_active' => 1,
                'password' => '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LvKKxOaL7.YmDxnui', // password123
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // Check if we need to seed other users
        if (DB::table('users')->count() <= 1) {
            DB::table('users')->insertOrIgnore([
                [
                    'id' => 1, 
                    'name' => 'Jholand H. Galicia', 
                    'email' => 'jholand123@gmail.com', 
                    'role' => 'admin', 
                    'is_active' => 1, 
                    'email_verified_at' => null, 
                    'password' => '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LvKKxOaL7.YmDxnui', // password123
                    'two_factor_secret' => null, 
                    'two_factor_recovery_codes' => null, 
                    'two_factor_confirmed_at' => null, 
                    'remember_token' => null, 
                    'created_at' => now(), 
                    'updated_at' => now()
                ],
                [
                    'id' => 9, 
                    'name' => 'Staff User', 
                    'email' => 'staff@gmail.com', 
                    'role' => 'staff', 
                    'is_active' => 1, 
                    'email_verified_at' => null, 
                    'password' => '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LvKKxOaL7.YmDxnui', // password123
                    'two_factor_secret' => null, 
                    'two_factor_recovery_codes' => null, 
                    'two_factor_confirmed_at' => null, 
                    'remember_token' => null, 
                    'created_at' => now(), 
                    'updated_at' => now()
                ],
                [
                    'id' => 11, 
                    'name' => 'Admin User', 
                    'email' => 'admin@gmail.com', 
                    'role' => 'admin', 
                    'is_active' => 1, 
                    'email_verified_at' => null, 
                    'password' => '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LvKKxOaL7.YmDxnui', // password123
                    'two_factor_secret' => null, 
                    'two_factor_recovery_codes' => null, 
                    'two_factor_confirmed_at' => null, 
                    'remember_token' => null, 
                    'created_at' => now(), 
                    'updated_at' => now()
                ]
            ]);
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
}