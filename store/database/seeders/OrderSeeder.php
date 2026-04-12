<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Carbon\Carbon;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        // Skip if orders already exist — prevents duplicate data on redeploy
        if (Order::count() > 0) {
            $this->command->info('Orders already seeded. Skipping.');
            return;
        }

        $products = Product::all();
        $customerNames = [
            'Juan Dela Cruz', 'Maria Santos', 'Jose Reyes', 'Ana Garcia',
            'Pedro Martinez', 'Carmen Flores', 'Roberto Gonzales', 'Sofia Lopez',
            'Miguel Torres', 'Isabella Ramos', 'Carlos Mendoza', 'Lucia Fernandez',
            'Diego Morales', 'Valentina Castro', 'Andres Jimenez', 'Camila Ruiz'
        ];

        // Create orders for the last 5 months
        for ($monthsAgo = 4; $monthsAgo >= 0; $monthsAgo--) {
            $ordersInMonth = rand(15, 25); // 15-25 orders per month
            
            for ($i = 0; $i < $ordersInMonth; $i++) {
                $orderDate = Carbon::now()
                    ->subMonths($monthsAgo)
                    ->addDays(rand(0, 28))
                    ->addHours(rand(8, 20))
                    ->addMinutes(rand(0, 59));

                $paymentMethod = rand(1, 100) > 30 ? 'cash' : (rand(1, 2) == 1 ? 'gcash' : 'card');
                
                // Create order
                $order = Order::create([
                    'customer_name' => $customerNames[array_rand($customerNames)],
                    'payment_method' => $paymentMethod,
                    'reference_number' => $paymentMethod !== 'cash' ? 'ORD-' . strtoupper(uniqid()) : null,
                    'payment_status' => 'paid',
                    'total_amount' => 0, // Will calculate after adding items
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);

                // Add 1-5 random items to the order
                $numItems = rand(1, 5);
                $totalAmount = 0;

                for ($j = 0; $j < $numItems; $j++) {
                    $product = $products->random();
                    $quantity = rand(1, 3);
                    $unitPrice = $product->price;
                    $subtotal = $unitPrice * $quantity;
                    $totalAmount += $subtotal;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'created_at' => $orderDate,
                        'updated_at' => $orderDate,
                    ]);

                    // Update product stock (decrease)
                    $product->decrement('stock', $quantity);
                }

                // Update order total
                $order->update(['total_amount' => $totalAmount]);
            }
        }

        // Create some recent orders for today
        $todayOrders = rand(5, 10);
        for ($i = 0; $i < $todayOrders; $i++) {
            $orderDate = Carbon::today()
                ->addHours(rand(8, 20))
                ->addMinutes(rand(0, 59));

            $paymentMethod = rand(1, 100) > 30 ? 'cash' : (rand(1, 2) == 1 ? 'gcash' : 'card');
            
            $order = Order::create([
                'customer_name' => $customerNames[array_rand($customerNames)],
                'payment_method' => $paymentMethod,
                'reference_number' => $paymentMethod !== 'cash' ? 'ORD-' . strtoupper(uniqid()) : null,
                'payment_status' => 'paid',
                'total_amount' => 0,
                'created_at' => $orderDate,
                'updated_at' => $orderDate,
            ]);

            $numItems = rand(1, 4);
            $totalAmount = 0;

            for ($j = 0; $j < $numItems; $j++) {
                $product = $products->random();
                $quantity = rand(1, 3);
                $unitPrice = $product->price;
                $subtotal = $unitPrice * $quantity;
                $totalAmount += $subtotal;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);

                $product->decrement('stock', $quantity);
            }

            $order->update(['total_amount' => $totalAmount]);
        }
    }
}
