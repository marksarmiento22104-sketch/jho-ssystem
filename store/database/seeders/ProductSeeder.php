<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::all();

        $products = [
            // Electronics
            ['name' => 'Wireless Mouse', 'category' => 'Electronics', 'price' => 299.99, 'stock' => 75, 'sku' => 'ELEC-001'],
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
