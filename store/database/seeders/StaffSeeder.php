<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class StaffSeeder extends Seeder
{
    public function run(): void
    {
        $staff = [
            [
                'name' => 'Anna Rodriguez',
                'email' => 'anna@store.com',
                'password' => Hash::make('password'),
                'role' => 'staff',
                'is_active' => true,
            ],
            [
                'name' => 'Mark Santos',
                'email' => 'mark@store.com',
                'password' => Hash::make('password'),
                'role' => 'staff',
                'is_active' => true,
            ],
            [
                'name' => 'Rico Dela Cruz',
                'email' => 'rico@store.com',
                'password' => Hash::make('password'),
                'role' => 'staff',
                'is_active' => true,
            ],
            [
                'name' => 'Lara Garcia',
                'email' => 'lara@store.com',
                'password' => Hash::make('password'),
                'role' => 'staff',
                'is_active' => true,
            ],
            [
                'name' => 'Carlos Reyes',
                'email' => 'carlos@store.com',
                'password' => Hash::make('password'),
                'role' => 'staff',
                'is_active' => false,
            ],
        ];

        foreach ($staff as $member) {
            User::firstOrCreate(['email' => $member['email']], $member);
        }
    }
}
