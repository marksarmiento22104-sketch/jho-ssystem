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

        DB::table('users')->insertOrIgnore([
            ['id' => 1, 'name' => 'Jholand H. Galicia', 'email' => 'jholand123@gmail.com', 'role' => 'admin', 'is_active' => 1, 'email_verified_at' => null, 'password' => '$2y$12$cwmQISOV9hipHXPQr1dCFuDdZIMgBM8Icr/rmawPg0WvIUJRdQ/QS', 'two_factor_secret' => null, 'two_factor_recovery_codes' => null, 'two_factor_confirmed_at' => null, 'remember_token' => null, 'created_at' => '2025-11-05 23:51:23', 'updated_at' => '2025-11-21 03:30:17'],
            ['id' => 9, 'name' => 'staff', 'email' => 'staff@gmail.com', 'role' => 'staff', 'is_active' => 1, 'email_verified_at' => null, 'password' => '$2y$12$RUN.CN5tCCsi8Nw0qgtyOeOtvZZ3UvMiaJYe4MPQFRnDrYqgGqmdm', 'two_factor_secret' => null, 'two_factor_recovery_codes' => null, 'two_factor_confirmed_at' => null, 'remember_token' => null, 'created_at' => '2025-11-19 17:52:48', 'updated_at' => '2025-11-20 14:20:17'],
            ['id' => 11, 'name' => 'admin', 'email' => 'admin@gmail.com', 'role' => 'admin', 'is_active' => 1, 'email_verified_at' => null, 'password' => '$2y$12$ENX1jJacVeLiOkUpyoqqpOl/lvvyFazRrXQbs7NGBWNYZLpUOUj0O', 'two_factor_secret' => null, 'two_factor_recovery_codes' => null, 'two_factor_confirmed_at' => null, 'remember_token' => null, 'created_at' => '2025-11-21 00:36:18', 'updated_at' => '2025-11-27 13:51:27']
        ]);

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
}