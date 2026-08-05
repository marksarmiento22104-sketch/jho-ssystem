<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('users')->count() > 0) return;

        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // Create accounts with known password: "password123"
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

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
}