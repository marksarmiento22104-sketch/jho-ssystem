<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class StaffSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(['email' => 'staff@gmail.com'], [
            'name'      => 'staff',
            'password'  => Hash::make('staff123'),
            'role'      => 'staff',
            'is_active' => true,
        ]);
    }
}
