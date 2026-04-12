<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Condiments',      'description' => 'Pepper, salt, mayonnaise',                                                          'is_active' => true],
            ['name' => 'Can goods',       'description' => 'Century tuna, san marino',                                                           'is_active' => true],
            ['name' => 'Fresh foods',     'description' => 'fruits, vegetables, meat, poultry, seafood',                                         'is_active' => true],
            ['name' => 'Bakery products', 'description' => 'Bread, cakes, pastries, cookies, biscuits',                                          'is_active' => true],
            ['name' => 'Dairy products',  'description' => 'Milk, cheese, yogurt, butter, ice cream',                                            'is_active' => true],
            ['name' => 'Frozen foods',    'description' => 'Fish, hotdogs, nuggets',                                                             'is_active' => true],
            ['name' => 'Daily necessities','description' => 'Toothbrush, soap, shampoo, napkin',                                                 'is_active' => true],
            ['name' => 'Others',          'description' => 'Other things that we sell',                                                          'is_active' => true],
            ['name' => 'Instant noodles', 'description' => 'Pre-cooked and dried noodle block, usually made from wheat flour',                   'is_active' => true],
            ['name' => 'Coffee',          'description' => 'Instant coffees, cold coffee',                                                       'is_active' => true],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['name' => $category['name']], $category);
        }
    }
}
