<?php

namespace Database\Seeders;

use App\Models\BusinessSetting;
use Illuminate\Database\Seeder;

class BusinessSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            ['key' => 'business_name',  'value' => 'Soriano Store',                    'type' => 'text'],
            ['key' => 'contact_phone',  'value' => '+63 123 456 7890',                 'type' => 'text'],
            ['key' => 'contact_email',  'value' => 'info@sorianostore.com',            'type' => 'text'],
            ['key' => 'address',        'value' => 'Sample Address, City, Province',   'type' => 'text'],
            ['key' => 'tax_rate',       'value' => '0',                                'type' => 'text'],
        ];

        foreach ($settings as $setting) {
            BusinessSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
