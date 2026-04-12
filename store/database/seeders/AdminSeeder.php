<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin accounts (firstOrCreate = safe to run multiple times)
        User::firstOrCreate(['email' => 'admin1@store.com'], [
            'name' => 'Super Admin',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        User::firstOrCreate(['email' => 'admin2@store.com'], [
            'name' => 'Admin Manager',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        User::firstOrCreate(['email' => 'admin3@store.com'], [
            'name' => 'Assistant Admin',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'is_active' => false,
        ]);
    }
}
