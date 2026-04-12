<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('discount_rules', function (Blueprint $table) {
            $table->decimal('max_discount_amount', 10, 2)->nullable()->after('min_purchase');
            $table->integer('max_percentage')->nullable()->after('max_discount_amount');
            $table->integer('usage_limit')->nullable()->after('max_percentage');
            $table->integer('usage_count')->default(0)->after('usage_limit');
            $table->json('excluded_product_ids')->nullable()->after('applicable_to');
            $table->boolean('requires_approval')->default(false)->after('excluded_product_ids');
        });
    }

    public function down(): void
    {
        Schema::table('discount_rules', function (Blueprint $table) {
            $table->dropColumn([
                'max_discount_amount',
                'max_percentage',
                'usage_limit',
                'usage_count',
                'excluded_product_ids',
                'requires_approval',
            ]);
        });
    }
};
