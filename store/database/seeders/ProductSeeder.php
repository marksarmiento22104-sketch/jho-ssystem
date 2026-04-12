<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Map category names to IDs dynamically
        $cat = Category::pluck('id', 'name');

        $products = [
            // Condiments
            ['name' => 'Salt',                     'category' => 'Condiments',       'price' => 5.00,   'stock' => 999, 'reorder_point' => 10, 'sku' => null, 'barcode' => null,              'expiration_date' => null,         'is_active' => true],

            // Can goods
            ['name' => 'San marino',               'category' => 'Can goods',         'price' => 35.00,  'stock' => 50,  'reorder_point' => 10, 'sku' => null, 'barcode' => null,              'expiration_date' => null,         'is_active' => true],
            ['name' => 'Century Tuna',             'category' => 'Can goods',         'price' => 35.00,  'stock' => 50,  'reorder_point' => 10, 'sku' => null, 'barcode' => null,              'expiration_date' => null,         'is_active' => true],

            // Dairy products
            ['name' => 'Ice cream',                'category' => 'Dairy products',    'price' => 35.00,  'stock' => 110, 'reorder_point' => 10, 'sku' => null, 'barcode' => null,              'expiration_date' => null,         'is_active' => true],
            ['name' => 'Birch tree',               'category' => 'Dairy products',    'price' => 8.00,   'stock' => 100, 'reorder_point' => 10, 'sku' => null, 'barcode' => null,              'expiration_date' => null,         'is_active' => true],

            // Frozen foods
            ['name' => 'Tocino',                   'category' => 'Frozen foods',      'price' => 40.00,  'stock' => 47,  'reorder_point' => 10, 'sku' => null, 'barcode' => null,              'expiration_date' => null,         'is_active' => true],
            ['name' => 'Shrimp',                   'category' => 'Frozen foods',      'price' => 100.00, 'stock' => 9,   'reorder_point' => 10, 'sku' => null, 'barcode' => null,              'expiration_date' => null,         'is_active' => true],

            // Daily necessities
            ['name' => "Sister's violet",          'category' => 'Daily necessities', 'price' => 60.00,  'stock' => 27,  'reorder_point' => 10, 'sku' => null, 'barcode' => null,              'expiration_date' => null,         'is_active' => true],
            ['name' => 'Toothbrush',               'category' => 'Daily necessities', 'price' => 12.00,  'stock' => 18,  'reorder_point' => 10, 'sku' => null, 'barcode' => null,              'expiration_date' => null,         'is_active' => true],
            ['name' => 'Tissue',                   'category' => 'Daily necessities', 'price' => 10.00,  'stock' => 88,  'reorder_point' => 10, 'sku' => null, 'barcode' => '4809012063142',   'expiration_date' => null,         'is_active' => true],

            // Others
            ['name' => 'Handkerchief',             'category' => 'Others',            'price' => 25.00,  'stock' => 15,  'reorder_point' => 10, 'sku' => null, 'barcode' => null,              'expiration_date' => null,         'is_active' => true],
            ['name' => "Nature's Spring (small)",  'category' => 'Others',            'price' => 10.00,  'stock' => 98,  'reorder_point' => 10, 'sku' => null, 'barcode' => '4800049720107',   'expiration_date' => null,         'is_active' => true],
            ['name' => "Nature's Spring (large)",  'category' => 'Others',            'price' => 15.00,  'stock' => 98,  'reorder_point' => 10, 'sku' => null, 'barcode' => '4800049720114',   'expiration_date' => null,         'is_active' => true],
            ['name' => 'Charger',                  'category' => 'Others',            'price' => 50.00,  'stock' => 100, 'reorder_point' => 10, 'sku' => null, 'barcode' => '868677066286218', 'expiration_date' => null,         'is_active' => true],
            ['name' => 'Pocari Sweat',             'category' => 'Others',            'price' => 25.00,  'stock' => 93,  'reorder_point' => 10, 'sku' => null, 'barcode' => '8997035600010',   'expiration_date' => null,         'is_active' => true],
            ['name' => 'Wilkins Pure',             'category' => 'Others',            'price' => 25.00,  'stock' => 100, 'reorder_point' => 10, 'sku' => null, 'barcode' => '4801981119981',   'expiration_date' => null,         'is_active' => true],

            // Instant noodles
            ['name' => 'Chilimansi Pancit Canton', 'category' => 'Instant noodles',   'price' => 18.00,  'stock' => 50,  'reorder_point' => 10, 'sku' => null, 'barcode' => null,              'expiration_date' => '2027-06-24', 'is_active' => true],
            ['name' => 'Calamansi Pancit Canton',  'category' => 'Instant noodles',   'price' => 18.00,  'stock' => 50,  'reorder_point' => 10, 'sku' => null, 'barcode' => null,              'expiration_date' => '2027-06-24', 'is_active' => true],
            ['name' => 'Spicy Pancit Canton',      'category' => 'Instant noodles',   'price' => 18.00,  'stock' => 49,  'reorder_point' => 10, 'sku' => null, 'barcode' => null,              'expiration_date' => '2027-06-24', 'is_active' => true],
            ['name' => 'Lucky me! Chicken',        'category' => 'Instant noodles',   'price' => 18.00,  'stock' => 50,  'reorder_point' => 10, 'sku' => null, 'barcode' => null,              'expiration_date' => '2027-06-24', 'is_active' => true],
            ['name' => 'Lucky me! Beef',           'category' => 'Instant noodles',   'price' => 18.00,  'stock' => 50,  'reorder_point' => 10, 'sku' => null, 'barcode' => null,              'expiration_date' => '2027-06-24', 'is_active' => true],

            // Coffee
            ['name' => 'Nescafe Creamy White',     'category' => 'Coffee',            'price' => 16.00,  'stock' => 100, 'reorder_point' => 10, 'sku' => null, 'barcode' => null,              'expiration_date' => '2027-08-11', 'is_active' => true],
            ['name' => 'Nescafe Original',         'category' => 'Coffee',            'price' => 16.00,  'stock' => 100, 'reorder_point' => 10, 'sku' => null, 'barcode' => null,              'expiration_date' => null,         'is_active' => true],
            ['name' => 'Nescafe Creamy Latte',     'category' => 'Coffee',            'price' => 16.00,  'stock' => 100, 'reorder_point' => 10, 'sku' => null, 'barcode' => null,              'expiration_date' => null,         'is_active' => true],
        ];

        foreach ($products as $data) {
            $categoryId = $cat[$data['category']] ?? null;
            if (!$categoryId) continue;

            Product::firstOrCreate(
                ['name' => $data['name'], 'category_id' => $categoryId],
                [
                    'description'     => null,
                    'price'           => $data['price'],
                    'stock'           => $data['stock'],
                    'reorder_point'   => $data['reorder_point'],
                    'sku'             => $data['sku'],
                    'barcode'         => $data['barcode'],
                    'expiration_date' => $data['expiration_date'],
                    'is_active'       => $data['is_active'],
                    'image_path'      => null,
                ]
            );
        }
    }
}

            ['name' => 'USB Cable', 'category' => 'Electronics', 'price' => 149.99, 'stock' => 120, 'sku' => 'ELEC-002'],
            ['name' => 'Bluetooth Speaker', 'category' => 'Electronics', 'price' => 899.99, 'stock' => 45, 'sku' => 'ELEC-003'],
            ['name' => 'Phone Charger', 'category' => 'Electronics', 'price' => 249.99, 'stock' => 90, 'sku' => 'ELEC-004'],
            ['name' => 'Headphones', 'category' => 'Electronics', 'price' => 1299.99, 'stock' => 35, 'sku' => 'ELEC-005'],
            
            // Clothing
            ['name' => 'T-Shirt', 'category' => 'Clothing', 'price' => 199.99, 'stock' => 100, 'sku' => 'CLO-001'],
            ['name' => 'Jeans', 'category' => 'Clothing', 'price' => 599.99, 'stock' => 60, 'sku' => 'CLO-002'],
            ['name' => 'Sneakers', 'category' => 'Clothing', 'price' => 1499.99, 'stock' => 40, 'sku' => 'CLO-003'],
            ['name' => 'Cap', 'category' => 'Clothing', 'price' => 149.99, 'stock' => 80, 'sku' => 'CLO-004'],
            ['name' => 'Jacket', 'category' => 'Clothing', 'price' => 899.99, 'stock' => 30, 'sku' => 'CLO-005'],
            
            // Food & Beverages
            ['name' => 'Chips', 'category' => 'Food & Beverages', 'price' => 45.00, 'stock' => 200, 'sku' => 'FOOD-001'],
            ['name' => 'Soda', 'category' => 'Food & Beverages', 'price' => 35.00, 'stock' => 150, 'sku' => 'FOOD-002'],
            ['name' => 'Chocolate Bar', 'category' => 'Food & Beverages', 'price' => 25.00, 'stock' => 180, 'sku' => 'FOOD-003'],
            ['name' => 'Bottled Water', 'category' => 'Food & Beverages', 'price' => 20.00, 'stock' => 250, 'sku' => 'FOOD-004'],
            ['name' => 'Energy Drink', 'category' => 'Food & Beverages', 'price' => 55.00, 'stock' => 100, 'sku' => 'FOOD-005'],
            
            // Home & Garden
            ['name' => 'Garden Hose', 'category' => 'Home & Garden', 'price' => 399.99, 'stock' => 25, 'sku' => 'HOME-001'],
            ['name' => 'Plant Pot', 'category' => 'Home & Garden', 'price' => 89.99, 'stock' => 70, 'sku' => 'HOME-002'],
            ['name' => 'LED Bulb', 'category' => 'Home & Garden', 'price' => 79.99, 'stock' => 150, 'sku' => 'HOME-003'],
            ['name' => 'Door Mat', 'category' => 'Home & Garden', 'price' => 199.99, 'stock' => 40, 'sku' => 'HOME-004'],
            ['name' => 'Tool Set', 'category' => 'Home & Garden', 'price' => 1299.99, 'stock' => 20, 'sku' => 'HOME-005'],
            
            // Sports & Outdoors
            ['name' => 'Basketball', 'category' => 'Sports & Outdoors', 'price' => 499.99, 'stock' => 35, 'sku' => 'SPORT-001'],
            ['name' => 'Yoga Mat', 'category' => 'Sports & Outdoors', 'price' => 299.99, 'stock' => 50, 'sku' => 'SPORT-002'],
            ['name' => 'Dumbbells', 'category' => 'Sports & Outdoors', 'price' => 899.99, 'stock' => 25, 'sku' => 'SPORT-003'],
            ['name' => 'Jump Rope', 'category' => 'Sports & Outdoors', 'price' => 149.99, 'stock' => 60, 'sku' => 'SPORT-004'],
            ['name' => 'Water Bottle', 'category' => 'Sports & Outdoors', 'price' => 199.99, 'stock' => 80, 'sku' => 'SPORT-005'],
            
            // Books & Stationery
            ['name' => 'Notebook', 'category' => 'Books & Stationery', 'price' => 59.99, 'stock' => 120, 'sku' => 'BOOK-001'],
            ['name' => 'Pen Set', 'category' => 'Books & Stationery', 'price' => 99.99, 'stock' => 100, 'sku' => 'BOOK-002'],
            ['name' => 'Calculator', 'category' => 'Books & Stationery', 'price' => 299.99, 'stock' => 45, 'sku' => 'BOOK-003'],
            ['name' => 'Highlighters', 'category' => 'Books & Stationery', 'price' => 79.99, 'stock' => 90, 'sku' => 'BOOK-004'],
            ['name' => 'Sticky Notes', 'category' => 'Books & Stationery', 'price' => 49.99, 'stock' => 150, 'sku' => 'BOOK-005'],
        ];

        foreach ($products as $productData) {
            $category = $categories->where('name', $productData['category'])->first();

            if ($category) {
                Product::firstOrCreate(
                    ['sku' => $productData['sku']],
                    [
                        'name'         => $productData['name'],
                        'description'  => 'High quality ' . strtolower($productData['name']),
                        'price'        => $productData['price'],
                        'stock'        => $productData['stock'],
                        'reorder_point'=> 10,
                        'category_id'  => $category->id,
                        'is_active'    => true,
                    ]
                );
            }
        }
    }
}
