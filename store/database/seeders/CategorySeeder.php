<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Electronics',       'description' => 'Electronic devices and accessories',    'is_active' => true],
            ['name' => 'Clothing',          'description' => 'Fashion and apparel items',               'is_active' => true],
            ['name' => 'Food & Beverages',  'description' => 'Snacks, drinks, and food items',          'is_active' => true],
            ['name' => 'Home & Garden',     'description' => 'Home improvement and garden supplies',    'is_active' => true],
            ['name' => 'Sports & Outdoors', 'description' => 'Sporting goods and outdoor equipment',    'is_active' => true],
            ['name' => 'Books & Stationery','description' => 'Books, office supplies, and stationery',  'is_active' => true],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['name' => $category['name']], $category);
        }
    }
}
